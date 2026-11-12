import { _decorator, Button, color, Component, Label, Node } from 'cc';
import { EquipmentGrades } from '../config/IConfig';
import { Utils } from '../dlspace/utils/Utils';
import { Core } from '../global/Core';
import { TimerInfo } from '../global/TimerInfo';
import { OpenChestDialog } from '../prefab/ui/OpenChestDialog';
import { Toast } from '../prefab/ui/Toast';
import { getRandomGradeWeights, isBackpackFull, lookAdVideo, openChest } from '../utils/GameUtils';
const { ccclass, property } = _decorator;

export const ChestPrice = 10;
export const ChestBuyCount = 10;

const FreeTxtColor = color('F0EEB9');
const FreeTxtColorDisable = color('B1B1B1');

@ccclass('ShopChestShopItem')
export class ShopChestShopItem extends Component {

    private _chestIcoNode: Node;
    private _buyAdNode: Node;
    private _buyDiamondNode: Node;
    private _chestDetail: Node;

    protected onLoad(): void {
        this._chestIcoNode = this.node.getChildByPath('ico');
        this._buyAdNode = this.node.getChildByPath('btns/buy-ad');
        this._buyDiamondNode = this.node.getChildByPath('btns/buy-diamond');
        this._chestDetail = this.node.getChildByPath('info');
    }

    protected onEnable(): void {
        this._buyAdNode.on(Button.EventType.CLICK, this._onClickBuyAd, this);
        this._buyDiamondNode.on(Button.EventType.CLICK, this._onClickBuyDiamond, this);
        this._chestDetail.on(Button.EventType.CLICK, this._onClickDetail, this);
    }

    protected onDisable(): void {
        this._buyAdNode.off(Button.EventType.CLICK, this._onClickBuyAd, this);
        this._buyDiamondNode.off(Button.EventType.CLICK, this._onClickBuyDiamond, this);
        this._chestDetail.off(Button.EventType.CLICK, this._onClickDetail, this);
    }

    protected update(dt: number): void {
        let time = TimerInfo.getFreeChest;
        let freeActive = time <= 0;
        let freeTip = this._buyAdNode.getChildByPath('label').getComponent(Label);
        if (freeActive) {
            freeTip.string = '免费';
            freeTip.color = FreeTxtColor;
        }
        else {
            freeTip.string = Utils.formatTime(time, 'hh:mm:ss');
            freeTip.color = FreeTxtColorDisable;
        }

        this._buyDiamondNode.getChildByPath('label').getComponent(Label).string = `${ChestBuyCount * ChestPrice}`;
    }

    private _openChest() {
        let datas = openChest(ChestBuyCount);
        OpenChestDialog.show(this._chestIcoNode, datas);
    }

    private _onClickBuyAd() {
        if (isBackpackFull()) {
            return;
        }
        let time = TimerInfo.getFreeChest;
        let freeActive = time <= 0;
        if (!freeActive) {
            Toast.show('免费宝箱冷却中!');
            return;
        }
        lookAdVideo(err => {
            if (!!err) return;
            TimerInfo.getFreeChest = 8 * 60 * 60;
            this._openChest();
        });
    }

    private _onClickBuyDiamond() {
        if (isBackpackFull()) {
            return;
        }
        let price = ChestBuyCount * ChestPrice;
        if (Core.userInfo.diamond < price) {
            Toast.show('钻石不足!');
            return;
        }
        Core.userInfo.diamond -= price;
        this._openChest();
    }

    private _onClickDetail() {
        let weights = getRandomGradeWeights();
        let probalities = Math.weightsToProbabilities(weights);
        let tips: string[] = [];
        for (let i = 0; i < probalities.length; i++) {
            const probalitie = probalities[i];
            tips.push(`${EquipmentGrades[i]}: ${(probalitie * 100).toFixed(2)} %`);
        }
        Toast.show(`装备宝箱几率：\n${tips.join('\n')}\n稀有装备几率随着玩家等级提升`);
    }
}


