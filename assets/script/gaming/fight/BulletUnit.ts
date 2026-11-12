import { _decorator, Prefab, tween, v3, Vec3 } from 'cc';
import { Controller } from 'db://assets/script/dlspace/components/Controller';
import { FightContainer } from 'db://assets/script/gaming/FightContainer';
import { NodePoolMgr } from '../../dlspace/common/NodePoolMgr';
import { GIFController } from '../../dlspace/components/GIFController';
import { Bundle } from '../../global/Bundle';
import { WeaponType } from '../../utils/Model';
import { HeroData } from '../other/HeroData';
import { MonsterUnit } from './MonsterUnit';
const { ccclass, property } = _decorator;

const v3_1 = v3();

@ccclass('BulletUnit')
export class BulletUnit extends Controller {

    private _fight: FightContainer;
    private _weaponType: WeaponType;
    private _monsterUid: number;
    private _call: (monster: MonsterUnit) => void;
    private _targetPos = v3();

    init(fight: FightContainer, weaponType: WeaponType, monsterUid: number, call: (monster: MonsterUnit) => void) {
        this._fight = fight;
        this._weaponType = weaponType;
        this._monsterUid = monsterUid;
        this._call = call;

        let monster = this._fight.monsterController.getMonster(this._monsterUid);
        this._targetPos.set(monster.bulletToNode.worldPosition);
        this.node.lookPosition(this._targetPos, true);

        if (this._weaponType === WeaponType.Weapon_4) {
            let distance = Vec3.distance(this.node.worldPosition, this._targetPos);
            let scale = this.node.tempScale;
            scale.y = distance / 100;
            this.node.scale = scale;
            this.node.opacity = 255;
            tween(this.node).delay(0.1).to(0.1, { opacity: 0 }).call(() => {
                this.node.destroy();
            }).start();
            monster && call && call(monster);
        }
    }

    protected update(dt: number): void {
        if (this._weaponType === WeaponType.Weapon_4) return;

        let speed = 1000;
        if (this._weaponType === WeaponType.Weapon_1) {
            speed = 1000;
        }
        else if (this._weaponType === WeaponType.Weapon_2) {
            speed = 600;
        }
        else if (this._weaponType === WeaponType.Weapon_3) {
            speed = 1200;
        }
        let bulletSpeed = speed * dt;
        let monster = this._fight.monsterController.getMonster(this._monsterUid);
        if (!!monster) {
            this._targetPos.set(monster.bulletToNode.worldPosition);
        }

        let diff = v3_1.set(this._targetPos).subtract(this.node.worldPosition);
        let distance = diff.length();
        if (distance < bulletSpeed) {
            monster && this._call && this._call(monster);
            if (this._weaponType === WeaponType.Weapon_2) {
                this._showBoom(this._targetPos);
            }
            this.node.destroy();
        }
        else {
            this.node.worldPosition = diff.normalize().multiplyScalar(bulletSpeed).add(this.node.worldPosition);
        }

    }

    private _showBoom(pos: Vec3) {
        let prefab = Bundle.game.get('prefab/gaming/boom', Prefab);
        let node = NodePoolMgr.get(prefab);
        node.parent = this._fight.boomContainer;
        node.worldPosition = pos;
        let gif = node.getComponentInChildren(GIFController);
        gif.init(HeroData.boomGIFDatas);
        gif.play('animation', false, () => {
            node.destroy();
        });
    }

}


