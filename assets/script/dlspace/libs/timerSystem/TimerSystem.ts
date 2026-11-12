import { _decorator, director, System } from 'cc';
import { SaveProp } from '../../utils/SaveProp';
const { ccclass, property } = _decorator;

export class TimerSystem extends System {

    @SaveProp.decorator(null)
    private lastTime: number;

    private _updateDt = 0;
    private _objects: Object[] = [];

    static timeScale = 1;

    constructor() {
        super();

        SaveProp.initObject(this);
    }

    update(dt: number): void {
        this._updateDt += dt;
        if (this._updateDt >= 1) {
            this._updateDt = 0;

            const now = this._getNow();
            const lastTime = this.lastTime ?? now;
            this.lastTime = now;
            let delay = (now - lastTime) / 1000;
            this._tick(delay * TimerSystem.timeScale);
        }
    }

    private _getNow() {
        return Date.now();
    }

    private _tick(seconds: number) {
        for (const object of this._objects) {
            let keys = Object.keys(object);
            for (const key of keys) {
                let num: number = object[key];
                if (typeof (num) === 'number') {
                    object[key] = Math.max(0, num - seconds);
                }
            }
        }
    }

    static instance: TimerSystem;
    static registerSystem(objects: Object[] = []) {
        if (!this.instance) {
            this.instance = new TimerSystem();
            this.instance._objects = objects;
            director.registerSystem('TimerSystem', this.instance, System.Priority.LOW);
        }
    }
}


