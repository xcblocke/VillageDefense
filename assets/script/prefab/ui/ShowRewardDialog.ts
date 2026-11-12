import { _decorator, AudioClip, Button, instantiate, Label, Layout, Node, Prefab } from 'cc';
import { EquipmentGrades } from '../../config/IConfig';
import { EquipmentItemController } from '../../controller/EquipmentItemController';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { DialogController } from '../../dlspace/components/DialogController';
import { UISprite } from '../../dlspace/components/UISprite';
import { Bundle } from '../../global/Bundle';
import { loadSpriteFrame, numberToString, sortEquipments } from '../../utils/GameUtils';
import { IRewardData } from '../../utils/Model';
const { ccclass, property } = _decorator;

@ccclass('ShowRewardDialog')
export class ShowRewardDialog extends DialogController {

    @property(Node)
    list: Node;

    @property(Button)
    closeBtn: Button;

    private _closeCall: Function;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/showRewardDialog", Prefab);
    }

    open(...args: any[]): void {
        this._fadeInAnim = 'fromBig';
        super.open(...args);
        AudioMgr.inst.playOneShot(Bundle.audio.get('reward', AudioClip));
    }

    protected _open(data: IRewardData, closeCall: Function) {
        this._closeCall = closeCall;

        let diamondItem = this.list.children[0];
        let goldItem = this.list.children[1];
        let expItem = this.list.children[2];
        let compositesItem = this.list.children[3];
        let equipmentItem = this.list.children[4];
        compositesItem.parent = null;
        equipmentItem.parent = null;

        if (!!data.diamond) {
            diamondItem.getChildByPath('frame/num').getComponent(Label).string = 'x' + numberToString(data.diamond);
        }
        else {
            diamondItem.parent = null;
        }

        if (!!data.gold) {
            goldItem.getChildByPath('frame/num').getComponent(Label).string = 'x' + numberToString(data.gold);
        }
        else {
            goldItem.parent = null;
        }

        if (!!data.exp) {
            expItem.getChildByPath('frame/num').getComponent(Label).string = 'x' + numberToString(data.exp);
        }
        else {
            expItem.parent = null;
        }

        if (!!data.composites) {
            for (let i = 0; i < EquipmentGrades.length; i++) {
                let grade = EquipmentGrades[i];
                let count = data.composites[grade];
                if (!!count && count > 0) {
                    let child = instantiate(compositesItem);
                    child.parent = this.list;
                    let ico = child.getChildByPath('frame/ico').getComponent(UISprite);
                    loadSpriteFrame(ico, `texture/ui/composite-${grade}`);
                    child.getChildByPath('frame/num').getComponent(Label).string = 'x' + numberToString(count);
                    child.getChildByPath('title').getComponent(Label).string = `${grade}级升级材料`;
                }
            }
        }

        if (!!data.equipments && data.equipments.length > 0) {
            sortEquipments(data.equipments);
            for (let i = 0; i < data.equipments.length; i++) {
                let equipmentData = data.equipments[i];
                let child = instantiate(equipmentItem);
                child.parent = this.list;
                child.getComponent(EquipmentItemController).init(equipmentData);
            }
        }

        let layout = this.list.getComponent(Layout);
        let childrenDount = Math.min(this.list.children.length, layout.constraintNum);
        this.list.uiTransfrom.width = (130 + layout.spacingX) * childrenDount - layout.spacingX;

        this.closeBtn.enabled = false;
        this.scheduleOnce(() => {
            this.closeBtn.enabled = true;
        }, 0.5);
    }

    onClickClose() {
        this._closeCall && this._closeCall();
        this.close();
    }

}

