import { _decorator } from "cc";
import { Controller } from "./Controller";
const { ccclass, property } = _decorator;

@ccclass("GameController")
export abstract class GameController<State> extends Controller {

    protected _state: State;

    get state() {
        return this._state;
    }
    set state(state: State) {
        if (state === this.state) {
            return;
        }
        let oldState = this.state;
        this._state = state;
        this._onStateChanged(state, oldState);
    }

    protected abstract _onStateChanged(state: State, oldState: State): void;

}