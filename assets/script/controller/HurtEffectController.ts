import { _decorator, color, Color, Component, Tween, tween, UIRenderer } from 'cc';
const { ccclass, property } = _decorator;

const color_1 = color();
const color_white = color('#A8A8A8');

@ccclass('HurtEffectController')
export class HurtEffectController extends Component {

    private _tween: Tween<any>;

    trigger() {
        if (!!this._tween) {
            this._tween.stop();
        }
        let render = this.getComponent(UIRenderer);
        this._tween = tween({ t: 0 }).to(0.2, { t: 1 }, {
            onUpdate: (target, ratio) => {
                const t = Math.sin(ratio * Math.PI);
                Color.lerp(color_1, Color.BLACK, color_white, t);
                render.color = color_1;
            }
        }).call(() => {
            this._tween = null;
        }).start();
    }

    protected onEnable(): void {
        let render = this.getComponent(UIRenderer);
        render.color = Color.BLACK;
    }

    protected onDisable(): void {
        if (!!this._tween) {
            this._tween.stop();
        }
    }

}


