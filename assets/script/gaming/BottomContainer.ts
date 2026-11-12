import { _decorator, instantiate, Label, Node, Prefab, Rect } from 'cc';
import { HeroPropertyDescEnums, HeroPropertyEnums } from '../config/IConfig';
import { Controller } from '../dlspace/components/Controller';
import { Bundle } from '../global/Bundle';
import { Core } from '../global/Core';
import { RootContainer } from './RootContainer';
import { BottomLayoutController } from './bottom/BottomLayoutController';
import { FireBottomBulletUnit } from './bottom/FireBottomBulletUnit';
const { ccclass, property } = _decorator;

@ccclass('BottomContainer')
export class BottomContainer extends Controller {

    @property(Node)
    bulletContainer: Node;

    @property(FireBottomBulletUnit)
    fireUnit: FireBottomBulletUnit;

    @property(Node)
    bottomLayoutNode: Node;

    @property(Node)
    ventNode: Node;

    @property(Node)
    ventToNode: Node;

    @property(Label)
    heroPropLabel: Label;

    root: RootContainer;

    ventRect: Rect;
    bottomLayout: BottomLayoutController;

    init(root: RootContainer) {
        this.root = root;

        this.ventRect = this.ventNode.uiTransfrom.getBoundingBox();

        let level = Core.game.info.level;
        let layoutPrefab = Bundle.game.get(`prefab/gaming/bottom/bottom-layout-${(level - 1) % 3 + 1}`, Prefab);
        let layoutNode = instantiate(layoutPrefab);
        layoutNode.parent = this.bottomLayoutNode;
        this.bottomLayout = layoutNode.getComponent(BottomLayoutController);
        this.bottomLayout.init(this);

        this.fireUnit.init(this);
    }

    protected update(dt: number): void {
        let tip = [this._getPropTip(['攻速', '攻击', '附加伤害'], '+'), this._getPropTip(['暴击率', '暴击伤害'])].join('\n');
        this.heroPropLabel.string = tip;
    }

    private _getPropTip(props: string[], sym = ':') {
        let tip = '';
        for (let i = 0; i < props.length; i++) {
            let prop = props[i];
            let index = HeroPropertyDescEnums.indexOf(prop as any);
            let key = HeroPropertyEnums[index];
            let value = Core.game.info.heroInfo[key];
            tip += `|  ${prop}${sym}${value}%  `;
        }
        tip += '|';
        return tip;
    }

}


