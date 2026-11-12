import { _decorator } from 'cc';
import { Controller } from './Controller';

const { ccclass, property } = _decorator;

/**
 * 排队队列在update取出数据
 */
@ccclass('WaitQueueController')
export abstract class WaitQueueController<T> extends Controller {

    protected _waitDatas: T[] = [];
    protected _currentData: T = null;
    protected _isLock = false;

    onLoad() {
    }

    addData(data: T) {
        this._waitDatas.push(data);
    }

    update(dt: number) {
        if (this._waitDatas.length > 0 && !this._currentData) {
            this._currentData = this._waitDatas.shift();
        }

        if (this._currentData && !this._isLock) {
            this._isLock = true;
            this._next(this._currentData, () => {
                this._isLock = false;
                this._currentData = null;
            });
        }
    }

    protected abstract _next(data: T, call: () => void): void;

}