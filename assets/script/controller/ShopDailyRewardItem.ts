import { _decorator, AudioClip, Button, Component, Enum, Label, Node } from 'cc';
import { AudioMgr } from '../dlspace/common/AudioMgr';
import { MsgMgr } from '../dlspace/common/MsgMgr';
import { Bundle } from '../global/Bundle';
import { Core } from '../global/Core';
import { GameAction } from '../global/IGame';
import { addAchievementCount } from '../utils/GameUtils';
const { ccclass, property } = _decorator;

const addGoldValue = 20000;
const addDiamondValue = 100;

export enum MoneyEnum {
    Gold,
    Diamond
}

@ccclass('ShopDailyRewardItem')
export class ShopDailyRewardItem extends Component {

    @property({ type: Enum(MoneyEnum) })
    moneyType = MoneyEnum.Gold;

    private _label: Label;
    private _redDot: Node;
    private _tip: Label;
    private _mask: Node;

    protected onLoad(): void {
        this._label = this.node.getChildByName('label').getComponent(Label);
        this._redDot = this.node.getChildByName('red-dot');
        this._tip = this.node.getChildByName('tip').getComponent(Label);
        this._mask = this.node.getChildByName('mask');

    }
    protected onEnable(): void {
        this.node.on(Button.EventType.CLICK, this._onClick, this);
        MsgMgr.on(GameAction.onDayEnd, this._reload, this);
        this._reload();
    }

    protected onDisable(): void {
        this.node.off(Button.EventType.CLICK, this._onClick, this);
        MsgMgr.off(GameAction.onDayEnd, this._reload, this);
    }

    private _reload() {
        let active = false;
        if (this.moneyType === MoneyEnum.Gold) {
            active = Core.userInfo.day.goldReward;
            this._label.string = `+${addGoldValue}`;
        }
        else if (this.moneyType === MoneyEnum.Diamond) {
            active = Core.userInfo.day.diamondReward;
            this._label.string = `+${addDiamondValue}`;
        }
        this._redDot.active = active;
        this._tip.string = active ? '免费' : '已领取';
        this._mask.active = !active;
    }

    private _onClick() {
        let isFree = this._tip.string === '免费';
        if (!isFree) return;
        if (this.moneyType === MoneyEnum.Gold) {
            Core.userInfo.day.goldReward = false;
            Core.userInfo.gold += addGoldValue;
        }
        else if (this.moneyType === MoneyEnum.Diamond) {
            Core.userInfo.day.diamondReward = false;
            Core.userInfo.diamond += addDiamondValue;
        }
        addAchievementCount('buyInDailyReward');
        this._reload();
        AudioMgr.inst.playOneShot(Bundle.audio.get('add-money', AudioClip));
    }

}


