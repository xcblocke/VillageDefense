import { _decorator, BitMask, Node, quat, Quat, TransformBit, v3, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
import { Controller } from './Controller';
const { ccclass, property, executeInEditMode } = _decorator;

const tempPos = v3();
const tempRot = quat();
const tempScale = v3();

function isValidValue(value: Vec3 | Quat) {
    if (!value) return false;
    if (isNaN(value.x)) return false;
    if (isNaN(value.y)) return false;
    if (isNaN(value.z)) return false;
    if (value instanceof Quat && isNaN(value.w)) return false;
    return true;
}

/**
 * 绑定到其他节点的TRS信息
 */
@ccclass('SyncTRS')
@executeInEditMode(true)
export class SyncTRS extends Controller {

    @property(Node)
    _bindNode: Node;

    @property(Node)
    get bindNode() {
        return this._bindNode;
    }
    set bindNode(value: Node) {
        if (EDITOR) {
            this._bindNode = value;
            return;
        }
        if (!!this._bindNode) {
            this._bindNode.off(Node.EventType.TRANSFORM_CHANGED, this._onTransformChanged, this);
        }
        this._bindNode = value;
        if (!!this._bindNode) {
            this._bindNode.on(Node.EventType.TRANSFORM_CHANGED, this._onTransformChanged, this);
            this._onTransformChanged(this.type);
        }
    }

    @property({
        type: BitMask({
            POSITION: TransformBit.POSITION,
            ROTATION: TransformBit.ROTATION,
            SCALE: TransformBit.SCALE,
        })
    })
    type = TransformBit.POSITION | TransformBit.ROTATION | TransformBit.SCALE;

    @property({ visible() { return !!(this.type & TransformBit.POSITION) } })
    posOffset: Vec3 = v3();

    @property({ visible() { return !!(this.type & TransformBit.SCALE) } })
    scaleOffset: Vec3 = v3();

    @property
    useWorldSpace = false;

    protected onLoad(): void {
        this.bindNode = this.bindNode;
    }

    protected update(dt: number): void {
        if (EDITOR) {
            this._onTransformChanged(this.type);
        }
    }

    private _onTransformChanged(type: number) {
        if (!this.bindNode) return;

        let pos: Vec3;
        let rot: Quat;
        let scale: Vec3;

        if ((this.type & TransformBit.POSITION) && (type & TransformBit.POSITION)) {
            pos = tempPos;
            if (this.useWorldSpace) {
                this.bindNode.getWorldPosition(pos).add(this.posOffset);
            }
            else {
                this.bindNode.getPosition(pos).add(this.posOffset);
            }
            if (!isValidValue(pos)) {
                pos = null;
            }
        }
        if ((this.type & TransformBit.ROTATION) && (type & TransformBit.ROTATION)) {
            rot = tempRot;
            if (this.useWorldSpace) {
                this.bindNode.getWorldRotation(rot);
            }
            else {
                this.bindNode.getRotation(rot);
            }
            if (!isValidValue(rot)) {
                rot = null;
            }
        }
        if ((this.type & TransformBit.SCALE) && (type & TransformBit.SCALE)) {
            scale = tempScale;
            if (this.useWorldSpace) {
                this.bindNode.getWorldScale(scale).add(this.scaleOffset);
            }
            else {
                this.bindNode.getScale(scale).add(this.scaleOffset);
            }
            if (!isValidValue(scale)) {
                scale = null;
            }
        }

        if (this.useWorldSpace) {
            pos && this.node.setWorldPosition(pos);
            rot && this.node.setWorldRotation(rot);
            scale && this.node.setWorldScale(scale);
        }
        else {
            this.node.setRTS(rot, pos, scale);
        }
    }

}


