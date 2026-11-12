export class StateMachine<State> {

    private _state: State;
    private _onStateChanged: (state: State) => void;

    get state() {
        return this._state;
    }
    set state(state: State) {
        if (state === this.state) {
            return;
        }
        this._state = state;
        this._onStateChanged && this._onStateChanged(state);
    }

    constructor(defaultState: State, onStateChanged?: (state: State) => void) {
        this._state = defaultState;
        this._onStateChanged = onStateChanged;
    }

}