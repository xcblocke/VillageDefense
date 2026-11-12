import { _decorator, Label, Layout, Node, tween } from 'cc';
import { Controller } from 'db://assets/script/dlspace/components/Controller';
import { FightContainer } from 'db://assets/script/gaming/FightContainer';
import { WeaponType } from '../../utils/Model';
import { HeroUnit } from './HeroUnit';
import { MonsterUnit } from './MonsterUnit';
import { WeaponUnit } from './WeaponUnit';
const { ccclass, property } = _decorator;

@ccclass('HeroController')
export class HeroController extends Controller {

    @property(HeroUnit)
    hero: HeroUnit;

    @property(Label)
    bulletCountLabel: Label;

    @property(Node)
    weapons: Node;

    private _fight: FightContainer;
    private _bulletCount = 0;
    private _weaponMap: Map<WeaponType, WeaponUnit> = new Map();
    private _targetMonster: MonsterUnit = null;

    init(fight: FightContainer) {
        this._fight = fight;
        this.hero.init(fight);
        this.hero.node.uiTransfrom.priority = 0;

        let weapons = this.weapons.getComponentsInChildren(WeaponUnit);
        for (const weapon of weapons) {
            this._weaponMap.set(weapon.type, weapon);
            weapon.node.active = false;
        }
        let weapon = this._weaponMap.get(WeaponType.Weapon_1);
        weapon.node.active = true;
        weapon.init(fight);
    }

    getWeapons() {
        let types: WeaponType[] = [];
        for (const unit of this._weaponMap.values()) {
            if (unit.node.active) {
                types.push(unit.type);
            }
        }
        return types;
    }

    getWeapon(weaponType: WeaponType): WeaponUnit | null {
        return this._weaponMap.get(weaponType) || null;
    }

    activeWeapon(weaponType: WeaponType, fromIco: Node, call: Function) {
        let weapon = this._weaponMap.get(weaponType);
        if (!!weapon && !weapon.node.active) {
            weapon.node.active = true;
            weapon.node.setSiblingIndex(-1);
            if (!!fromIco) {
                weapon.node.opacity = 0;
                this.weapons.getComponent(Layout).updateLayout();
                tween(fromIco).to(1, { worldPosition: weapon.node.worldPosition, worldScale: weapon.node.worldScale }, { easing: 'backOut' }).call(() => {
                    weapon.node.opacity = 255;
                    weapon.init(this._fight);
                    call && call();
                }).start();
            }
            else {
                weapon.init(this._fight);
            }
        }
    }

    addBulletCount(count = 1) {
        this._bulletCount += count;
    }

    subtractBulletCount(): boolean {
        if (this._bulletCount > 0) {
            this._bulletCount--;
            return true;
        }
        return false;
    }

    getTargetMonster(): MonsterUnit | null {
        if (!!this._targetMonster && this._targetMonster.willDie()) {
            this._targetMonster = null;
        }
        if (!this._targetMonster) {
            let monsters = this._fight.monsterController.getMonsters();
            for (const monster of monsters) {
                if (monster.willDie() || !monster.didShow()) continue;
                this._targetMonster = monster;
                break;
            }
        }
        return this._targetMonster;
    }

    getNearbyMonsters(targetMonster: MonsterUnit, searchWidth: number, searchHeight: number): MonsterUnit[] {
        let targetPosition = targetMonster.node.position;
        let result: MonsterUnit[] = [];
        let monsters = this._fight.monsterController.getMonsters();
        if (monsters.length > 0) {
            let mIndex = monsters.indexOf(targetMonster);
            let index = Math.max(0, mIndex);
            let forCount = 0;
            let halfWidth = searchWidth / 2;
            let halfHeight = searchHeight / 2;
            while (1) {
                if (mIndex === index) {
                    index++;
                }
                let monster = monsters[index];
                if (!monster) {
                    break;
                }
                if (!monster.willDie() && monster.didShow()) {
                    let pos = monster.node.position;
                    if (Math.abs(pos.x - targetPosition.x) < halfWidth && Math.abs(pos.y - targetPosition.y) < halfHeight) {
                        result.push(monster);
                    }
                }
                index++;
                forCount++;
                if (forCount > 10) break;
            }
        }
        return result;
    }

    protected update(dt: number): void {
        this.bulletCountLabel.string = this._bulletCount.toString();
    }

}


