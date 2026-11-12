import { _decorator, BlockInputEvents, instantiate, Node, Prefab } from 'cc';
import { UIMgr } from '../common/UIMgr';
import { TweenFadeInType, TweenUtils } from '../utils/TweenUtils';
import { Controller } from './Controller';
const { ccclass, property } = _decorator;

enum DialogEventType {
    OnClose = 'OnClose',
    OnDestroy = 'OnDestroy'
}

@ccclass('DialogController')
export class DialogController extends Controller {

    @property(Node)
    mask: Node;

    @property(Node)
    content: Node;

    static EventType = DialogEventType;

    protected _fadeInAnim: TweenFadeInType | null = 'fromSmall';

    static show(...args: any[]) {
        let prefab = this._getPrefab();
        let node = instantiate(prefab);
        node.parent = UIMgr.instance.dialogParent;

        node.addUniqueComponent(BlockInputEvents);
        let comp = node.getComponent(DialogController);
        comp.open(...args);

        return comp;
    }

    open(...args: any[]) {
        if (this._fadeInAnim !== null) {
            TweenUtils.fadeIn(this.content, this._fadeInAnim, null, 0.5);
            TweenUtils.modifyOpacity(this.mask, 0, 255, null, 0.2);
        }
        this._open(...args);
    }

    close() {
        this.node.emit(DialogController.EventType.OnClose);
        TweenUtils.fadeOut(this.mask, null, 0.1);
        TweenUtils.fadeOut(this.content, () => {
            this.node.emit(DialogController.EventType.OnDestroy);
            this.node.destroy();
        }, 0.1);
    }

    protected static _getPrefab(): Prefab {
        return null;
    }

    protected _open(...args: any[]) {
        //...todo something
    }

}


