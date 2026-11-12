import { _decorator, Button, Label, Prefab } from 'cc';
import { DialogController } from '../../dlspace/components/DialogController';
import { Bundle } from '../../global/Bundle';
const { ccclass, property } = _decorator;

@ccclass('MessageDialog')
export class MessageDialog extends DialogController {

    @property(Label)
    title: Label = null;

    @property(Label)
    message: Label = null;

    @property(Button)
    confirm: Button = null;

    private _call: () => void = null;
    private _cancel: () => void = null;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/messageDialog", Prefab);
    }

    protected _open(title: string, message: string, confirm = '确定', call = null, cancel = null) {
        this.title.string = title;
        this.title.updateRenderData(true);

        this.message.string = message;
        this._setBtnTitle(this.confirm, confirm);
        this._call = call;
        this._cancel = cancel;
    }

    onClickConfirm() {
        this._call && this._call();
        this._call = null;
        this.close();
    }

    onClickCancel() {
        this._cancel && this._cancel();
        this.close();
    }

    private _setBtnTitle(btn: Button, title: string) {
        btn.node.active = !!title && title.length > 0;
        if (!btn.node.active) {
            return;
        }
        let label = btn.getComponentInChildren(Label);
        label.string = title;
    }

}


