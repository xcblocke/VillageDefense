import { _decorator, Button, instantiate, Label, Node, Prefab } from 'cc';
import { EquipmentGrade, EquipmentGrades } from '../../config/IConfig';
import { DialogController } from '../../dlspace/components/DialogController';
import { UISprite } from '../../dlspace/components/UISprite';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { IUserEquipmentData } from '../../global/UserInfo';
import { addAchievementCount, addCompositeCount, deleteEquipment, getDegradeReward, getEquipmentIsEquipped, loadSpriteFrame, numberToString } from '../../utils/GameUtils';
import { IRewardData } from '../../utils/Model';
import { ShowRewardDialog } from './ShowRewardDialog';
const { ccclass, property } = _decorator;

type FilterType = 'NoUpgrade' | EquipmentGrade;

@ccclass('DegradeMoreDialog')
export class DegradeMoreDialog extends DialogController {

    @property(Node)
    rewards: Node;

    @property(Node)
    checks: Node;

    private _call: Function;

    private _filterTypes: Set<FilterType> = new Set();
    private _handleDatas: IUserEquipmentData[] = [];

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/degradeMoreDialog", Prefab);
    }

    protected onLoad(): void {
        let noUpgradeTip = '不分解升级过的装备';
        let prefab = this.checks.children[0];
        prefab.parent = null;
        for (let i = 0; i < EquipmentGrades.length; i++) {
            const grade = EquipmentGrades[i];
            this._configCheck(grade, `${grade}级`, prefab);
        }
        this._configCheck('NoUpgrade', noUpgradeTip, prefab);
        let children = this.checks.children;

        for (const node of children) {
            let type = node.getValue('type') as FilterType;
            node.on(Button.EventType.CLICK, () => {
                if (this._filterTypes.has(type)) {
                    this._filterTypes.delete(type);
                }
                else {
                    this._filterTypes.add(type);
                }
                this._reloadChecks();
                this._reload();
            });
        }
        this._filterTypes.add('NoUpgrade');
        this._filterTypes.add('C');
        this._reloadChecks();
    }

    private _configCheck(type: FilterType, tip: string, prefab: Node) {
        let node = instantiate(prefab);
        node.parent = this.checks;

        node.getChildByName('tip').getComponent(Label).string = tip;
        node.setValue('type', type);

        return node;
    }

    private _reloadChecks() {
        let children = this.checks.children;
        for (const node of children) {
            let type = node.getValue('type') as FilterType;
            let ico = node.getChildByPath('toggle/ico');
            ico.active = this._filterTypes.has(type);
        }
    }

    protected _open(...args: any[]) {
        const [call] = args;
        this._call = call;
        this._reload();
    }

    private _reload() {
        this._handleDatas = [...Core.userInfo.equipments];
        this._handleDatas = this._handleDatas.filter(e => {
            return !getEquipmentIsEquipped(e.uid);
        });
        this._handleDatas = this._handleDatas.filter(e => {
            let grade = e.grade;
            if (this._filterTypes.has('NoUpgrade') && (e.level > 1 || e.star > 0)) {
                return false;
            }
            return this._filterTypes.has(grade);
        });
        let totalGold = 0;
        let compositeMap = new Map<EquipmentGrade, number>();
        for (const data of this._handleDatas) {
            let { gold, composite } = getDegradeReward(data.grade, data.star, data.level);
            totalGold += gold;
            let totalComposite = compositeMap.get(data.grade) ?? 0;
            totalComposite += composite;
            compositeMap.set(data.grade, totalComposite);
        }
        let goldItem = this.rewards.children[0];
        this.rewards.removeAllChildren();
        goldItem.parent = this.rewards;
        goldItem.getComponentInChildren(Label).string = numberToString(totalGold);

        for (let i = 0; i < EquipmentGrades.length; i++) {
            const grade = EquipmentGrades[i];
            if (compositeMap.has(grade)) {
                let newItem = instantiate(goldItem);
                newItem.parent = this.rewards;
                newItem.getComponentInChildren(Label).string = numberToString(compositeMap.get(grade));
                let ico = newItem.getComponentInChildren(UISprite);
                loadSpriteFrame(ico, `texture/ui/composite-${grade}`);
            }
        }
    }

    clickConfirm() {
        if (this._handleDatas.length === 0) return;

        let totalGold = 0;
        let compositeMap = new Map<EquipmentGrade, number>();
        let addCompositeMap = new Map<EquipmentGrade, number>();
        for (const data of this._handleDatas) {
            let { gold, composite } = getDegradeReward(data.grade, data.star, data.level);
            totalGold += gold;
            let totalComposite = compositeMap.get(data.grade) ?? 0;
            totalComposite += composite;
            compositeMap.set(data.grade, totalComposite);

            let totalAddCount = addCompositeMap.get(data.grade) ?? 0;
            addCompositeMap.set(data.grade, totalAddCount + composite);
        }

        Core.userInfo.gold += totalGold;
        for (const [grade, value] of compositeMap) {
            addCompositeCount(grade, value);
        }

        let uids = this._handleDatas.map(e => e.uid);
        deleteEquipment(uids);
        addAchievementCount('degradeEquipment', uids.length);

        let reward: IRewardData = {
            gold: totalGold,
            composites: {}
        };
        for (const k of EquipmentGrades) {
            let totalAddCount = addCompositeMap.get(k) ?? 0;
            if (totalAddCount > 0) {
                reward.composites[k] = totalAddCount;
            }
        }
        ShowRewardDialog.show(reward);

        this._call && this._call();
        this.close();

    }
}


