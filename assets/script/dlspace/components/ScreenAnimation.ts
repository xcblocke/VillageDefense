import { _decorator, instantiate, Node, Tween, tween, v3, Vec3, view } from 'cc';
import { Controller } from './Controller';
const { ccclass, property } = _decorator;

@ccclass('ScreenAnimation')
export class ScreenAnimation extends Controller {

    @property(Node)
    prefab: Node;

    @property(Vec3)
    fromScale = v3();

    @property(Vec3)
    toScale = v3();

    private _tweens: Set<Tween<Node>> = new Set();

    start() {
        this.prefab.active = false;
    }

    show(call: () => void) {
        this._clearTweens();

        let prefabSize = this.prefab.uiTransfrom.contentSize;
        let screenSize = view.getVisibleSize();
        let maxRowCount = Math.ceil(screenSize.width / prefabSize.width);
        let maxColCount = Math.ceil(screenSize.height / prefabSize.height);

        let delay = 0;
        let startY = (maxColCount * prefabSize.height) / 2 - prefabSize.height / 2;
        for (let i = 0; i < maxColCount; i++) {
            let rowCount = i % 2 === 0 ? maxRowCount : maxRowCount + 1;
            let startX = -(rowCount * prefabSize.width) / 2 + prefabSize.width / 2;
            for (let j = 0; j < rowCount; j++) {
                let node = instantiate(this.prefab);
                node.parent = this.node;
                node.active = true;
                node.setScale(this.fromScale);
                node.setPosition(startX, startY, 0);

                this._shake(node, delay);
                let t = tween(node).delay(delay).to(0.3, { scale: this.toScale.clone() }).call(() => {
                    this._tweens.delete(t);
                    if (this._tweens.size === 0) {
                        call && call();
                    }
                }).start();
                this._tweens.add(t);

                delay += 0.1;
                startX += prefabSize.width;
            }
            startY -= prefabSize.height;
        }
    }

    hide(call: () => void) {
        this._clearTweens();

        let delay = 0;
        let children = [...this.node.children];
        children.sort((a, b) => b.getSiblingIndex() - a.getSiblingIndex());
        for (const node of children) {
            this._shake(node, delay);
            let t = tween(node).delay(delay).to(0.3, { scale: this.fromScale.clone() }).call(() => {
                this._tweens.delete(t);
                if (this._tweens.size === 0) {
                    call && call();
                }
            }).start();
            this._tweens.add(t);

            delay += 0.1;
        }
    }

    private _shake(node: Node, delay: number) {
        tween(node).delay(delay).to(0.1, { angle: 30 }).to(0.1, { angle: -30 }).to(0.05, { angle: 0.05 }).start();
    }

    private _clearTweens() {
        for (const t of this._tweens) {
            t.stop();
        }
        this._tweens.clear();
    }

}


