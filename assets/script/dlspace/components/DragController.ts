import { _decorator, Enum, EventTouch, NodeEventType, v2, v3 } from "cc";
import { Controller } from "./Controller";
const { ccclass, property, type } = _decorator;

export enum DragDirection {
    All,
    Horizontal,
    Vertical,
}

const Container_min = v3();
const Container_max = v3();
const v2_1 = v2();

@ccclass('DragController')
export class DragController extends Controller {

    @type(Enum(DragDirection))
    direction = DragDirection.All;

    @property
    outParent = false;

    protected onLoad() {
        this.node.on(NodeEventType.TOUCH_MOVE, this._onDraged, this);
    }

    protected onDestroy() {
        this.node.off(NodeEventType.TOUCH_MOVE, this._onDraged, this);
    }

    private _onDraged(event: EventTouch) {
        let delt = event.getUIDelta(v2_1);
        let pos = this.node.tempPosition;
        if (this.direction === DragDirection.All || this.direction === DragDirection.Horizontal) {
            pos.x += delt.x;
        }
        if (this.direction === DragDirection.All || this.direction === DragDirection.Vertical) {
            pos.y += delt.y;
        }
        if (!this.outParent && !!this.node.parent) {
            let contentSize = this.node.uiTransfrom.contentSize;
            let parentSize = this.node.parent.uiTransfrom.contentSize;
            Container_min.set(-parentSize.width / 2, -parentSize.height / 2).add3f(contentSize.width / 2, contentSize.height / 2, 0);
            Container_max.set(parentSize.width / 2, parentSize.height / 2).subtract3f(contentSize.width / 2, contentSize.height / 2, 0);
            pos.clampf(Container_min, Container_max);
        }
        this.node.position = pos;

        event.propagationStopped = true;
    }
}