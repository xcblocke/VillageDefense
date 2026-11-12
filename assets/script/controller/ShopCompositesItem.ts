import { _decorator, AudioClip, Button, Component } from 'cc';
import { EquipmentGrade } from '../config/IConfig';
import { AudioMgr } from '../dlspace/common/AudioMgr';
import { Bundle } from '../global/Bundle';
import { Toast } from '../prefab/ui/Toast';
import { addAchievementCount, addCompositeCount, getCompositeCount, setCompositeCount } from '../utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('ShopCompositesItem')
export class ShopCompositesItem extends Component {

    @property
    buyGrade: EquipmentGrade = 'S';

    @property
    buyCount = 10;

    @property
    moneyGrade: EquipmentGrade = 'A';

    @property
    moneyCount = 20;

    protected onEnable(): void {
        this.node.on(Button.EventType.CLICK, this._onClick, this);
    }

    protected onDisable(): void {
        this.node.off(Button.EventType.CLICK, this._onClick, this);
    }

    private _onClick() {
        let count = getCompositeCount(this.moneyGrade);
        if (count < this.moneyCount) {
            Toast.show('材料不足!');
            return;
        }
        Toast.show(`${this.buyGrade}级升级材料 +${this.buyCount}`);
        AudioMgr.inst.playOneShot(Bundle.audio.get('reward', AudioClip), 0.1);

        setCompositeCount(this.moneyGrade, count - this.moneyCount);

        addCompositeCount(this.buyGrade, this.buyCount);
        addAchievementCount('buyCompositesInShop');
    }

}


