import { _decorator, Node } from 'cc';
import { Controller } from '../dlspace/components/Controller';
import { RootContainer } from './RootContainer';
import { HeroController } from './fight/HeroController';
import { MonsterController } from './fight/MonsterController';
const { ccclass, property } = _decorator;
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html
@ccclass('FightContainer')
export class FightContainer extends Controller {

    @property(HeroController)
    heroController: HeroController;

    @property(MonsterController)
    monsterController: MonsterController;

    @property(Node)
    bulletContainer: Node;

    @property(Node)
    boomContainer: Node;

    root: RootContainer;

    init(root: RootContainer) {
        this.root = root;
        this.heroController.init(this);
        this.monsterController.init(this);
    }

    update(deltaTime: number) {

    }
}


