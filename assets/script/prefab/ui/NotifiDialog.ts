import { _decorator, Label, Prefab } from 'cc';
import { DialogController } from '../../dlspace/components/DialogController';
import { Bundle } from '../../global/Bundle';
const { ccclass, property } = _decorator;

@ccclass('NotifiDialog')
export class NotifiDialog extends DialogController {

    @property(Label)
    label: Label;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/notifiDialog", Prefab);
    }

    open(...args: any[]) {
        this._fadeInAnim = 'fromTop';
        super.open(...args);
    }

    protected _open(...args: any[]) {
        const [message, duration = 2] = args;
        this.label.string = message;

        this.scheduleOnce(() => {
            this.node.destroy();
        }, duration);
    }

}

