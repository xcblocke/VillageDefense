import { _decorator, clamp01 } from 'cc';
import { IdMgr } from 'db://assets/script/dlspace/common/IdMgr';
import { Controller } from 'db://assets/script/dlspace/components/Controller';
import { FightContainer } from 'db://assets/script/gaming/FightContainer';
const { ccclass, property } = _decorator;

export interface IDamageInfo {
    atk: number;
    maxHp: number;
    isCrt: boolean;
}

@ccclass('FightUnit')
export abstract class FightUnit extends Controller {

    protected _fight: FightContainer;
    uid: number;

    private _hp: number = null;
    private _damage: number = null;
    private _hpRatio: number;
    private _hpRatioWill: number;

    init(fight: FightContainer, ...args: any[]) {
        this._fight = fight;
        this.uid = IdMgr.getId(this.constructor);
        this._hpRatio = 1;
        this._hpRatioWill = 1;
    }

    protected onEnable(): void {
        //dl
        // this.node.on(Node.EventType.TOUCH_START, this._onTouchStart, this);
    }

    protected onDisable(): void {
        // this.node.off(Node.EventType.TOUCH_START, this._onTouchStart, this);
    }

    get hpRatio() {
        return clamp01(this._hpRatio);
    }

    willDie() {
        return this._hpRatioWill <= 0;
    }

    addHpRatio(value: number) {
        value = Math.min(value, 1 - this._hpRatio);
        this._hpRatio += value;
        this._hpRatioWill += value;
    }

    causeDamage(target: FightUnit, damageRatio = 1): IDamageInfo | null {
        if (target.willDie()) {
            return null;
        }
        let damage = this.getDamage() * damageRatio;
        let crtDamageBonus = this._getCrtDamageBonus();
        let addDamageBonus = this._getAddDamageBonus();

        let atk = (damage * (1 + crtDamageBonus)) * (1 + addDamageBonus);
        let maxHp = target.getHp();
        atk = Math.round(atk);
        maxHp = Math.round(maxHp);

        target._hpRatioWill = (Math.round(target._hpRatioWill * maxHp) - atk) / maxHp;
        if (target._hpRatioWill <= 0) {
            target._onWillDead();
        }

        let info: IDamageInfo = {
            atk,
            maxHp,
            isCrt: crtDamageBonus > 0,
        };
        return info;
    }

    showDamage(info: IDamageInfo) {
        let { maxHp, atk } = info;
        this._hpRatio = (Math.round(this._hpRatio * maxHp) - atk) / maxHp;

        let dead = this._hpRatio <= 0;
        this._onBeAttack(info, dead);
        if (dead) {
            this._onDead();
        }
    }

    getHp(): number {
        if (this._hp === null) {
            this._hp = this._getHp();
        }
        return this._hp;
    }

    getDamage(): number {
        if (this._damage === null) {
            this._damage = this._getDamage();
        }
        return this._damage;
    }

    updateValues() {
        this._hp = null;
        this._damage = null;
    }

    protected _onTouchStart() {
        console.log({
            hp: this.getHp(),
            damage: this.getDamage(),
            hpRatio: this.hpRatio,
            hpRatioWill: this._hpRatioWill,
        });
    }

    protected abstract _getHp(): number;

    protected abstract _getDamage(): number;

    protected abstract _getCrtDamageBonus(): number;

    protected abstract _getAddDamageBonus(): number;

    protected abstract _onBeAttack(info: IDamageInfo, dead: boolean): void;

    protected abstract _onWillDead(): void;

    protected abstract _onDead(): void;

}


