import { _decorator, Label, Node, tween, Tween, v3 } from 'cc';
import { Controller } from '../dlspace/components/Controller';
import { IMoneyAddAnimData, MoneyAddAnim } from '../prefab/ui/MoneyAddAnim';
import { numberToString } from '../utils/GameUtils';
const { ccclass, property } = _decorator;

export interface MonitorValuesItem {
    label: Label;
    getValue: () => number;
    getValueFormat: (v: number) => string;
    animData?: IMoneyAddAnimData;
    checkShow?: (v: number) => boolean;

    value?: number;
    current?: number;
    t?: Tween<Node>;
}

@ccclass('MonitorValuesController')
export class MonitorValuesController extends Controller {

    protected _monitorItems: Set<MonitorValuesItem> = new Set();
    protected _animNodes: Set<Node> = new Set();

    addMonitor(item: MonitorValuesItem) {
        this._reloadItem(item);
        this._monitorItems.add(item);
    }

    deleteMonitor(item: MonitorValuesItem) {
        this._monitorItems.delete(item);
    }

    protected onEnable(): void {
        for (const item of this._monitorItems) {
            this._reloadItem(item);
        }
    }

    protected onDisable(): void {
        for (const node of this._animNodes) {
            node.destroy();
        }
        this._animNodes.clear();
    }

    protected update(dt: number): void {
        for (const item of this._monitorItems) {
            let now = item.getValue();
            let current = item.current;
            if (now !== current) {
                let diff = now - current;
                let setValue = () => {
                    item.value += diff;

                    if (!!item.t) {
                        item.t.stop();
                    }
                    let label = item.label;
                    label.string = `${diff > 0 ? '+' : ''}${numberToString(diff)}`;
                    label.node.setScale(1.5, 1.5, 1);

                    item.t = tween(label.node).to(0.5, { scale: v3(1, 1, 1) }, { easing: 'backOut' }).call(() => {
                        label.string = item.getValueFormat(item.value);
                        item.t = null;
                    }).start();
                }
                if (diff > 0 && !!item.animData && (!item.checkShow || (!!item.checkShow && item.checkShow(diff)))) {
                    let node = MoneyAddAnim.show(item.animData, () => {
                        setValue();
                        this._animNodes.delete(node);
                    }).node;
                    this._animNodes.add(node);
                }
                else {
                    setValue();
                }
                item.current = now;
            }
        }
    }

    private _reloadItem(item: MonitorValuesItem) {
        let now = item.getValue();
        item.value = now;
        item.current = now;
        item.label.string = item.getValueFormat(item.value);
        item.label.node.setScale(1, 1, 1);
    }

}


