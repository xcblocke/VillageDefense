import { _decorator, Button, Label, Node, Prefab } from 'cc';
import { DialogController } from '../../dlspace/components/DialogController';
import { getServerTimestamp } from '../../dlspace/utils/ServerUtils';
import { Utils } from '../../dlspace/utils/Utils';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { TimerInfo } from '../../global/TimerInfo';
import { addAchievementCount, addExp, getOfflineReward, lookAdVideo, openChest } from '../../utils/GameUtils';
import { ShowRewardDialog } from './ShowRewardDialog';
const { ccclass, property } = _decorator;

@ccclass('OfflineRewardDialog')
export class OfflineRewardDialog extends DialogController {

    @property(Label)
    clockLabel: Label;

    @property(Label)
    goldLabel: Label;

    @property(Label)
    expLabel: Label;

    @property(Node)
    rewardItem: Node;

    @property(Button)
    fastGetBtn: Button;

    @property(Label)
    fastGetClock: Label;

    @property(Node)
    fastGetContent: Node;

    @property(Node)
    fastGetBtnMask: Node;

    @property(Button)
    getBtn: Button;

    @property(Label)
    getBtnTitle: Label;

    @property(Node)
    getBtnMask: Node;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/offlineRewardDialog", Prefab);
    }

    open(...args: any[]): void {
        this._fadeInAnim = 'fromTop';
        super.open(...args);
    }

    protected _open() {
        this._reload();
        this.schedule(this._reload, 1);
    }

    private _getReward(seconds: number) {
        let reward = getOfflineReward(seconds);

        Core.userInfo.gold += reward.gold;
        addExp(reward.exp);
        if (reward.chestCount > 0) {
            reward.equipments = openChest(reward.chestCount);
        }

        addAchievementCount('getOfflineReward');

        ShowRewardDialog.show(reward);

        this.close();
    }

    onClickGet() {
        let offlineRewardTime = Core.userInfo.offlineRewardTime;
        let now = getServerTimestamp();
        Core.userInfo.offlineRewardTime = now;

        let delay = Math.floor((now - offlineRewardTime) / 1000);
        delay = Math.min(delay, 12 * 60 * 60);
        this._getReward(delay);
    }

    onClickFastGet() {
        lookAdVideo((err) => {
            if (!!err) return;
            TimerInfo.offlineRewardFast += 12 * 60 * 60;
            this._getReward(12 * 60 * 60);
        });
    }

    private _reload() {
        let offlineRewardTime = Core.userInfo.offlineRewardTime;
        let now = getServerTimestamp();
        let delay = Math.floor((now - offlineRewardTime) / 1000);
        delay = Math.min(delay, 12 * 60 * 60);
        this.clockLabel.string = Utils.formatTime(delay, 'hh:mm:ss');

        let reward = getOfflineReward(delay);
        this.goldLabel.string = reward.gold + '';
        this.expLabel.string = reward.exp + '';

        this.rewardItem.getChildByName('num').getComponent(Label).string = `${reward.chestCount}`;
        this.rewardItem.getChildByName('mask').active = reward.chestCount <= 0;

        let fastEnabled = TimerInfo.offlineRewardFast === 0;
        this.fastGetBtn.enabled = fastEnabled;
        this.fastGetClock.node.active = !fastEnabled;
        this.fastGetContent.active = fastEnabled;
        this.fastGetBtnMask.active = !fastEnabled;
        if (this.fastGetClock.node.active) {
            this.fastGetClock.string = Utils.formatTime(TimerInfo.offlineRewardFast, 'hh:mm:ss');
        }

        let rewardCd = 5 * 60;
        let rewardEnabled = delay >= rewardCd;
        this.getBtn.enabled = rewardEnabled;
        this.getBtnTitle.string = rewardEnabled ? "领取" : Utils.formatTime(rewardCd - delay, 'hh:mm:ss');
        this.getBtnMask.active = !rewardEnabled;

    }

}


