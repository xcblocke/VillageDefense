import { _decorator, Node, Rect, v2 } from 'cc';
import { Controller } from '../../dlspace/components/Controller';
import { Core } from '../../global/Core';
import { GameState } from '../../global/IGame';
import { WeaponType } from '../../utils/Model';
import { BottomContainer } from '../BottomContainer';
import { BottomBlockUnit, BottomBlockUnitType } from './BottomBlockUnit';
import { BottomBulletUnit } from './BottomBulletUnit';
import { BottomFloatGift } from './BottomFloatGift';
import { MaxBulletCount } from './FireBottomBulletUnit';
const { ccclass, property } = _decorator;

const v2_1 = v2();

@ccclass('BottomLayoutController')
export class BottomLayoutController extends Controller {

    private _animNode: Node;

    private _worldRect: Rect;

    private _bottom: BottomContainer;
    private _blocks: BottomBlockUnit[] = [];
    private _weapons: WeaponType[] = [];

    init(bottom: BottomContainer) {
        this._bottom = bottom;
        this._blocks = this.getComponentsInChildren(BottomBlockUnit);
        for (const block of this._blocks) {
            if (block.type === BottomBlockUnitType.Gift) {
                let floatGift = block.getComponent(BottomFloatGift);
                floatGift.init(bottom);
                block.value = floatGift.getNewValue();
            }
            else if (block.type === BottomBlockUnitType.AddWeapon) {
                this._weapons.push(block.weaponType);
            }
            block.init(bottom);
        }
    }

    getWeapons() {
        return this._weapons;
    }

    protected onLoad(): void {
        this._animNode = this.node.getChildByName('anim');
        this._worldRect = this.node.uiTransfrom.getBoundingBoxToWorld();
    }

    update(dt: number) {
        if (Core.game.state !== GameState.Gaming) return;

        let map: Map<BottomBulletUnit, BottomBlockUnit> = new Map();
        let bullets = this._bottom.fireUnit.getBullets();
        for (const bullet of bullets) {
            let bulletPos = bullet.node.worldPosition;
            v2_1.set(bulletPos.x, bulletPos.y);
            if (!this._worldRect.contains(v2_1)) {
                continue;
            }
            let aBlock: BottomBlockUnit;
            for (const block of this._blocks) {
                if (!bullet.blockUids.has(block.uid)) {
                    if (block.getRect().contains(v2_1)) {
                        aBlock = block;
                        break;
                    }
                }
            }
            if (!aBlock) {
                continue;
            }
            map.set(bullet, aBlock);
        }

        let skipCreateBullet = bullets.length > MaxBulletCount;
        for (const [bullet, block] of map) {
            if (block.type === BottomBlockUnitType.Multiply) {
                if (!skipCreateBullet) {
                    bullet.blockUids.add(block.uid);
                    let addValue = block.value - 1;
                    for (let i = 0; i < addValue; i++) {
                        this._bottom.fireUnit.createBullet(bullet);
                    }
                }
            }
            else if (block.type === BottomBlockUnitType.Subtract) {
                bullet.remove();
                block.value = Math.max(0, block.value - 1);
                block.updateLabel();
            }
            else if (block.type === BottomBlockUnitType.AddWeapon) {
                bullet.remove();
                block.value = Math.max(0, block.value - 1);

                let weaponIco = block.weaponIco;
                let pos = weaponIco.worldPosition;
                let scale = weaponIco.worldScale;
                weaponIco.parent = this._animNode;
                weaponIco.worldPosition = pos;
                weaponIco.worldScale = scale;
                this._bottom.root.fight.heroController.activeWeapon(block.weaponType, weaponIco, () => {
                    weaponIco.destroy();
                });
            }
            else if (block.type === BottomBlockUnitType.Gift) {
                bullet.remove();
                block.value = Math.max(0, block.value - 1);
                if (block.value <= 0) {
                    let hero = this._bottom.root.fight.heroController.hero;
                    if (hero.willDie()) {
                        block.value = 1;
                    }
                    else {
                        let floatGift = block.getComponent(BottomFloatGift);
                        floatGift.open();
                        block.value = floatGift.getNewValue();
                    }
                }
                block.updateLabel();
            }
        }

        let unuseBlocks = this._blocks.filter(block => block.value <= 0);
        this._blocks = this._blocks.filter(block => block.value > 0);
        for (const block of unuseBlocks) {
            block.remove();
        }
    }
}


