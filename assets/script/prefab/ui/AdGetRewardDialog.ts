import { _decorator, AudioClip, Label, Prefab, Sprite } from 'cc';
import { MoneyType } from '../../config/IConfig';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { DialogController } from '../../dlspace/components/DialogController';
import { UISprite } from '../../dlspace/components/UISprite';
import { Utils } from '../../dlspace/utils/Utils';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { MaxEnergy } from '../../global/IGame';
import { TimerInfo } from '../../global/TimerInfo';
import { loadSpriteFrame, lookAdVideo } from '../../utils/GameUtils';
const { ccclass, property } = _decorator;

const addGoldValue = 20000;
const addDiamondValue = 100;
const addEnergyValue = MaxEnergy;

export type AdGetRewardType = MoneyType | 'Energy';

@ccclass('AdGetRewardDialog')
export class AdGetRewardDialog extends DialogController {

    @property(UISprite)
    ico: UISprite;

    @property(Label)
    label: Label;

    @property(Sprite)
    btnBg: Sprite;

    @property(Label)
    btnLabel: Label;

    private _moneyType: AdGetRewardType;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/adGetRewardDialog", Prefab);
    }

    protected _open(...args: any[]) {
        this._moneyType = args[0] as AdGetRewardType;
        let icoPath = '';
        let value = 0;
        if (this._moneyType === 'Gold') {
            icoPath = "texture/ui/ico-gold";
            value = addGoldValue;
        }
        else if (this._moneyType === 'Diamond') {
            icoPath = "texture/ui/ico-diamond";
            value = addDiamondValue;
        }
        else if (this._moneyType === 'Energy') {
            icoPath = "texture/ui/ico-energy";
            value = addEnergyValue;
        }
        loadSpriteFrame(this.ico, icoPath);
        this.label.string = `+${value}`;
    }

    clickConfirm() {
        if (this.btnLabel.string !== '免费') return;

        lookAdVideo(err => {
            if (!!err) return;
            if (this._moneyType === 'Gold') {
                Core.userInfo.gold += addGoldValue;
                TimerInfo.getAdGold = 1 * 60 * 60;
            }
            else if (this._moneyType === 'Diamond') {
                Core.userInfo.diamond += addDiamondValue;
                TimerInfo.getAdDiamond = 3 * 60 * 60;
            }
            else if (this._moneyType === 'Energy') {
                Core.userInfo.energy += addEnergyValue;
                TimerInfo.getAdEnergy = 1 * 60 * 60;
            }
            this.close();
            AudioMgr.inst.playOneShot(Bundle.audio.get('add-money', AudioClip));
        })
    }

    protected update(dt: number): void {
        let time = 0;
        if (Core.userInfo.vip) {
            time = 0;
        }
        else {
            if (this._moneyType === 'Gold') {
                time = TimerInfo.getAdGold;
            }
            else if (this._moneyType === 'Diamond') {
                time = TimerInfo.getAdDiamond;
            }
            else if (this._moneyType === 'Energy') {
                time = TimerInfo.getAdEnergy;
            }
        }
        let btnActive = time <= 0;
        this.btnBg.grayscale = !btnActive;
        if (btnActive) {
            this.btnLabel.string = '免费';
        }
        else {
            this.btnLabel.string = Utils.formatTime(time, 'hh:mm:ss');
        }
    }

}


