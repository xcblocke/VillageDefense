import { _decorator, ccenum, EventTouch, instantiate, Mask, Node, NodePool, rect, Rect, Size, tween, Tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { Controller } from './Controller';
const { ccclass, property } = _decorator;

const VirtualListDefaultConfig = {
    /**
     * 点击缩放效果比例
     */
    zoomScale: 1.1,
    /**
     * 点击缩放效果动画时间(秒)
     */
    zoomTime: 0.2,
    /**
     * 惯性持续时长(秒)
     */
    inertiaTime: 1,
}

export class VRect extends Rect {
    /**
     * 内部记录下标，用于计算
     */
    cellIndex = 0;
    /**
     * 当前节点额外的spaceX
     */
    offsetX = 0;
    /**
     * 当前节点额外的spaceY,
     */
    offsetY = 0;
    /**
     * 当前节点层级优先级,默认0不处理，优先级越高越在上层
     */
    priority = 0;
}

export enum ScrollPositionType {
    Start = 0,
    Center,
    End
}

export type VirtualListSetRectCall = (rect: VRect, index: number) => void;
export type VirtualListSetCellCall = (node: Node, index: number) => void;
export type VirtualListCellClickCall = (node: Node, index: number) => void;

export enum VirtualListLayoutType {
    /**
     * 垂直列表布局(水平居中、垂直滑动)
     */
    ListVertical,
    /**
     * 水平列表布局(垂直居中、水平滑动)
     */
    ListHorizontal,
    /**
     * 网格垂直布局(垂直滑动)
     */
    GridVertical,
    /**
     * 网格水平布局(水平滑动)
     */
    GridHorizontal,
    /**
     * 自定义布局(手动设置cell的x,y,width,height,任意滑动在区域内)
     */
    Custom
}
ccenum(VirtualListLayoutType);

const v2_1 = v2();
const v2_2 = v2();
const v2_3 = v2();
const v2_4 = v2();
const v2_5 = v2();
const v2_6 = v2();
const DrawRect = rect();

@ccclass('VirtualList')
export class VirtualList extends Controller {

    @property({ type: VirtualListLayoutType, displayName: '布局' })
    layoutType = VirtualListLayoutType.ListVertical;

    @property({ visible() { return this.layoutType !== VirtualListLayoutType.Custom && this.layoutType !== VirtualListLayoutType.ListHorizontal } })
    paddingTop = 0;

    @property({ visible() { return this.layoutType !== VirtualListLayoutType.Custom && this.layoutType !== VirtualListLayoutType.ListHorizontal } })
    paddingBottom = 0;

    @property({ visible() { return this.layoutType !== VirtualListLayoutType.Custom && this.layoutType !== VirtualListLayoutType.ListVertical } })
    paddingLeft = 0;

    @property({ visible() { return this.layoutType !== VirtualListLayoutType.Custom && this.layoutType !== VirtualListLayoutType.ListVertical } })
    paddingRight = 0;

    @property({ visible() { return this.layoutType !== VirtualListLayoutType.Custom && this.layoutType !== VirtualListLayoutType.ListVertical } })
    spacingX = 0;

    @property({ visible() { return this.layoutType !== VirtualListLayoutType.Custom && this.layoutType !== VirtualListLayoutType.ListHorizontal } })
    spacingY = 0;

    zoomScale = VirtualListDefaultConfig.zoomScale;
    zoomTime = VirtualListDefaultConfig.zoomTime;
    inertiaTime = VirtualListDefaultConfig.inertiaTime;

    private _cloneNode: Node;
    private _content: Node;
    private _nodePool: NodePool = new NodePool();

    private _num = 0;

    private _containerOffset = new Vec3();
    private _drawRect = new Rect();
    private _scrollOffset = new Vec2();
    private _scrollMaxOffset = new Vec2();
    private _contentSize = new Size();
    private _rects: VRect[] = [];

    private _isTouching = false;
    private _isScrolling = false;
    private _touchNode: Node;
    private _movingInertia = v2();

    private _autoMoveTween: Tween<any>;
    private _zoomScaleTween: Tween<Node>;

    private _map: Map<VRect, Node> = new Map();
    private _map2: Map<Node, VRect> = new Map();

    private _setRectCall: VirtualListSetRectCall;
    private _setCellCall: VirtualListSetCellCall;
    private _cellClickCall: VirtualListCellClickCall;

    onLoad() {
        this.node.addUniqueComponent(Mask);

        this._cloneNode = this.node.children[0];
        this._cloneNode.parent = null;

        this._content = new Node();
        this._content.parent = this.node;
        this._content.addComponent(UITransform).setAnchorPoint(0, 1);
        this._onSizeChanged();
    }

    /**
     * 初始化构造函数，需要手动调用并需要传入三个回调函数，传入可为空
     * @param setRectCall 设置cell的尺寸
     * @param setCellCall 设置cell节点上的内容
     * @param cellClickCall cell的点击回调
     */
    init(setRectCall?: VirtualListSetRectCall, setCellCall?: VirtualListSetCellCall, cellClickCall?: VirtualListCellClickCall) {
        this._setRectCall = setRectCall;
        this._setCellCall = setCellCall;
        this._cellClickCall = cellClickCall;
    }

    /**
     * 设置数据数量
     */
    set num(value: number) {
        this._num = value;
        this.reload();
    }

    /**
     * 获取内容尺寸
     */
    get contentSize() {
        return this._contentSize;
    }

    /**
     * 当前滚动的偏移量
     */
    get scrollOffset() {
        return this._scrollOffset;
    }

    /**
     * 最大可滚动的偏移量
     */
    get scrollMaxOffset() {
        return this._scrollMaxOffset;
    }

    /**
     * 是否手势滚动中
     */
    get isTouching() {
        return this._isTouching;
    }

    /**
     * 滚动到顶部
     * @param duration 默认动画时间1s，如果是null则禁止动画
     */
    scrollToTop(duration = 1) {
        this.scrollTo(Vec2.ZERO, duration);
    }

    /**
     * 滚动到底部
     * @param duration 默认动画时间1s，如果是null则禁止动画
     */
    scrollToBottom(duration = 1) {
        this.scrollTo(this._scrollMaxOffset, duration);
    }

    /**
     * 滚动到指定下标
     * @param index 
     * @param type 滚动的位置类型
     * @param duration 默认动画时间1s，如果是null则禁止动画
     */
    scrollToIndex(index: number, type = ScrollPositionType.Start, duration = 1) {
        let rect = this._rects[index];
        if (!rect) return;
        let offset = v2();
        if (type === ScrollPositionType.Start) {
            offset.set(rect.x, rect.y);
            offset.subtract2f(this.spacingX / 2, this.spacingY / 2);
        }
        else if (type === ScrollPositionType.Center) {
            offset.set(rect.x - (this._drawRect.width - rect.width) / 2, rect.y - (this._drawRect.height - rect.height) / 2);
        }
        else if (type === ScrollPositionType.End) {
            offset.set(rect.x - (this._drawRect.width - rect.width), rect.y - (this._drawRect.height - rect.height));
            offset.add2f(this.spacingX / 2, this.spacingY / 2);
        }
        this.scrollTo(offset, duration);
    }

    /**
     * 滚动到指定位置
     * @param offset 
     * @param duration 默认动画时间1s，如果是null则禁止动画
     */
    scrollTo(offset: Vec2, duration = 1) {
        this._cancelTouchEvent();

        let endOffset = offset.clone();
        endOffset.clampf(Vec2.ZERO, this._scrollMaxOffset);

        if (duration === null) {
            this.scrollOffset.set(endOffset);
            return;
        }
        let startOffset = this.scrollOffset.clone();
        let tweenObj = { t: 0 };
        this._autoMoveTween = tween(tweenObj).to(duration, { t: 1 }, {
            easing: 'linear',
            onUpdate: () => {
                Vec2.lerp(v2_4, startOffset, endOffset, tweenObj.t);
                this.scrollOffset.set(v2_4);
            }
        }).call(() => {
            this._movingInertia.set(0, 0);
            this._autoMoveTween = null;
        }).start();
    }

    /**
     * 刷新并重新布局
     */
    reload() {
        this._cancelTouchEvent();

        for (const node of this._map.values()) {
            this._putNode(node);
        }
        this._map.clear();
        this._map2.clear();
        this._rects.length = 0;
        if (this.layoutType === VirtualListLayoutType.ListVertical) {
            this._layoutForListVertical();
        }
        else if (this.layoutType === VirtualListLayoutType.ListHorizontal) {
            this._layoutForListHorizontal();
        }
        else if (this.layoutType === VirtualListLayoutType.GridVertical) {
            this._layoutForGridVertical();
        }
        else if (this.layoutType === VirtualListLayoutType.GridHorizontal) {
            this._layoutForGridHorizontal();
        }
        else if (this.layoutType === VirtualListLayoutType.Custom) {
            this._layoutForCustom();
        }
        this._scrollOffset.clampf(Vec2.ZERO, this._scrollMaxOffset);
    }

    /**
     * 刷新根据下标(只更新cell上的内容，不更新尺寸)
     * @param index 
     * @returns 
     */
    reloadWithIndex(index: number) {
        let rect = this._rects[index];
        if (!rect) return;
        let node = this._map.get(rect);
        if (!node) return;
        this._setCellCall && this._setCellCall(node, rect.cellIndex);
    }

    /**
     * 获取cell的下标, 找不到返回-1
     * @param cell 
     * @returns 
     */
    getCellIndex(cell: Node): number | -1 {
        return this._map2.get(cell)?.cellIndex ?? -1;
    }

    onEnable() {
        this.node.on(Node.EventType.SIZE_CHANGED, this._onSizeChanged, this);
        this.node.on(Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    onDisable() {
        this.node.off(Node.EventType.SIZE_CHANGED, this._onSizeChanged, this);
        this.node.off(Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    update(dt: number) {
        this._content.setPosition(this._containerOffset.x - this._scrollOffset.x, this._containerOffset.y + this._scrollOffset.y, this._containerOffset.z);
        this._drawRect.x = this._scrollOffset.x;
        this._drawRect.y = this._scrollOffset.y;

        let keys = Array.from(this._map.keys());

        DrawRect.set(this._drawRect);

        for (const rect of keys) {
            if (!DrawRect.intersects(rect)) {
                let node = this._map.get(rect);
                this._map.delete(rect);
                this._map2.delete(node);
                this._putNode(node);
            }
        }

        for (let rect of this._rects) {
            if (DrawRect.intersects(rect)) {
                if (!this._map.has(rect)) {
                    let node = this._getNode();
                    node.setPosition(rect.x + rect.width / 2, -rect.y - rect.height / 2, 0);
                    node._uiProps.uiTransformComp.setContentSize(rect.width, rect.height);
                    if (rect.priority !== 0) {
                        node._uiProps.uiTransformComp.priority = rect.priority;
                    }
                    this._map.set(rect, node);
                    this._map2.set(node, rect);

                    let index = rect.cellIndex;
                    this._setCellCall && this._setCellCall(node, index);
                }
            }
        }
    }

    private _onSizeChanged() {
        let contentSize = this.node._uiProps.uiTransformComp.contentSize;
        this._content.setPosition(-contentSize.width / 2, contentSize.height / 2, 0);
        this._containerOffset.set(this._content.position);
        this._drawRect.set(0, 0, contentSize.width, contentSize.height);
    }

    private _cancelTouchEvent() {
        this._isTouching = false;
        this._isScrolling = false;
        this._clearAutoMoveTween();
        this._clearZoomScaleTween();
        this._clearMovingInertia();
        if (!!this._touchNode) {
            this._touchNode.setScale(1, 1, 1);
            this._touchNode = null;
        }
    }

    private _onTouchStart(event: EventTouch) {
        event.propagationStopped = true;

        this._isTouching = true;
        this._isScrolling = false;
        this._clearAutoMoveTween();
        this._clearZoomScaleTween();
        this._clearMovingInertia();

        if (!!this._cellClickCall) {
            let location = event.getLocation(v2_5);
            let windowId = event.windowId;
            for (const node of this._content.children) {
                if (node._uiProps.uiTransformComp.hitTest(location, windowId)) {
                    this._touchNode = node;
                    this._zoomScaleTween = tween(node).delay(0.1).to(this.zoomTime, { scale: v3(1, 1, 1).multiplyScalar(this.zoomScale) }).start();
                    break;
                }
            }
        }
    }

    private _onTouchMove(event: EventTouch) {
        event.propagationStopped = true;

        if (!this._isTouching) {
            return;
        }
        let delta = event.getUIDelta(v2_1);
        if (!this._isScrolling) {
            let start = event.getUIStartLocation(v2_5);
            let current = event.getUILocation(v2_6);
            let distance = Vec2.distance(start, current);
            if (distance > 10) {
                this._isScrolling = true;
                if (!!this._touchNode) {
                    this._clearZoomScaleTween();
                    this._zoomScaleTween = tween(this._touchNode).to(this.zoomTime, { scale: v3(1, 1, 1) }).start();
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

        if (!this._isTouching) {
            return;
        }
        if (!this._isScrolling) {
            if (!!this._touchNode) {
                this._clearZoomScaleTween();
                this._zoomScaleTween = tween(this._touchNode).to(this.zoomTime, { scale: v3(1, 1, 1) }).start();
                let rect = this._map2.get(this._touchNode);
                if (!!rect) {
                    this._cellClickCall && this._cellClickCall(this._touchNode, rect.cellIndex);
                }
                this._touchNode = null;
            }
            return;
        }
        this.unschedule(this._clearMovingInertia);
        this._isTouching = false;

        if (this._movingInertia.x !== 0 || this._movingInertia.y !== 0) {
            let tweenObj = { t: 1 };
            this._autoMoveTween = tween(tweenObj).to(this.inertiaTime, { t: 0 }, {
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

    private _addOffset(x: number, y: number) {
        let offset = this._scrollOffset;
        offset.add2f(-x, y);
        offset.clampf(Vec2.ZERO, this._scrollMaxOffset);
    }

    private _getNode(): Node {
        let node: Node;
        if (this._nodePool.size() > 0) {
            node = this._nodePool.get();
        }
        else {
            node = instantiate(this._cloneNode);
        }
        node.parent = this._content;
        node.active = true;
        node.setScale(1, 1, 1);
        return node;
    }

    private _putNode(node: Node) {
        node.active = false;
        this._nodePool.put(node);
    }

    private _layoutForListVertical() {
        let yOffset = this.paddingTop;
        let { width, height } = this._cloneNode._uiProps.uiTransformComp.contentSize;
        for (let i = 0; i < this._num; i++) {
            let rect = new VRect();
            rect.width = width;
            rect.height = height;
            this._setRectCall && this._setRectCall(rect, i);
            rect.cellIndex = i;
            let xOffset = (this._drawRect.width - rect.width) / 2;
            rect.x = xOffset + rect.offsetX;
            rect.y = yOffset + rect.offsetY;
            this._rects.push(rect);

            yOffset = rect.y + rect.height + this.spacingY;
        }
        let maxY = 0;
        if (this._rects.length > 0) {
            let lastRect = this._rects[this._rects.length - 1];
            maxY = lastRect.y + lastRect.height;
        }
        this._contentSize.set(this._drawRect.width, maxY + this.paddingBottom);
        this._content._uiProps.uiTransformComp.setContentSize(this._contentSize.width, this._contentSize.height);
        this._scrollMaxOffset.x = 0;
        this._scrollMaxOffset.y = Math.max(0, this._contentSize.height - this._drawRect.height);
    }

    private _layoutForListHorizontal() {
        let xOffset = this.paddingLeft;
        let { width, height } = this._cloneNode._uiProps.uiTransformComp.contentSize;
        for (let i = 0; i < this._num; i++) {
            let rect = new VRect();
            rect.width = width;
            rect.height = height;
            this._setRectCall && this._setRectCall(rect, i);
            rect.cellIndex = i;
            let yOffset = (this._drawRect.height - rect.height) / 2;
            rect.x = xOffset + rect.offsetX;
            rect.y = yOffset + rect.offsetY;
            this._rects.push(rect);

            xOffset = rect.x + rect.width + this.spacingX;
        }
        let maxX = 0;
        if (this._rects.length > 0) {
            let lastRect = this._rects[this._rects.length - 1];
            maxX = lastRect.x + lastRect.width;
        }
        this._contentSize.set(maxX + this.paddingRight, this._drawRect.height);
        this._content._uiProps.uiTransformComp.setContentSize(this._contentSize.width, this._contentSize.height);
        this._scrollMaxOffset.x = Math.max(0, this._contentSize.width - this._drawRect.width);
        this._scrollMaxOffset.y = 0;
    }

    private _layoutForGridVertical() {
        let xOffset = this.paddingLeft;
        let yOffset = this.paddingTop;
        let { width, height } = this._cloneNode._uiProps.uiTransformComp.contentSize;
        for (let i = 0; i < this._num; i++) {
            let rect = new VRect();
            rect.width = width;
            rect.height = height;
            this._setRectCall && this._setRectCall(rect, i);
            rect.cellIndex = i;
            rect.x += rect.offsetX;
            rect.y += rect.offsetY;

            if (xOffset !== this.paddingLeft && xOffset + rect.width > this._drawRect.width) {
                yOffset += rect.height + this.spacingY;
                xOffset = this.paddingLeft;
            }

            rect.x = xOffset;
            rect.y = yOffset;
            this._rects.push(rect);

            xOffset += rect.width + this.spacingX;
        }
        let maxY = 0;
        if (this._rects.length > 0) {
            let lastRect = this._rects[this._rects.length - 1];
            maxY = lastRect.y + lastRect.height;
        }
        this._contentSize.set(this._drawRect.width, maxY + this.paddingBottom);
        this._content._uiProps.uiTransformComp.setContentSize(this._contentSize.width, this._contentSize.height);
        this._scrollMaxOffset.x = 0;
        this._scrollMaxOffset.y = Math.max(0, this._contentSize.height - this._drawRect.height);
    }

    private _layoutForGridHorizontal() {
        let xOffset = this.paddingLeft;
        let yOffset = this.paddingTop;
        let { width, height } = this._cloneNode._uiProps.uiTransformComp.contentSize;
        for (let i = 0; i < this._num; i++) {
            let rect = new VRect();
            rect.width = width;
            rect.height = height;
            this._setRectCall && this._setRectCall(rect, i);
            rect.cellIndex = i;
            rect.x += rect.offsetX;
            rect.y += rect.offsetY;

            if (yOffset !== this.paddingTop && yOffset + rect.height > this._drawRect.height) {
                xOffset += rect.width + this.spacingX;
                yOffset = this.paddingTop;
            }

            rect.x = xOffset;
            rect.y = yOffset;
            this._rects.push(rect);

            yOffset += rect.height + this.spacingY;
        }
        let maxX = 0;
        if (this._rects.length > 0) {
            let lastRect = this._rects[this._rects.length - 1];
            maxX = lastRect.x + lastRect.width;
        }
        this._contentSize.set(maxX + this.paddingRight, this._drawRect.height);
        this._content._uiProps.uiTransformComp.setContentSize(this._contentSize.width, this._contentSize.height);
        this._scrollMaxOffset.x = Math.max(0, this._contentSize.width - this._drawRect.width);
        this._scrollMaxOffset.y = 0;
    }

    private _layoutForCustom() {
        let maxX = 0;
        let maxY = 0;

        for (let i = 0; i < this._num; i++) {
            let rect = new VRect();
            this._setRectCall && this._setRectCall(rect, i);
            rect.cellIndex = i;
            rect.x += rect.offsetX;
            rect.y += rect.offsetY;
            maxX = Math.max(rect.x + rect.width, maxX);
            maxY = Math.max(rect.y + rect.height, maxY);

            this._rects.push(rect);
        }
        this._contentSize.set(maxX, maxY);
        this._content._uiProps.uiTransformComp.setContentSize(this._contentSize.width, this._contentSize.height);
        this._scrollMaxOffset.x = Math.max(0, this._contentSize.width - this._drawRect.width);
        this._scrollMaxOffset.y = Math.max(0, this._contentSize.height - this._drawRect.height);
    }


}


