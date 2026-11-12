import { _decorator, Button, Component, Label, Node } from 'cc';
import { EquipmentConfig } from '../../config/EquipmentConfig';
import { EquipmentGrade } from '../config/IConfig';
import { UISprite } from '../dlspace/components/UISprite';
import { getShopCompositesSaleMoney, getShopEquipmentSaleMoney, loadSpriteFrame } from '../utils/GameUtils';
const { ccclass, property } = _decorator;

export type ShopItemType = 'Equipment' | 'Composites';

export interface ShopDailyShopData {
    type: ShopItemType;
    grade: EquipmentGrade;
    active: boolean;
    //装备的参数
    equipmentId?: number;
    //材料的参数
    compositesNum?: number;
}

@ccclass('ShopDailyShopItem')
export class ShopDailyShopItem extends Component {

    private _label: Label;
    private _numLabel: Label;
    private _icoSprite: UISprite;
    private _moneyLabel: Label;
    private _mask: Node;

    private _clickCall: (saleMoney: number) => void;
    private _saleMoney: number;

    protected onLoad(): void {
        this._label = this.node.getChildByName('label').getComponent(Label);
        this._numLabel = this.node.getChildByName('num').getComponent(Label);
        this._icoSprite = this.node.getChildByName('ico').getComponent(UISprite);
        this._moneyLabel = this.node.getChildByPath('money/label').getComponent(Label);
        this._mask = this.node.getChildByName('mask');
    }

    protected onEnable(): void {
        this.node.on(Button.EventType.CLICK, this._onClick, this);
    }

    protected onDisable(): void {
        this.node.off(Button.EventType.CLICK, this._onClick, this);
    }

    init(data: ShopDailyShopData, clickCall: (saleMoney: number) => void) {
        this._clickCall = clickCall;
        if (data.type === 'Equipment') {
            let config = EquipmentConfig.where('id', data.equipmentId);
            this._label.string = data.grade + '级' + config.name;
            this._numLabel.string = '';
            loadSpriteFrame(this._icoSprite, `texture/equipment/${config.ico}`);
            this._saleMoney = getShopEquipmentSaleMoney(data.grade);
        }
        else {
            this._label.string = data.grade + '级升级材料';
            this._numLabel.string = `x${data.compositesNum}`;
            loadSpriteFrame(this._icoSprite, `texture/ui/composite-${data.grade}`);
            this._saleMoney = getShopCompositesSaleMoney(data.grade) * data.compositesNum;
        }
        this._moneyLabel.string = `${this._saleMoney}`;
        this._mask.active = !data.active;
    }

    private _onClick() {
        if (this._mask.active) return;
        this._clickCall && this._clickCall(this._saleMoney);
    }
}


