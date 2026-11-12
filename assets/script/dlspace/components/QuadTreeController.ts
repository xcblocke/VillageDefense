import { Node, TransformBit, UITransform, _decorator } from "cc";
import { Point, QuadTree, Rectangle } from "../controls/QuadTree";
import { Controller } from "./Controller";

const { ccclass, property } = _decorator;

/**
 * 四叉树组件，添加进该节点下会自动管理，只需要调用query相关函数即可查询都有哪些节点在范围内
 * 默认使用本地坐标(性能快,需要在不同图层时查询时转换坐标为该节点下的坐标)
 */
@ccclass('QuadTreeController')
export class QuadTreeController extends Controller {

    private _quadTree: QuadTree<Point>;
    private _points: Map<Node, Point> = new Map();
    private _points2: Map<Point, Node> = new Map();

    /**
     * 查询圆形范围内的节点
     * @param radius 半径
     * @param cx 中心点x
     * @param cy 中心店y
     * @returns 
     */
    public queryInCircle(radius: number, cx: number, cy: number): Node[] {
        let range = new Rectangle(cx - radius, cy - radius, radius * 2, radius * 2);
        return this._queryInRectangle(range, true);
    }

    /**
     * 查询矩形范围内的节点
     * @param halfWidth 宽度的一半
     * @param halfHeight 高度的一半
     * @param cx 中心点x
     * @param cy 中心点y
     * @returns 
     */
    public queryInRect(halfWidth: number, halfHeight: number, cx: number, cy: number): Node[] {
        let range = new Rectangle(cx - halfWidth, cy - halfHeight, halfWidth * 2, halfHeight * 2);
        return this._queryInRectangle(range, false);
    }

    /**
     * 获取矩形范围内的节点
     * @param range 矩形范围
     * @returns 
     */
    public queryInRectangle(range: Rectangle): Node[] {
        return this._queryInRectangle(range, false);
    }

    protected onLoad(): void {
        let transform = this.node.getComponent(UITransform);
        let boundingBox = transform.getBoundingBox();
        const worldRectangle = new Rectangle(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
        this._quadTree = new QuadTree(worldRectangle, 32);
    }

    protected onEnable(): void {
        this.node.on(Node.EventType.CHILD_ADDED, this._childAdded, this);
        this.node.on(Node.EventType.CHILD_REMOVED, this._childRemoved, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.CHILD_ADDED, this._childAdded, this);
        this.node.off(Node.EventType.CHILD_REMOVED, this._childRemoved, this);
    }

    private _queryInRectangle(range: Rectangle, isCircle = false): Node[] {
        let points = this._quadTree.query(range);
        if (isCircle) {
            let cx = range.x + range.width / 2;
            let cy = range.y + range.height / 2;
            const minRadius = Math.min(range.width / 2, range.height / 2);
            points = points.filter((point) => {
                return (point.x - cx) ** 2 + (point.y - cy) ** 2 <= minRadius ** 2;
            });
        }
        let nodes: Node[] = [];
        for (const point of points) {
            let node = this._points2.get(point);
            if (!!node) {
                nodes.push(node);
            }
        }
        return nodes;
    }

    protected _childAdded(child: Node) {
        let point = new Point(child.position.x, child.position.y);
        this._quadTree.add(point);
        this._points.set(child, point);
        this._points2.set(point, child);

        child['_childTransformChanged'] = (type: TransformBit) => {
            if (type !== TransformBit.POSITION) {
                return;
            }
            this._childTransformChanged(child);
        };
        child.on(Node.EventType.TRANSFORM_CHANGED, child['_childTransformChanged']);
    }

    protected _childRemoved(child: Node) {
        let point = this._points.get(child);
        if (!!point) {
            this._quadTree.delete(point);
            this._points.delete(child);
            this._points2.delete(point);
        }

        child.off(Node.EventType.TRANSFORM_CHANGED, child['_childTransformChanged']);
        child['_childTransformChanged'] = null;
    }

    protected _childTransformChanged(child: Node) {
        let point = this._points.get(child);
        if (!!point) {
            this._quadTree.delete(point);
            point.x = child.position.x;
            point.y = child.position.y;
            this._quadTree.add(point);
        }
    }

}