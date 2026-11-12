import { _decorator, Node, Prefab } from 'cc';
import { DialogController } from '../../dlspace/components/DialogController';
import { Bundle } from '../../global/Bundle';
const { ccclass, property } = _decorator;

@ccclass('FirstGiftDialog')
export class FirstGiftDialog extends DialogController {

    @property(Node)
    chestIcoNode: Node;

    private _call: (chestIcoNode: Node) => void;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/firstGiftDialog", Prefab);
    }

    protected _open(call: (chestIcoNode: Node) => void): void {
        this._call = call;
    }

    onClickConfirm() {
        this._call && this._call(this.chestIcoNode);
        this.close();
    }

}


