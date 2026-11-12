import { _decorator, AudioClip, EventTouch, instantiate, Label, Layout, Node, Prefab, tween, v2, view } from 'cc';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { UIMgr } from '../../dlspace/common/UIMgr';
import { Controller } from '../../dlspace/components/Controller';
import { TweenUtils } from '../../dlspace/utils/TweenUtils';
import { Bundle } from '../../global/Bundle';
const { ccclass, property } = _decorator;

const v2_1 = v2();

@ccclass('GuideDialog')
export class GuideDialog extends Controller {

    @property(Node)
    content: Node;

    @property(Node)
    detail: Node;

    @property(Node)
    handNode: Node;

    @property(Label)
    titleLabel: Label;

    @property(Label)
    descLabel: Label;

    @property(Label)
    descLabel2: Label;

    @property(Label)
    nextBtnLabel: Label;

    private _target: Node;
    private _call: Function;
    private _nextCall: Function;
    private _isFirst = true;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/guideDialog", Prefab);
    }

    static init() {
        let prefab = this._getPrefab();
        let node = instantiate(prefab);
        node.parent = UIMgr.instance.dialogParent;
        TweenUtils.modifyOpacity(node, 0, 255, null, 0.3);
        return node.getComponent(GuideDialog);
    }

    protected start(): void {
        let startPos = this.handNode.getPosition();
        let endPos = this.handNode.getPosition();
        startPos.y += 20;
        endPos.y -= 5;
        tween(this.handNode).to(1, { position: startPos }).to(1, { position: endPos }).union().repeat(999).start();
    }

    show(target: Node, title: string, desc: string, call: Function, nextCall: Function, nextBtnTitle = '下一步') {
        this._target = target;

        if (this._isFirst) {
            this._call = call;
            this._nextCall = nextCall;
            this.content.worldPosition = target.worldPosition;
        }
        else {
            tween(this.content).to(0.5, { worldPosition: target.worldPosition }, { easing: 'backOut' }).call(() => {
                this._call = call;
                this._nextCall = nextCall;
            }).start();
        }
        this.titleLabel.string = title;
        this.titleLabel.node.uiTransfrom.anchorX = target.worldPosition.x / view.getVisibleSize().width;
        this.descLabel.string = title;
        this.descLabel2.string = desc;
        this.nextBtnLabel.string = nextBtnTitle;
        this._isFirst = false;
        this.content.active = true;
        this.detail.active = false;
    }

    protected onEnable(): void {
        this.node.on(Node.EventType.TOUCH_END, this._touchEnd, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.TOUCH_END, this._touchEnd, this);
    }

    onClickContinue() {
        this._nextCall && this._nextCall();
        this._nextCall = null;
    }

    private _touchEnd(event: EventTouch) {
        let location = event.getLocation(v2_1);
        let windowId = event.windowId;
        if (this._target.uiTransfrom.hitTest(location, windowId)) {
            if (this._call) {
                AudioMgr.inst.playOneShot(Bundle.audio.get('click', AudioClip));
                this._call();

                this.scheduleOnce(() => {
                    this.content.active = false;
                    this.detail.active = true;
                    this.detail.getComponent(Layout).updateLayout();
                    this.detail.setPosition(0, -view.getVisibleSize().height / 2, 0);
                    let endPos = this.detail.getPosition();
                    this.detail.position = this.detail.tempPosition.add3f(0, -this.detail.uiTransfrom.height, 0);
                    tween(this.detail).to(0.3, { position: endPos }).start();
                }, 0.2);
            }
            this._call = null;
        }
    }

}


