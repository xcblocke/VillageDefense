import { _decorator, EditBox, Prefab } from 'cc';
import { DialogController } from '../../dlspace/components/DialogController';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { IRewardData } from '../../utils/Model';
import { ShowRewardDialog } from './ShowRewardDialog';
import { Toast } from './Toast';
const { ccclass, property } = _decorator;

const addGold = (gold: number) => {
    Core.userInfo.gold += gold;
    let reward: IRewardData = {
        gold
    };
    ShowRewardDialog.show(reward);
}

const addDiamond = (diamond: number) => {
    Core.userInfo.diamond += diamond;
    let reward: IRewardData = {
        diamond
    };
    ShowRewardDialog.show(reward);
}

const RedeemCodeData = {
    'nly': () => {
        addGold(5000);
    },
    'nyy': () => {
        addGold(5000);
    },
    'jqy': () => {
        addDiamond(50);
    },
    'jdl': () => {
        addGold(5000);
    },
    'qyyxkfgzs-vip': () => {
        Core.userInfo.vip = true;
        Toast.show('恭喜你获得免广告VIP特权!');
    }
}

@ccclass('RedeemCodeDialog')
export class RedeemCodeDialog extends DialogController {

    @property(EditBox)
    input: EditBox;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/redeemCodeDialog", Prefab);
    }

    protected start(): void {
        this.input.string = '123';
        this.input['_updateLabels'];
        this.input.string = '';
    }

    onClickConfirm() {
        this._checkRedeemCodes(this.input.string);
    }

    private _checkRedeemCodes(str: string) {
        if (Core.userInfo.redeems.indexOf(str) !== -1) {
            Toast.show('该兑换码已使用，不可再用!');
            return;
        }

        let data = RedeemCodeData[str];
        if (!!data) {
            Core.userInfo.redeems.push(str);
            Core.userInfo.redeems = Core.userInfo.redeems;
            data();
            this.close();
        }
        else {
            Toast.show('兑换码不存在!');
        }
    }

}


