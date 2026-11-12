import { BlockInputEvents, Layers, Node, NodeEventType, Widget } from "cc";
import { UIMgr } from "../dlspace/common/UIMgr";
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html
export class LockMgr {
    private static _num = 0;
    private static _lockNode: Node;

    static lock() {
        this._num++;
        this._reload();
    }

    static unlock() {
        this._num--;
        this._reload();
    }

    private static _reload() {
        let lockNode = this._getLockNode();
        lockNode.active = this._num > 0;
    }

    private static _getLockNode() {
        if (!this._lockNode) {
            let node = new Node('LOCK_MGR');
            node.layer = Layers.Enum.UI_2D;
            node.parent = UIMgr.instance.topParent;

            const widget = node.addComponent(Widget);
            widget.top = widget.bottom = widget.left = widget.right = 0;
            widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;

            node.addComponent(BlockInputEvents);

            node.on(NodeEventType.NODE_DESTROYED, () => {
                this._lockNode = null;
                LockMgr._num = 0;
            });
            this._lockNode = node;
        }
        return this._lockNode;
    }
}