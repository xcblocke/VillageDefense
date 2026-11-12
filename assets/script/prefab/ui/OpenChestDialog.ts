import { _decorator, AudioClip, instantiate, Node, Prefab, tween, v3 } from 'cc';
import { EquipmentItemController } from '../../controller/EquipmentItemController';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { DialogController } from '../../dlspace/components/DialogController';
import { Bundle } from '../../global/Bundle';
import { IUserEquipmentData } from '../../global/UserInfo';
const { ccclass, property } = _decorator;

@ccclass('OpenChestDialog')
export class OpenChestDialog extends DialogController {

    @property(Node)
    realContent: Node;

    @property(Node)
    whiteMask: Node;

    @property(Node)
    items: Node;

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/openChestDialog", Prefab);
    }

    protected _open(animNode: Node, datas: IUserEquipmentData[]) {
        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];
            let node = this.items.children[0];
            if (i > 0) {
                node = instantiate(node);
                node.parent = this.items;
            }
            node.getComponent(EquipmentItemController).init(data);
        }
        this.items.uiTransfrom.width = datas.length === 1 ? 130 : 700;
        this.realContent.opacity = 0;
        this.whiteMask.opacity = 0;

        let chestIco = instantiate(animNode);
        this.node.insertChild(chestIco, this.realContent.getSiblingIndex());
        chestIco.worldPosition = animNode.worldPosition;
        tween(chestIco).to(0.3, { position: v3(0, 0, 0), scale: v3(1.6, 1.6, 1) }).call(() => {
            tween(chestIco).to(0.1, { angle: 30 }).to(0.1, { angle: -30 }).to(0.05, { angle: 0 }).start();
            tween(this.whiteMask).delay(0.5).to(0.2, { opacity: 255 }).call(() => {
                chestIco.destroy();
                this.realContent.opacity = 255;
                tween(this.whiteMask).to(0.2, { opacity: 0 }).start();
                AudioMgr.inst.playOneShot(Bundle.audio.get('reward', AudioClip));
            }).start();
        }).start();

        AudioMgr.inst.playOneShot(Bundle.audio.get('open-chest', AudioClip));
    }

}

