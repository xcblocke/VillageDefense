import { _decorator, Component } from 'cc';
import { Core } from '../../global/Core';
import { GameState } from '../../global/IGame';
import { BottomContainer } from '../BottomContainer';
import { BottomOpenGiftDialog } from './BottomOpenGiftDialog';
const { ccclass, property } = _decorator;

const FloatMinX = -180;
const FloatMaxX = 180;

@ccclass('BottomFloatGift')
export class BottomFloatGift extends Component {

    private _bottom: BottomContainer;

    private _direction = 1;//-1左1右
    private _openCount = 0;
    private _value = 0;

    init(bottom: BottomContainer) {
        this._bottom = bottom;
        this._value = 10;
    }

    getNewValue() {
        this._value += this._openCount;
        return this._value;
    }

    open() {
        this._openCount++;
        BottomOpenGiftDialog.show(this._bottom);
    }

    update(dt: number) {
        if (Core.game.state !== GameState.Gaming) return;

        let pos = this.node.tempPosition;
        if (pos.x < FloatMinX) {
            this._direction = 1;
        }
        else if (pos.x > FloatMaxX) {
            this._direction = -1;
        }
        let moveSpeed = Math.min(this._openCount, 10) / 10 * 260 + 40;
        pos.x += this._direction * moveSpeed * dt;
        this.node.position = pos;

    }
}


