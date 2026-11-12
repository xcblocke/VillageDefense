import { _decorator, Label, Prefab } from 'cc';
import { DialogController } from '../../dlspace/components/DialogController';
import { UISprite } from '../../dlspace/components/UISprite';
import { Bundle } from '../../global/Bundle';
import { loadSpriteFrame, numberToString } from '../../utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('DegradeDialog')
export class DegradeDialog extends DialogController {

    @property(Label)
    goldLabel: Label;

    @property(Label)
    compositeLabel: Label;

    @property(UISprite)
    icoSprite: UISprite;

    private _call: Function;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/degradeDialog", Prefab);
    }

    protected _open(...args: any[]) {
        const [gold, composite, grade, call] = args;
        this.goldLabel.string = numberToString(gold);
        this.compositeLabel.string = numberToString(composite);
        loadSpriteFrame(this.icoSprite, `texture/ui/composite-${grade}`);

        this._call = call;
    }

    clickConfirm() {
        this._call && this._call();
        this.close();
    }
}


