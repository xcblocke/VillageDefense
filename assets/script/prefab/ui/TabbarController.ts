import { _decorator, AudioClip, EventTouch, instantiate, Label, Node, Prefab, SpriteFrame, tween, v2, v3, view } from 'cc';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { Controller } from '../../dlspace/components/Controller';
import { UISprite } from '../../dlspace/components/UISprite';
import { Utils } from '../../dlspace/utils/Utils';
import { Bundle } from '../../global/Bundle';
import { LockMgr } from '../../utils/LockMgr';
const { ccclass, property } = _decorator;

const v2_1 = v2();

@ccclass('TabbarItem')
class TabbarItem {
    @property(SpriteFrame)
    ico: SpriteFrame;

    @property
    title = '';

    @property(Prefab)
    page: Prefab;

    node: Node;
}

@ccclass('TabbarController')
export class TabbarController extends Controller {

    @property(TabbarItem)
    items: TabbarItem[] = [];

    @property
    spaceX = 0;

    @property(Node)
    statusBar: Node;

    @property(Node)
    tabbar: Node;

    @property(Node)
    container: Node;

    private _prefabNode: Node;
    private _nodes: Node[] = [];
    private _selectedIndex: number;

    protected onLoad(): void {
        this._prefabNode = this.tabbar.children[0];
        if (!this._prefabNode) {
            console.error('需要配置一个预制体节点');
        }
        this._prefabNode.parent = null;

        let statusHeight = Utils.getSafeArea().top;
        this.statusBar.uiTransfrom.height = statusHeight;

        let viewSize = view.getVisibleSize();
        this.container.uiTransfrom.setContentSize(viewSize.width, viewSize.height - this.tabbar.uiTransfrom.height - statusHeight);
        this.container.setPosition(0, viewSize.height / 2 - (statusHeight + this.container.uiTransfrom.height / 2), 0);

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            let node = instantiate(this._prefabNode);
            node.parent = this.tabbar;
            node.getChildByName('ico').getComponent(UISprite).spriteFrame = item.ico;
            node.getChildByName('title').getComponent(Label).string = item.title;
            this._nodes.push(node);
        }
        this._selectedIndex = Math.floor(this._nodes.length / 2);
        this._onSelected(this._selectedIndex, false);
    }

    protected onEnable(): void {
        this.tabbar.on(Node.EventType.TOUCH_END, this._touchEnd, this);
    }

    protected onDisable(): void {
        this.tabbar.off(Node.EventType.TOUCH_END, this._touchEnd, this);
    }

    getItem(index: number) {
        return this._nodes[index];
    }

    setItem(index: number) {
        this._selectedIndex = index;
        this._onSelected(this._selectedIndex);
    }

    private _touchEnd(event: EventTouch) {
        let screenPoint = event.getLocation(v2_1);
        let windowId = event.windowId;
        for (let i = 0; i < this._nodes.length; i++) {
            const node = this._nodes[i];
            if (node.uiTransfrom.hitTest(screenPoint, windowId)) {
                AudioMgr.inst.playOneShot(Bundle.audio.get('click', AudioClip));
                if (this._selectedIndex !== i) {
                    this._selectedIndex = i;
                    this._onSelected(this._selectedIndex);
                }
                break;
            }
        }
    }

    private _onSelected(index: number, animation = true) {
        let duration = 0.2;
        let width = this.tabbar.uiTransfrom.width;
        let spaceX = this.spaceX;
        let itemWidth = (width - spaceX * (this._nodes.length - 1)) / this._nodes.length * 0.9;
        let selectedWidth = width - (itemWidth + spaceX) * (this._nodes.length - 1);
        let rectX = -width / 2;
        for (let i = 0; i < this._nodes.length; i++) {
            let node = this._nodes[i];

            let isSelected = i === index;

            let newWidth = isSelected ? selectedWidth : itemWidth;
            let newPos = v3(node.position);
            newPos.x = rectX + newWidth / 2;

            let focusNode = node.getChildByName('focus');
            let icoNode = node.getChildByName('ico');
            let titleNode = node.getChildByName('title');
            let focusOpacity = isSelected ? 255 : 0;
            let icoPos = v3(icoNode.position);
            icoPos.y = isSelected ? 0 : -icoNode.uiTransfrom.height / 2;
            let icoScaleValue = isSelected ? 1.2 : 0.9;
            let icoScale = v3(icoScaleValue, icoScaleValue, 1);
            let titleScaleValue = isSelected ? 1 : 0;
            let titleScale = v3(titleScaleValue, titleScaleValue, 1);

            if (animation) {
                tween(node).to(duration, { position: newPos }).start();
                tween(node.uiTransfrom).to(duration, { width: newWidth }).start();
                tween(focusNode).to(duration, { opacity: focusOpacity }).start();
                tween(icoNode).to(duration, { position: icoPos, scale: icoScale }).start();
                tween(titleNode).to(duration, { scale: titleScale }).start();
            }
            else {
                node.position = newPos;
                node.uiTransfrom.width = newWidth;
                focusNode.opacity = focusOpacity;
                icoNode.position = icoPos;
                icoNode.scale = icoScale;
                titleNode.scale = titleScale;
            }

            rectX += newWidth + spaceX;
        }

        this._loadPage(index);
    }

    private _loadPage(index: number) {
        let item = this.items[index];
        if (!item.node) {
            item.node = instantiate(item.page);
            item.node.parent = this.container;
        }
        item.node.setSiblingIndex(-1);

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (!!item.node) {
                item.node.active = i === index;
            }
        }
        this.scheduleOnce(() => {
            LockMgr.unlock();
        }, 0.2);
        LockMgr.lock();
    }
}


