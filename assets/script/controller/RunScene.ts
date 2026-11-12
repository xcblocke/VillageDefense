import { _decorator, Component, director, instantiate, Node, Prefab, tween, Tween } from 'cc';
import { NodePoolMgr } from '../dlspace/common/NodePoolMgr';
import { UIMgr } from '../dlspace/common/UIMgr';
import { HeroData } from '../gaming/other/HeroData';
import { MonsterData } from '../gaming/other/MonsterData';
import { Bundle } from '../global/Bundle';
import { SceneName } from '../global/IGame';
const { ccclass, property } = _decorator;

@ccclass('RunScene')
export class RunScene extends Component {

    private _tween: Tween<Node>;
    private _fast = false;

    static show(sceneName: SceneName, fast = false) {
        let prefab = Bundle.game.get('prefab/other/runScene', Prefab);
        let node = instantiate(prefab);
        node.parent = UIMgr.instance.persistParent;
        node.uiTransfrom.priority = 10000;

        node.getComponent(RunScene)._startAnim(sceneName, fast);
    }

    private _startAnim(sceneName: SceneName, fast = false) {
        this._fast = fast;
        let nextStep = () => {
            director.loadScene(sceneName, () => {
                this._hide(() => {
                    this.node.destroy();
                });
            }, () => {
                NodePoolMgr.clear();
            });
        }
        this._show(() => {
            if (sceneName === SceneName.Game) {
                MonsterData.loadRes(() => {
                    HeroData.loadRes(() => {
                        nextStep();
                    });
                });
            }
            else {
                this.scheduleOnce(() => {
                    nextStep();
                }, this._fast ? 0 : 0.2);
            }
        });
    }

    private _show(call: () => void) {
        this._clearTweens();

        this.node.opacity = 0;
        tween(this.node).to(this._fast ? 0.1 : 0.3, { opacity: 255 }).call(call).start();
    }

    private _hide(call: () => void) {
        this._clearTweens();

        this.node.opacity = 255;
        tween(this.node).to(this._fast ? 0.1 : 0.3, { opacity: 0 }).call(call).start();
    }

    private _clearTweens() {
        if (this._tween) {
            this._tween.stop();
            this._tween = null;
        }
    }
}


