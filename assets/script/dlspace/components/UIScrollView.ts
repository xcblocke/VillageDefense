import { _decorator, EventTouch, Mask, Node, Tween, tween, v2, v3, Vec2 } from 'cc';
import { Controller } from './Controller';
const { ccclass, property } = _decorator;

const v2_1 = v2();
const v2_2 = v2();
const v2_3 = v2();
const v2_4 = v2();
const v2_5 = v2();
const v2_6 = v2();

@ccclass('UIScrollView')
export class UIScrollView extends Controller {

    @property(Node)
    content: Node;

    private _scrollOffset = new Vec2();
    private _scrollMaxOffset = new Vec2();

    private _isScrolling = false;
    private _touchNode: Node;
    private _movingInertia = v2();

    private _autoMoveTween: Tween<any>;
    private _zoomScaleTween: Tween<Node>;

    private _clickCall: (node: Node) => void;
    private _clickNodes: Node[] = [];

    protected onLoad(): void {
        this.node.addUniqueComponent(Mask);
    }

    onEnable() {
        this._onContainerSizeChanged();
        this.content.on(Node.EventType.SIZE_CHANGED, this._onContainerSizeChanged, this);
        this.node.on(Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    onDisable() {
        this.content.off(Node.EventType.SIZE_CHANGED, this._onContainerSizeChanged, this);
        this.node.off(Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    protected update(dt: number): void {
        this.content.setPosition(- this._scrollOffset.x, this._scrollOffset.y + this.node.uiTransfrom.height / 2, 0);
    }

    init(clickCall: (node: Node) => void) {
        this._clickCall = clickCall;
    }

    addClickNode(node: Node) {
        this._clickNodes.push(node);
    }

    deleteClickNode(node: Node) {
        let index = this._clickNodes.indexOf(node);
        if (index !== -1) {
            this._clickNodes.splice(index, 1);
        }
    }

    clearClickNodes() {
        this._clickNodes.length = 0;
    }

    private _onContainerSizeChanged() {
        this._scrollMaxOffset.x = Math.max(0, this.content.uiTransfrom.width - this.node.uiTransfrom.width);
        this._scrollMaxOffset.y = Math.max(0, this.content.uiTransfrom.height - this.node.uiTransfrom.height);
    }

    private _addOffset(x: number, y: number) {
        let offset = this._scrollOffset;
        offset.add2f(-x, y);
        offset.clampf(Vec2.ZERO, this._scrollMaxOffset);
    }

    private _onTouchStart(event: EventTouch) {
        event.propagationStopped = true;

        this._isScrolling = false;
        this._clearAutoMoveTween();
        this._clearMovingInertia();

        if (!!this._clickCall) {
            let location = event.getLocation(v2_5);
            let windowId = event.windowId;
            for (const node of this._clickNodes) {
                if (node._uiProps.uiTransformComp.hitTest(location, windowId)) {
                    this._touchNode = node;
                    this._zoomScaleTween = tween(node).delay(0.1).to(0.2, { scale: v3(1, 1, 1).multiplyScalar(1.1) }).start();
                    break;
                }
            }
        }
    }

    private _onTouchMove(event: EventTouch) {
        event.propagationStopped = true;

        let delta = event.getUIDelta(v2_1);
        if (!this._isScrolling) {
            let start = event.getUIStartLocation(v2_5);
            let current = event.getUILocation(v2_6);
            let distance = Vec2.distance(start, current);
            if (distance > 10) {
                this._isScrolling = true;
                if (!!this._touchNode) {
                    this._clearZoomScaleTween();
                    this._zoomScaleTween = tween(this._touchNode).to(0.2, { scale: v3(1, 1, 1) }).start();
                    this._touchNode = null;
                }
            }
            return;
        }

        this.unschedule(this._clearMovingInertia);
        Vec2.copy(v2_2, this._scrollOffset);
        this._addOffset(delta.x, delta.y);
        Vec2.copy(this._movingInertia, this._scrollOffset).subtract(v2_2);
        this.scheduleOnce(this._clearMovingInertia, 0.1);
    }

    private _onTouchEnd(event: EventTouch) {
        event.propagationStopped = true;

        if (!this._isScrolling) {
            if (!!this._touchNode) {
                this._clearZoomScaleTween();
                this._zoomScaleTween = tween(this._touchNode).to(0.2, { scale: v3(1, 1, 1) }).start();

                this._clickCall && this._clickCall(this._touchNode);

                this._touchNode = null;
            }
            return;
        }

        this.unschedule(this._clearMovingInertia);

        if (this._movingInertia.x !== 0 || this._movingInertia.y !== 0) {
            let tweenObj = { t: 1 };
            this._autoMoveTween = tween(tweenObj).to(1, { t: 0 }, {
                easing: 'linear',
                onUpdate: () => {
                    v2_3.set(this._movingInertia).multiplyScalar(tweenObj.t);
                    this._addOffset(-v2_3.x, v2_3.y);
                }
            }).call(() => {
                this._movingInertia.set(0, 0);
                this._autoMoveTween = null;
            }).start();
        }

    }

    private _clearAutoMoveTween() {
        if (!!this._autoMoveTween) {
            this._autoMoveTween.stop();
            this._autoMoveTween = null;
        }
    }

    private _clearZoomScaleTween() {
        if (!!this._zoomScaleTween) {
            this._zoomScaleTween.stop();
            this._zoomScaleTween = null;
        }
    }

    private _clearMovingInertia() {
        this._movingInertia.set(0, 0);
    }


}