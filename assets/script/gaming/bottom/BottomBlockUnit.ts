import { _decorator, color, Enum, Label, Node, Rect, Sprite, tween } from 'cc';
import { EDITOR } from 'cc/env';
import { IdMgr } from '../../dlspace/common/IdMgr';
import { Controller } from '../../dlspace/components/Controller';
import { WeaponType } from '../../utils/Model';
import { BottomContainer } from '../BottomContainer';
const { ccclass, property, executeInEditMode } = _decorator;

export enum BottomBlockUnitType {
    Multiply,
    Subtract,
    AddWeapon,
    Gift
}

export const BottomBlockColors = {
    [BottomBlockUnitType.Multiply]: color('#00FF29'),
    [BottomBlockUnitType.Subtract]: color('#000000'),
    [BottomBlockUnitType.AddWeapon]: color('#F5FF00'),
    [BottomBlockUnitType.Gift]: color('7C95F8')
}

@ccclass('BottomBlockUnit')
@executeInEditMode(true)
export class BottomBlockUnit extends Controller {

    @property({ type: Enum(BottomBlockUnitType) })
    type = BottomBlockUnitType.Multiply;

    @property({ visible() { return this.type !== BottomBlockUnitType.AddWeapon } })
    value = 1;

    @property({ type: Node, visible() { return this.type === BottomBlockUnitType.AddWeapon } })
    weaponIco: Node;

    @property({ type: Enum(WeaponType), visible() { return this.type === BottomBlockUnitType.AddWeapon } })
    weaponType = WeaponType.Weapon_1;

    @property
    showLine = true;

    private _bg: Sprite;
    private _label: Label;
    private _lineLeft: Node;
    private _lineRight: Node;

    uid: number;
    private _bottom: BottomContainer;
    private _rect: Rect;

    init(bottom: BottomContainer) {
        this.uid = IdMgr.getId('BottomBlockUnit');
        this._bottom = bottom;
        this.updateLabel();
    }

    getRect() {
        if (!this._rect) {
            this._rect = this.node.uiTransfrom.getBoundingBoxToWorld();
        }
        return this._rect;
    }

    updateLabel() {
        this._label.string = this._getStr();
    }

    remove() {
        tween(this.node).to(0.3, { opacity: 0 }).call(() => {
            this.node.destroy();
        }).start();
    }

    protected onLoad(): void {
        this._bg = this.node.getChildByName('bg').getComponent(Sprite);
        this._label = this.node.getChildByName('label').getComponent(Label);
        this._lineLeft = this.node.getChildByName('line-left');
        this._lineRight = this.node.getChildByName('line-right');
    }

    protected start(): void {
        this._reload();
    }

    update(dt: number) {
        if (EDITOR) {
            this._reload();
        }
    }

    protected lateUpdate(dt: number): void {
        if (this.type === BottomBlockUnitType.Gift) {
            this._rect = null;
        }
    }

    private _reload() {
        let contentSize = this.node.uiTransfrom.contentSize;
        this._bg.node.uiTransfrom.contentSize = contentSize;
        this._bg.color = BottomBlockColors[this.type];
        this._label.node.active = this.type !== BottomBlockUnitType.AddWeapon;
        if (this._label.node.active) {
            this._label.string = this._getStr();
        }
        else {
            this.value = 1;
        }
        this._lineLeft.active = this.showLine;
        this._lineRight.active = this.showLine;
        if (this.showLine) {
            this._lineLeft.setPosition(-contentSize.width / 2, 0);
            this._lineRight.setPosition(contentSize.width / 2, 0);
        }
    }

    private _getStr(): string {
        let str = '';
        if (this.type === BottomBlockUnitType.Multiply) {
            str += 'x';
        }
        else if (this.type === BottomBlockUnitType.Subtract || this.type === BottomBlockUnitType.Gift) {
            str += '-';
        }
        str += this.value;
        return str;
    }

}


