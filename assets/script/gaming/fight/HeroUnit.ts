import { _decorator, AudioClip, instantiate, Node, Sprite, tween, Tween, v3 } from 'cc';
import { HurtEffectController } from 'db://assets/script/controller/HurtEffectController';
import { FightContainer } from 'db://assets/script/gaming/FightContainer';
import { Core } from 'db://assets/script/global/Core';
import { HeroPropertyDescEnums, HeroPropertyEnums } from '../../config/IConfig';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { MsgMgr } from '../../dlspace/common/MsgMgr';
import { UIMgr } from '../../dlspace/common/UIMgr';
import { Bundle } from '../../global/Bundle';
import { GameState, PlayerMaxAtkSpeedBonus, PlayerMaxCrtChance } from '../../global/IGame';
import { WeaponType } from '../../utils/Model';
import { HeroAction } from '../other/HeroData';
import { FightUnit, IDamageInfo } from './FightUnit';
const { ccclass, property } = _decorator;

@ccclass('HeroUnit')
export class HeroUnit extends FightUnit {

    @property(Sprite)
    image: Sprite;

    @property(Node)
    rotateNode: Node;

    @property(HurtEffectController)
    hurtEffect: HurtEffectController;

    @property(Node)
    hpNode: Node;

    @property(Sprite)
    hpBar: Sprite;

    private _beAttackTween: Tween<Node>;
    private _damageImmunityDuration = 0;

    init(fight: FightContainer): void {
        super.init(fight);
        this._damageImmunityDuration = 0;
        this._reloadHpSprite(this.hpRatio);
        this.hpNode.active = false;
    }

    //是否无敌的，用于阻挡伤害
    isDamageImmunity() {
        return this._damageImmunityDuration > 0;
    }

    protected onEnable(): void {
        super.onEnable();
        MsgMgr.on(HeroAction.addHpRatio, this._addHpRatio, this);
        MsgMgr.on(HeroAction.addProperty, this._addProperty, this);
        MsgMgr.on(HeroAction.addWeapon, this._addWeapon, this);
        MsgMgr.on(HeroAction.addBullet, this._addBullet, this);
        MsgMgr.on(HeroAction.revive, this._revive, this);
    }

    protected onDisable(): void {
        super.onDisable();
        MsgMgr.off(HeroAction.addHpRatio, this._addHpRatio, this);
        MsgMgr.off(HeroAction.addProperty, this._addProperty, this);
        MsgMgr.off(HeroAction.addWeapon, this._addWeapon, this);
        MsgMgr.off(HeroAction.addBullet, this._addBullet, this);
        MsgMgr.off(HeroAction.revive, this._revive, this);
    }

    update(dt: number) {
        this.rotateNode.angle -= dt * 180;
        if (Core.game.state !== GameState.Gaming) return;
        if (this._damageImmunityDuration > 0) {
            this._damageImmunityDuration = Math.max(0, this._damageImmunityDuration - dt);
        }
    }

    protected _onTouchStart(): void {
        super._onTouchStart();
        console.log(Core.game.info);
        console.log(Core.game.info.heroInfo);
        console.log(Core.game.info.monsterInfo);
    }

    private _revive() {
        AudioMgr.inst.playOneShot(Bundle.audio.get('up', AudioClip));
        this._damageImmunityDuration = 2;
        this._addHpRatio(10);
    }

    private _addHpRatio(hpRatio: number) {
        this.addHpRatio(hpRatio);
        this._reloadHpSprite(this.hpRatio);
    }

    private _addProperty(title: string) {
        for (let i = 0; i < HeroPropertyDescEnums.length; i++) {
            const propertyDesc = HeroPropertyDescEnums[i];
            const propertyEnum = HeroPropertyEnums[i];
            const regex = new RegExp(propertyDesc + '\\+(\\d+)%', 'g');
            let match: RegExpExecArray;
            while ((match = regex.exec(title)) !== null) {
                let value = parseInt(match[1], 10);
                let newValue = Core.game.info.heroInfo[propertyEnum];
                newValue += value;
                if (propertyEnum === 'AtkSpeedBonus') {
                    newValue = Math.min(newValue, PlayerMaxAtkSpeedBonus);
                }
                else if (propertyEnum === 'CrtChance') {
                    newValue = Math.min(newValue, PlayerMaxCrtChance);
                }
                Core.game.info.heroInfo[propertyEnum] = newValue;
                this.updateValues();
                break;
            }
        }
    }

    private _addWeapon(type: WeaponType, ico: Sprite) {
        const containerHeight = ico.node.uiTransfrom.contentSize.height;
        let originalSize = ico.spriteFrame.originalSize;
        const imgHeight = originalSize.height;
        const heightRatio = containerHeight / imgHeight;

        let weaponIco = instantiate(ico.node);
        weaponIco.parent = UIMgr.instance.dialogParent;
        weaponIco.uiTransfrom.setContentSize(originalSize.width, originalSize.height);
        weaponIco.worldPosition = ico.node.worldPosition;
        weaponIco.worldScale = ico.node.worldScale;
        weaponIco.scale = weaponIco.tempScale.multiplyScalar(heightRatio);

        this._fight.heroController.activeWeapon(type, weaponIco, () => {
            weaponIco.destroy();
        });
    }

    private _addBullet(count: number, ico: Sprite) {
        let weaponIco = instantiate(ico.node);
        weaponIco.parent = UIMgr.instance.dialogParent;
        weaponIco.worldPosition = ico.node.worldPosition;
        weaponIco.worldScale = ico.node.worldScale;
        let heroController = this._fight.heroController;
        let endPos = this._fight.root.bottom.ventToNode.worldPosition;
        tween(weaponIco).to(0.3, { worldPosition: v3(endPos), scale: v3(0.1, 0.1, 1) }).call(() => {
            heroController.addBulletCount(count);
            weaponIco.destroy();
        }).start();
    }

    private _reloadHpSprite(hpRatio: number) {
        if (!this.hpNode.active) {
            this.hpNode.active = true;
        }
        this.hpBar.fillRange = hpRatio;
    }

    protected _getHp(): number {
        let info = Core.game.info.heroInfo;
        return info.Hp * (1 + info.HpBonus / 100);
    }

    protected _getDamage(): number {
        let info = Core.game.info.heroInfo;
        return info.Damage * (1 + info.DamageBonus / 100);
    }

    protected _getCrtDamageBonus(): number {
        let info = Core.game.info.heroInfo;
        if (Math.randomInt(0, 100) < info.CrtChance) {
            return info.CrtDamageBonus / 100;
        }
        return 0;
    }

    protected _getAddDamageBonus(): number {
        let info = Core.game.info.heroInfo;
        return info.AddDamageBonus / 100;
    }

    protected _onBeAttack(info: IDamageInfo, dead: boolean): void {
        this.hurtEffect.trigger();
        this._reloadHpSprite(this.hpRatio);
        if (!this._beAttackTween) {
            this._beAttackTween = tween(this.image.node).to(0.1, { angle: 5 }).to(0.1, { angle: 0 }).call(() => {
                this._beAttackTween = null;
            }).start();
        }
    }

    protected _onWillDead(): void {
    }

    protected _onDead(): void {
        Core.game.state = GameState.Ended;
    }


}


