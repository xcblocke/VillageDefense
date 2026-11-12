import { _decorator, Label, Node } from 'cc';
import { MoneyType } from '../config/IConfig';
import { Core } from '../global/Core';
import { AdGetRewardDialog, AdGetRewardType } from '../prefab/ui/AdGetRewardDialog';
import { numberToString } from '../utils/GameUtils';
import { MonitorValuesController } from './MonitorValuesController';
const { ccclass, property } = _decorator;

interface IMoneyChangeData {
    startNum: number;
    endNum: number;
    type: MoneyType;
}

@ccclass('MoneyController')
export class MoneyController extends MonitorValuesController {

    @property(Label)
    goldLabel: Label;

    @property(Label)
    diamondLabel: Label;

    @property(Node)
    goldIco: Node;

    @property(Node)
    diamondIco: Node;

    protected start(): void {
        this.addMonitor({
            label: this.goldLabel,
            getValue: () => Core.userInfo.gold,
            getValueFormat: (v) => {
                return numberToString(v);
            },
            animData: {
                ico: this.goldIco,
                count: 20
            }
        });
        this.addMonitor({
            label: this.diamondLabel,
            getValue: () => Core.userInfo.diamond,
            getValueFormat: (v) => {
                return numberToString(v);
            },
            animData: {
                ico: this.diamondIco,
                count: 20
            }
        });
    }

    clickGold() {
        let moneyType: AdGetRewardType = 'Gold';
        AdGetRewardDialog.show(moneyType);
    }

    clickDiamond() {
        let moneyType: AdGetRewardType = 'Diamond';
        AdGetRewardDialog.show(moneyType);
    }

}


