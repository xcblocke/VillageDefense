import { _decorator, Label, Node, view } from 'cc';
import { Controller } from 'db://assets/script/dlspace/components/Controller';
import { BottomContainer } from 'db://assets/script/gaming/BottomContainer';
import { FightContainer } from 'db://assets/script/gaming/FightContainer';
import { Utils } from '../dlspace/utils/Utils';
const { ccclass, property } = _decorator;
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html
@ccclass('RootContainer')
export class RootContainer extends Controller {

    @property(FightContainer)
    fight: FightContainer;

    @property(BottomContainer)
    bottom: BottomContainer;

    @property(Node)
    navNode: Node;

    @property(Label)
    waveNumLabel: Label;

    protected start(): void {
        this.fight.init(this);
        this.bottom.init(this);

        this.navNode.setPosition(0, view.getVisibleSize().height / 2 - this.navNode.uiTransfrom.height / 2 - Utils.getSafeArea().top, 0);
    }

}


