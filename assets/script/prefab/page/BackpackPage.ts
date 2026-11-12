import { _decorator, AudioClip, Button, color, Component, instantiate, Label, Node, Sprite } from 'cc';
import { EquipmentType, EquipmentTypes } from '../../config/IConfig';
import { EquipmentItemController } from '../../controller/EquipmentItemController';
import { ParticleMoveController } from '../../controller/ParticleMoveController';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { VirtualList } from '../../dlspace/components/VirtualList';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { MaxBackpackCount } from '../../global/IGame';
import { IUserEquipmentData } from '../../global/UserInfo';
import { getEquipmentEmptyIco, getEquipmentIsEquipped, getGamingHeroInfo, loadSpriteFrame, numberToString, sortEquipments } from '../../utils/GameUtils';
import { DegradeMoreDialog } from '../ui/DegradeMoreDialog';
import { EquipmentDetailDialog } from '../ui/EquipmentDetailDialog';
const { ccclass, property } = _decorator;

const EquipmentCountsGreenColor = color('D8CEA8');
const EquipmentCountsRedColor = color('FF2423');

@ccclass('BackpackPage')
export class BackpackPage extends Component {

    @property(Node)
    equipped: Node;

    @property(VirtualList)
    list: VirtualList;

    @property(Label)
    countLabel: Label;

    @property(Label)
    damageLabel: Label;

    @property(Label)
    hpLabel: Label;

    private _equippedMap: Map<EquipmentType, Node> = new Map();
    private _datas: IUserEquipmentData[] = [];

    protected onLoad(): void {
        let equippedItem = this.equipped.children[0];
        equippedItem.parent = null;
        for (let i = 0; i < EquipmentTypes.length; i++) {
            const type = EquipmentTypes[i];
            let node = instantiate(equippedItem);
            node.parent = this.equipped;
            node.on(Button.EventType.CLICK, () => {
                let uid = Core.userInfo.equipped[type];
                if (!uid) {
                    return;
                }
                let equipmentData = Core.userInfo.equipments.find(e => e.uid === uid);
                EquipmentDetailDialog.show(equipmentData, () => {
                    this._reloadList();
                    this._reloadEquipped();
                });
            });
            this._equippedMap.set(type, node);
        }
        this.list.init(null, (node, index) => {
            let data = this._datas[index];
            node.getComponent(EquipmentItemController).init(data);
        }, (node, index) => {
            AudioMgr.inst.playOneShot(Bundle.audio.get('click', AudioClip));
            let data = this._datas[index];
            EquipmentDetailDialog.show(data, () => {
                this._reloadList();
                this._reloadEquipped();
            });
        });
    }

    protected onEnable(): void {
        this._reloadList();
        this._reloadEquipped();
    }

    degradeMore() {
        DegradeMoreDialog.show(() => {
            this._reloadList();
            this._reloadEquipped();
        });
    }

    private _reloadEquipped() {
        for (const [type, node] of this._equippedMap) {
            let emptyIco = node.getChildByName('empty').getComponent(Sprite);
            let equippedUid = Core.userInfo.equipped[type];
            let equipmentData: IUserEquipmentData;
            if (!!equippedUid) {
                equipmentData = Core.userInfo.equipments.find(e => e.uid === equippedUid);
            }
            emptyIco.node.active = !equipmentData;
            if (!equipmentData) {
                loadSpriteFrame(emptyIco, getEquipmentEmptyIco(type));
            }

            let equipmentItem = node.getChildByName('equipment-item');
            equipmentItem.active = !!equipmentData;
            if (!!equipmentData) {
                let comp = equipmentItem.getComponent(EquipmentItemController);
                comp.init(equipmentData);
            }

            node.getComponent(ParticleMoveController).enabled = !!equipmentData && equipmentData.star > 0;
        }
        let info = getGamingHeroInfo();
        this.damageLabel.string = numberToString(info.Damage);
        this.hpLabel.string = numberToString(info.Hp);
    }

    private _reloadList() {
        this._datas = [...Core.userInfo.equipments];
        this._datas = this._datas.filter(e => {
            return !getEquipmentIsEquipped(e.uid);
        });
        sortEquipments(this._datas);
        this.list.num = this._datas.length;
        this.countLabel.string = `[${this._datas.length}/${MaxBackpackCount}]`;
        this.countLabel.color = this._datas.length > MaxBackpackCount ? EquipmentCountsRedColor : EquipmentCountsGreenColor;
    }


}


