import { Canvas, game, Mask, ResolutionPolicy, view } from 'cc';
import { EDITOR } from 'cc/env';

if (!EDITOR) {
    let viewSize = view.getVisibleSize();
    let designSize = view.getDesignResolutionSize();
    if (viewSize.height / viewSize.width < designSize.height / designSize.width) {
        view.setResolutionPolicy(ResolutionPolicy.SHOW_ALL);
        let canvasFn = Canvas.prototype.onEnable;
        Canvas.prototype.onEnable = function () {
            canvasFn && canvasFn.call(this);
            let self = this as Canvas;
            self.addUniqueComponent(Mask);
        };
    }
}

var timeScale = 1;
export function setTimeScale(scale: number) {
    timeScale = scale;
}

const fn = game['_calculateDT'];
game['_calculateDT'] = function (...args: any[]) {
    let result = fn.call(this, ...args);
    this._deltaTime = result * timeScale;
    return this._deltaTime;
};
