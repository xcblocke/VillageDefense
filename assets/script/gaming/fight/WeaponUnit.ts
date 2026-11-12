import { _decorator, AudioClip, Enum, Node, Prefab, tween, v2, Vec2 } from 'cc';
import { NodePoolMgr } from 'db://assets/script/dlspace/common/NodePoolMgr';
import { Controller } from 'db://assets/script/dlspace/components/Controller';
import { FightContainer } from 'db://assets/script/gaming/FightContainer';
import { Core } from 'db://assets/script/global/Core';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { Bundle } from '../../global/Bundle';
import { GameState } from '../../global/IGame';
import { WeaponType } from '../../utils/Model';
import { BulletUnit } from './BulletUnit';
import { IDamageInfo } from './FightUnit';
import { MonsterUnit } from './MonsterUnit';
const { ccclass, property } = _decorator;

let v2_1 = v2();

@ccclass('WeaponUnit')
export class WeaponUnit extends Controller {

    @property(Node)
    rootNode: Node;

    @property(Node)
    fireNode: Node;

    @property(Prefab)
    bulletPrefab: Prefab;

    @property({ type: Enum(WeaponType) })
    type = WeaponType.Weapon_1;

    private _fight: FightContainer;

    private _time = 0;
    private _floatAnimT = 0;

    init(fight: FightContainer) {
        this._fight = fight;
    }

    protected onEnable(): void {
        this.fireNode.opacity = 0;
    }

    update(dt: number) {
        if (!this._fight) return;
        if (Core.game.state !== GameState.Gaming) return;

        let targetMonster = this._fight.heroController.getTargetMonster();
        if (this._time >= 0) {
            if (this._time === 0) {
                if (!!targetMonster) {
                    this._time = -1;

                    let targetPos = targetMonster.bulletToNode.worldPosition;
                    let pos = this.node.worldPosition;
                    v2_1.set(targetPos.x - pos.x, targetPos.y - pos.y).normalize();
                    let oldAngle = this.node.angle;
                    let angle = Vec2.UNIT_Y.signAngle(v2_1) / Math.PI * 180;
                    let angleAnimDuration = Math.abs(angle - oldAngle) / 180 * 0.5;
                    let fn = () => {
                        let monster = this._fight.heroController.getTargetMonster();
                        if (!!monster) {
                            if (this._fight.heroController.subtractBulletCount()) {
                                this._createBullet(monster);
                            }
                            this._time = this._bulletCd();
                        }
                        else {
                            this._time = 0;
                        }
                    };
                    if (angleAnimDuration < 0.033) {
                        this.node.angle = angle;
                        fn();
                    }
                    else {
                        tween(this.node).to(angleAnimDuration, { angle }).call(fn).start();
                    }
                }
            }
            else {
                this._time = Math.max(0, this._time - dt);
            }
        }

        let needFloat = !targetMonster;
        if (needFloat) {
            this._floatAnimT += dt * 0.5;
            let posY = Math.sin(this._floatAnimT * Math.PI) * 10;
            this.rootNode.setPosition(posY, 0, 0);
        }
    }

    private _bulletCd() {
        let cd = 0.5;
        if (this.type === WeaponType.Weapon_1) cd = 0.2;
        else if (this.type === WeaponType.Weapon_2) cd = 1;
        else if (this.type === WeaponType.Weapon_3) cd = 0.1;
        else if (this.type === WeaponType.Weapon_4) cd = 0.3;
        cd /= 1 + Core.game.info.heroInfo.AtkSpeedBonus / 100;
        cd = Math.max(cd, 1 / 30);
        return cd;
    }

    private _createBullet(monster: MonsterUnit) {
        let child = NodePoolMgr.get(this.bulletPrefab);
        child.parent = this._fight.bulletContainer;
        child.worldPosition = this.fireNode.worldPosition;

        let atkTargets = this._getAtkTargets(monster);
        let comp = child.getComponent(BulletUnit);
        comp.init(this._fight, this.type, monster.uid, () => {
            for (const atkTarget of atkTargets) {
                atkTarget.monster.showDamage(atkTarget.info);
            }
        });
        this.fireNode.opacity = 255;
        this.unschedule(this._hideEffect);
        this.scheduleOnce(this._hideEffect, 0.05);

        let audioPath = `bullet-${this.type + 1}`;
        AudioMgr.inst.playOneShot(Bundle.audio.get(audioPath, AudioClip), 0.1);
    }

    private _getAtkTargets(targetMonster: MonsterUnit) {
        type AtkTarget = { monster: MonsterUnit, info: IDamageInfo };
        let damageRatio = 1;
        if (this.type === WeaponType.Weapon_2) {
            damageRatio = 5;
        }
        else if (this.type === WeaponType.Weapon_3) {
            damageRatio = 0.7;
        }
        else if (this.type === WeaponType.Weapon_4) {
            damageRatio = 2;
        }
        let targets: AtkTarget[] = [];
        targets.push({
            monster: targetMonster,
            info: this._fight.heroController.hero.causeDamage(targetMonster, damageRatio),
        });
        if (this.type === WeaponType.Weapon_2) {
            let monsters = this._fight.heroController.getNearbyMonsters(targetMonster, 60, 30);
            for (const m of monsters) {
                targets.push({
                    monster: m,
                    info: this._fight.heroController.hero.causeDamage(m),
                });
            }
        }
        return targets;
    }

    private _hideEffect() {
        this.fireNode.opacity = 0;
    }

}


