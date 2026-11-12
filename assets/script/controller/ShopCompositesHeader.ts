import { _decorator, Component, Label } from 'cc';
import { getCompositeCount } from '../utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('ShopCompositesHeader')
export class ShopCompositesHeader extends Component {

    @property(Label)
    sLabel: Label;

    @property(Label)
    aLabel: Label;

    @property(Label)
    bLabel: Label;

    @property(Label)
    cLabel: Label;

    update(deltaTime: number) {
        this.sLabel.string = `${getCompositeCount('S')}`;
        this.aLabel.string = `${getCompositeCount('A')}`;
        this.bLabel.string = `${getCompositeCount('B')}`;
        this.cLabel.string = `${getCompositeCount('C')}`;
    }
}


