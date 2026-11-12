import { _decorator, AudioClip, clamp01, Node, Sprite, v3 } from 'cc';
import { HurtEffectController } from 'db://assets/script/controller/HurtEffectController';
import { FightContainer } from 'db://assets/script/gaming/FightContainer';
import { Core } from 'db://assets/script/global/Core';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { GIFController } from '../../dlspace/components/GIFController';
import { Bundle } from '../../global/Bundle';
import { GameState } from '../../global/IGame';
import { addAchievementCount } from '../../utils/GameUtils';
import { MonsterAnimation, MonsterData } from '../other/MonsterData';
import { FightUnit, IDamageInfo } from './FightUnit';
const { ccclass, property } = _decorator;

const MonsterMinX = -520;

@ccclass('MonsterUnit')
export class MonsterUnit extends FightUnit {

    @property(GIFController)
    image: GIFController;

    @property(Node)
    bulletToNode: Node;

    @property(HurtEffectController)
    hurtEffect: HurtEffectController;

    @property
    isBoss = false;

    @property({ type: Node, visible() { return this.isBoss } })
    hpNode: Node;

    @property({ type: Sprite, visible() { return this.isBoss } })
    hpBar: Sprite;

    private _deadCall: Function;
    private _destroyCall: Function;
    private _wave: number;
    private _shadow: Node;

    private _atkEnabled = false;
    private _atkDt = 0;

    private _imageDefaultScale = v3();

    init(fight: FightContainer, wave: number, shadow: Node, deadCall: Function, destroyCall: Function) {
        super.init(fight);
        this._deadCall = deadCall;
        this._destroyCall = destroyCall;
        this._wave = wave;
        this._shadow = shadow;

        this._resetScale();

        if (this.isBoss) {
            this.image.node.position = MonsterData.bossOffset;
        }
        else {
            this.image.node.position = MonsterData.monsterOffset;
        }
        this.image.frame = 24;
        this.image.init(this.isBoss ? MonsterData.bossGIFDatas : MonsterData.monsterGIFDatas);
        this.image.play<MonsterAnimation>('Walking', true);

        this._reloadHpSprite(this.hpRatio);
        if (!!this.hpNode) {
            this.hpNode.active = false;
        }
        this._atkEnabled = false;
        this._atkDt = 0;
    }

    didShow() {
        return this.node.position.x < (MonsterMinX / 4);
    }

    protected onLoad(): void {
        this._imageDefaultScale.set(this.image.node.scale);
    }

    protected update(dt: number): void {
        if (Core.game.state !== GameState.Gaming) return;
        if (this.image.animation === 'Dying') return;

        let defaultSpeed = Core.game.info.monsterInfo.MoveSpeed;
        let pos = this.node.tempPosition;
        let t = Math.getRatio(MonsterMinX / 4, 0, pos.x);
        t = clamp01(t);
        let speed = defaultSpeed + 1000 * t;
        pos.x -= speed * dt;
        if (pos.x < MonsterMinX) {
            pos.x = MonsterMinX;
        }
        else {
            let lastMonster = this._fight.monsterController.getMonster(this.uid - 1);
            if (!!lastMonster && !lastMonster.willDie()) {
                if (Math.abs(lastMonster.node.position.x - pos.x) < 1) {
                    pos.x = lastMonster.node.position.x + 1;
                }
            }
        }
        this.node.position = pos;
        if (!this._atkEnabled && pos.x < (MonsterMinX + 10)) {
            this._atkEnabled = true;
        }

        if (this._atkEnabled) {
            if (this._atkDt >= 0) {
                if (this._atkDt === 0) {
                    let hero = this._fight.heroController.hero;
                    if (hero.willDie() || hero.isDamageImmunity()) {
                        this._atkDt = 0.5;
                    }
                    else {
                        this._atkDt = -1;
                        this._atk(() => {
                            this._atkDt = Core.game.info.monsterInfo.AtkSpeed;
                        });
                    }
                }
                else {
                    this._atkDt = Math.max(0, this._atkDt - dt);
                }
            }
        }
    }

    protected lateUpdate(dt: number): void {
        if (!!this._shadow) {
            this._shadow.position = this.node.tempPosition;
        }
    }

    private _atk(call: Function) {
        let hero = this._fight.heroController.hero;
        this.image.play<MonsterAnimation>('Attacking', false, () => {
            call && call();
            this.image.play<MonsterAnimation>('Walking', true);
        });
        AudioMgr.inst.playOneShot(Bundle.audio.get('monster-atk', AudioClip), 0.1);

        let info = this.causeDamage(hero);
        setTimeout(() => {
            hero.showDamage(info);
        }, this.image.duration * 1000);
    }

    private _reloadHpSprite(hpRatio: number) {
        if (!!this.hpNode) {
            if (!this.hpNode.active) {
                this.hpNode.active = true;
            }
            this.hpBar.fillRange = hpRatio;
        }
    }

    protected _getHp(): number {
        let info = Core.game.info.monsterInfo;
        return (this.isBoss ? info.HpBoss : info.Hp) * (1 + this._wave / 9);
    }

    protected _getDamage(): number {
        let info = Core.game.info.monsterInfo;
        return (this.isBoss ? info.DamageBoss : info.Damage) * (1 + this._wave / 9);
    }

    protected _getCrtDamageBonus(): number {
        return 0;
    }

    protected _getAddDamageBonus(): number {
        return 0;
    }

    protected _onBeAttack(info: IDamageInfo, dead: boolean): void {
        this.hurtEffect.trigger();

        if (!dead) {
            this.image.node.setScale(this._imageDefaultScale);
            this.unschedule(this._resetScale);
            this.scheduleOnce(this._resetScale, 0.1);
            this.image.node.setScale(this.image.node.tempScale.multiplyScalar(1.05));
        }
        this._reloadHpSprite(this.hpRatio);
    }

    private _resetScale() {
        this.image.node.setScale(this._imageDefaultScale);
    }

    protected _onWillDead(): void {
    }

    protected _onDead(): void {
        this._atkEnabled = false;
        this._deadCall && this._deadCall();
        this._deadCall = null;
        this.image.play<MonsterAnimation>('Dying', false, () => {
            this._destroyCall && this._destroyCall();
            this._destroyCall = null;
            this._shadow.destroy();
            this.node.destroy();
        });
        addAchievementCount('killMonster');
    }

}


