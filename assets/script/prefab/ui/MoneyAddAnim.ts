import { _decorator, instantiate, Node, Prefab, tween, v3 } from 'cc';
import { TopController } from '../../dlspace/components/TopController';
import { Bundle } from '../../global/Bundle';
const { ccclass, property } = _decorator;

export interface IMoneyAddAnimData {
    //会clone ico节点
    ico: Node;
    count: number;
}

@ccclass('MoneyAddAnim')
export class MoneyAddAnim extends TopController {

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/moneyAddAnim", Prefab);
    }

    protected _open(data: IMoneyAddAnimData, call: Function) {
        for (let i = 0; i < data.count; i++) {
            let endPos = data.ico.getWorldPosition();
            let item = instantiate(data.ico);
            let posX = (Math.random() - 0.5) * 200;
            let posY = (Math.random() - 0.5) * 100;
            item.parent = this.node;
            item.setPosition(0, 0, 0);
            tween(item).to(0.2, { position: v3(posX, posY, 0) }, { easing: 'sineIn' }).delay(0.2).to(0.5, { worldPosition: endPos }, { easing: 'sineInOut' }).call(() => {
                item.destroy();
            }).start();
        }
        this.scheduleOnce(() => {
            call && call();
            this.scheduleOnce(() => {
                this.node.destroy();
            });
        }, 0.9);
    }

}


