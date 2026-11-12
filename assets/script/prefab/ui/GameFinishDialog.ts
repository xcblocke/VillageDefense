import { _decorator, AudioClip, instantiate, Label, Node, Prefab } from 'cc';
import { EquipmentItemController } from '../../controller/EquipmentItemController';
import { RunScene } from '../../controller/RunScene';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { DialogController } from '../../dlspace/components/DialogController';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { SceneName } from '../../global/IGame';
import { IUserEquipmentData } from '../../global/UserInfo';
import { addEquipmentByDatas, addExp, createEquipment, getGamingReward, lookAdVideo, sortEquipments } from '../../utils/GameUtils';
import { IRewardData } from '../../utils/Model';
import { ShowRewardDialog } from './ShowRewardDialog';
const { ccclass, property } = _decorator;

@ccclass('GameFinishDialog')
export class GameFinishDialog extends DialogController {

    @property(Node)
    victory: Node;

    @property(Node)
    defeat: Node;

    @property(Node)
    doubleGetNode: Node;

    @property(Label)
    goldLabel: Label;

    @property(Label)
    expLabel: Label;

    @property(Node)
    rewardList: Node;

    private _reward: IRewardData;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/gameFinishDialog", Prefab);
    }

    open(...args: any[]): void {
        this._fadeInAnim = 'fromBig';
        super.open(...args);
    }

    protected _open(progress: number) {
        let victory = progress === 1;
        this.victory.active = victory;
        this.defeat.active = !victory;
        this.doubleGetNode.active = victory;

        let reward = getGamingReward(progress);
        sortEquipments(reward.equipments);

        this._reward = reward;

        this.goldLabel.string = reward.gold + '';
        this.expLabel.string = reward.exp + '';

        let prefab = this.rewardList.children[0];
        prefab.parent = null;
        for (let i = 0; i < reward.equipments.length; i++) {
            let equipment = reward.equipments[i];
            let node = instantiate(prefab);
            node.parent = this.rewardList;
            node.getComponent(EquipmentItemController).init(equipment);
        }

        AudioMgr.inst.playOneShot(Bundle.audio.get(victory ? 'victory' : 'defeat', AudioClip));

    }

    private _toGetReward(isDouble: boolean) {
        let reward = this._reward;
        if (isDouble) {
            reward.gold *= 2;
            reward.exp *= 2;
        }
        Core.userInfo.gold += reward.gold;
        addExp(reward.exp);
        let datas: IUserEquipmentData[] = [];
        for (const item of reward.equipments) {
            datas.push(createEquipment(item.id, item.grade));
            if (isDouble) {
                datas.push(createEquipment(item.id, item.grade));
            }
        }
        addEquipmentByDatas(datas);
        reward.equipments = datas;

        ShowRewardDialog.show(reward, () => {
            RunScene.show(SceneName.Lobby);
        });

        this.close();
    }

    onClickGet() {
        this._toGetReward(false);
    }

    onClickDoubleGet() {
        lookAdVideo(err => {
            if (!!err) return;
            this._toGetReward(true);
        });
    }

}


