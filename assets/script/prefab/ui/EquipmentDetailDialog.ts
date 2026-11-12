import { _decorator, AudioClip, Button, color, Label, Node, Prefab, Sprite, SpriteFrame, tween, Tween, v3 } from 'cc';
import { EquipmentConfig } from 'db://assets/config/EquipmentConfig';
import { EquipmentGradeConfig } from 'db://assets/config/EquipmentGradeConfig';
import { EquipmentTypes } from '../../config/IConfig';
import { EquipmentItemController } from '../../controller/EquipmentItemController';
import { MsgMgr } from '../../dlspace/common/MsgMgr';
import { DialogController } from '../../dlspace/components/DialogController';
import { UISprite } from '../../dlspace/components/UISprite';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { GameAction } from '../../global/IGame';
import { IUserEquipmentData } from '../../global/UserInfo';
import { addAchievementCount, addCompositeCount, deleteEquipment, getCompositeCount, getDegradeReward, getEquipmentSetEquippedCount, getHeroPropertyTypeByEquipmentType, getHeroPropertyValueByEquipment, getUpgradeNeedComposite, getUpgradeNeedGold, loadSpriteFrame, numberToString, setCompositeCount, starEqualLevel, upgradeEquipment } from '../../utils/GameUtils';
import { IRewardData } from '../../utils/Model';
import { DegradeDialog } from './DegradeDialog';
import { ShowRewardDialog } from './ShowRewardDialog';
import { Toast } from './Toast';
const { ccclass, property } = _decorator;

const blackColor = color('000000');
const grayColor = color('76787E');

const whiteColor = color('FFFFFF');
const redColor = color('F57C7C');

@ccclass('EquipmentDetailDialog')
export class EquipmentDetailDialog extends DialogController {

    @property(EquipmentItemController)
    itemController: EquipmentItemController;

    @property(Sprite)
    propIco: Sprite;

    @property(SpriteFrame)
    damageSf: SpriteFrame;

    @property(SpriteFrame)
    hpSf: SpriteFrame;

    @property(Label)
    propLabel: Label;

    @property(Node)
    starSkills: Node;

    @property(Label)
    equipmentSetLabel: Label;

    @property(Label)
    equipmentSetCountLabel: Label;

    @property(Label)
    equipmentSetDescLabel: Label;

    @property(Label)
    upgradeNeedGoldLabel: Label;

    @property(UISprite)
    upgradeNeedCompositeIco: UISprite;

    @property(Label)
    upgradeNeedCompositeLabel: Label;

    @property(Label)
    upgradeBtnLabel: Label;

    @property(Node)
    upgradeBtn: Node;

    @property(Label)
    equippingBtnLabel: Label;

    @property(Node)
    needGoldAndComposite: Node;

    private _data: IUserEquipmentData;
    private _closeCall: () => void;

    private _upgradeFn: () => void;

    private _levelNodeTween: Tween<Node>;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/equipmentDetailDialog", Prefab);
    }

    clickDegrade() {
        let { gold, composite } = getDegradeReward(this._data.grade, this._data.star, this._data.level);
        DegradeDialog.show(gold, composite, this._data.grade, () => {
            Core.userInfo.gold += gold;

            addCompositeCount(this._data.grade, composite);

            deleteEquipment([this._data.uid]);
            addAchievementCount('degradeEquipment');
            this.close();

            let reward: IRewardData = {
                gold,
                composites: {
                    [this._data.grade]: composite
                }
            };
            ShowRewardDialog.show(reward);
        });
    }

    clickEquipping() {
        let config = EquipmentConfig.where('id', this._data.id);
        if (Core.userInfo.equipped[config.type] === this._data.uid) {
            Core.userInfo.equipped[config.type] = null;
        }
        else {
            Core.userInfo.equipped[config.type] = this._data.uid;
        }
        Core.userInfo.equipped = Core.userInfo.equipped;
        this.close();
    }

    clickUpgrade() {
        if (!this._upgradeFn) {
            Toast.show('材料不足, 无法升级!');
            return;
        }
        this._upgradeFn && this._upgradeFn();
        MsgMgr.emit(GameAction.onEquipmentUpgrade, this._data.uid);

        this._reload();

        if (this._levelNodeTween) {
            this._levelNodeTween.stop();
        }
        let levelNode = this.itemController.level.node;
        levelNode.setScale(1.5, 1.5, 1);
        this._levelNodeTween = tween(levelNode).to(0.5, { scale: v3(1, 1, 1) }, { easing: 'backOut' }).call(() => {
            this._levelNodeTween = null;
        }).start();

    }

    close(): void {
        this._closeCall && this._closeCall();
        super.close();
    }

    protected _open(...args: any[]) {
        this._data = args[0];
        this._closeCall = args[1];
        this._reload();
    }

    private _reload() {
        this._upgradeFn = null;

        let config = EquipmentConfig.where('id', this._data.id);
        let gradeConfig = EquipmentGradeConfig.where('grade', this._data.grade);

        this.itemController.init(this._data);
        let heroPropertyType = getHeroPropertyTypeByEquipmentType(config.type);
        this.propIco.spriteFrame = heroPropertyType === 'Damage' ? this.damageSf : this.hpSf;
        let propertyValue = getHeroPropertyValueByEquipment(heroPropertyType, this._data.grade, this._data.star, this._data.level);
        this.propLabel.string = String(propertyValue);
        let stars = this.starSkills.children;
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            let starSkill = config[`starSkill${i + 1}`];
            star.active = !!starSkill && gradeConfig.maxStar >= (i + 1);
            if (star.active) {
                let active = i < this._data.star;
                const starLabel = star.getComponent(Label);
                starLabel.string = `${i + 1}星: ${starSkill}`;
                starLabel.color = active ? blackColor : grayColor;
            }
        }
        let isEquipped = Core.userInfo.equipped[config.type] === this._data.uid;
        this.equipmentSetLabel.string = `${config.setName} 套装`;
        let setEquippedCount = getEquipmentSetEquippedCount(config.setName);
        let setVisible = isEquipped && setEquippedCount >= EquipmentTypes.length;
        this.equipmentSetCountLabel.string = `[${setEquippedCount}/${EquipmentTypes.length}]`;
        this.equipmentSetCountLabel.color = setVisible ? blackColor : grayColor;
        this.equipmentSetDescLabel.string = `套装效果: ${config.setSkill}`;
        this.equipmentSetDescLabel.color = setVisible ? blackColor : grayColor;

        let needUpStar = gradeConfig.maxLevel === this._data.level;
        let maxStar = gradeConfig.maxStar === this._data.star;
        let upgradeDisable = maxStar && needUpStar;
        this.upgradeBtn.active = !upgradeDisable;
        this.needGoldAndComposite.active = !upgradeDisable;

        let upgradeEnabled = false;
        if (!upgradeDisable) {
            let needGold = getUpgradeNeedGold(this._data.level, this._data.star);
            let needComposite = getUpgradeNeedComposite(this._data.level, this._data.star);
            if (needUpStar) {
                needGold *= starEqualLevel;
                needComposite *= starEqualLevel;
            }
            let myGold = Core.userInfo.gold;
            let myComposite = getCompositeCount(this._data.grade);

            this.upgradeNeedGoldLabel.string = `${numberToString(myGold)}/${numberToString(needGold)}`;
            this.upgradeNeedCompositeLabel.string = `${myComposite}/${numberToString(needComposite)}`;
            this.upgradeNeedGoldLabel.color = myGold >= needGold ? whiteColor : redColor;
            this.upgradeNeedCompositeLabel.color = myComposite >= needComposite ? whiteColor : redColor;
            loadSpriteFrame(this.upgradeNeedCompositeIco, `texture/ui/composite-${this._data.grade}`);

            let tipStr = needUpStar ? '升星' : '升级';
            upgradeEnabled = myComposite >= needComposite && myGold >= needGold;
            if (upgradeEnabled) {
                this._upgradeFn = () => {
                    Core.userInfo.gold -= needGold;
                    setCompositeCount(this._data.grade, myComposite - needComposite);
                    upgradeEquipment(this._data.uid);
                    addAchievementCount('upgradeEquipment');
                    Toast.show(`${tipStr}成功!`);
                };
            }
            this.upgradeBtnLabel.string = tipStr;
        }
        this.equippingBtnLabel.string = isEquipped ? '卸下' : '装备';

        let clickAudio = Bundle.audio.get(upgradeEnabled ? 'reward' : 'clock', AudioClip);
        this.upgradeBtn.getComponent(Button).setValue('ClickAudio', clickAudio);

    }


}
