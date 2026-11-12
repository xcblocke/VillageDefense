import { _decorator, AudioClip, Label, Node, Prefab, tween, v3 } from 'cc';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { DialogController } from '../../dlspace/components/DialogController';
import { Bundle } from '../../global/Bundle';
import { lookAdVideo } from '../../utils/GameUtils';
import { Toast } from './Toast';
const { ccclass, property } = _decorator;

@ccclass('GameReviveDialog')
export class GameReviveDialog extends DialogController {

    @property(Node)
    clock: Node;

    private _time: number;
    private _pause: boolean;
    private _cancelCall: () => void;
    private _reviveCall: () => void;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/gameReviveDialog", Prefab);
    }

    open(...args: any[]): void {
        this._fadeInAnim = 'fromBig';
        super.open(...args);
    }

    protected _open(cancelCall: () => void, reviveCall: () => void) {
        this._cancelCall = cancelCall;
        this._reviveCall = reviveCall;
        this._time = 10;
        this._pause = false;
        this._reloadClock();
        this.schedule(this._reloadClock, 1);

        AudioMgr.inst.playOneShot(Bundle.audio.get('revive', AudioClip));

    }

    private _reloadClock() {
        if (this._pause) {
            return;
        }
        if (this._time < 0) {
            this.onClickCancel();
            return;
        }
        this.clock.getComponentInChildren(Label).string = `${this._time}`;
        let animNode = this.clock;
        tween(animNode).to(0.15, { scale: v3(1.1, 1.1, 1) }).to(0.15, { scale: v3(1, 1, 1) }).start();
        tween(animNode)
            .to(0.15, { angle: 15 }).to(0.15, { angle: -15 })
            .to(0.1, { angle: 0 }).start();

        this.scheduleOnce(() => {
            AudioMgr.inst.playOneShot(Bundle.audio.get('clock', AudioClip), 0.1);
        }, 0.1);

        this._time--;
    }

    onClickCancel() {
        this._cancelCall && this._cancelCall();
        this.close();
    }

    onClickRevive() {
        let success = lookAdVideo(err => {
            this._pause = false;
            if (!!err) {
                Toast.show(err);
                return;
            }
            this._reviveCall && this._reviveCall();
            this.close();
        });
        if (success) {
            this._pause = true;
        }
    }

}


