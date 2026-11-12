import { _decorator, AudioClip, Button, Label, Node, Prefab } from 'cc';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { DialogController } from '../../dlspace/components/DialogController';
import { UISprite } from '../../dlspace/components/UISprite';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { GameState } from '../../global/IGame';
import { loadSpriteFrame, lookAdVideo } from '../../utils/GameUtils';
import { WeaponNames } from '../../utils/Model';
import { BottomContainer } from '../BottomContainer';
import { HeroData, IRewardBonusData } from '../other/HeroData';
const { ccclass, property } = _decorator;

@ccclass('BottomOpenGiftDialog')
export class BottomOpenGiftDialog extends DialogController {

    @property(Node)
    list: Node;

    private _bottom: BottomContainer;
    private _datas: IRewardBonusData[];

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/gaming/bottom/bottomOpenGiftDialog", Prefab);
    }

    protected _open(bottom: BottomContainer) {
        Core.game.state = GameState.Pause;
        this._bottom = bottom;
        let children = this.list.children;
        this._datas = this._getDatas(children.length);
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const data = this._datas[i];
            let ico = child.getChildByName('ico').getComponent(UISprite);
            loadSpriteFrame(ico, data.data.ico);
            child.getChildByName('label').getComponent(Label).string = data.title;

            child.on(Button.EventType.CLICK, () => {
                this._get([i]);
            });
        }
    }

    onClickGetAll() {
        lookAdVideo(err => {
            if (!!err) return;
            let indexs = this.list.children.map((v, i) => i);
            this._get(indexs);
        });
    }

    private _get(indexs: number[]) {
        for (const index of indexs) {
            let data = this._datas[index];
            if (WeaponNames.indexOf(data.title) !== -1 || data.title.startsWith('子弹+')) {
                let ico = this.list.children[index].getChildByName('ico').getComponent(UISprite).getSprite();
                data.data.fn(data.title, ico);
            }
            else {
                data.data.fn(data.title);
            }
        }
        if (Core.game.state === GameState.Pause) {
            Core.game.state = GameState.Gaming;
        }
        AudioMgr.inst.playOneShot(Bundle.audio.get('up', AudioClip), 0.1);
        this.close();
    }

    private _getDatas(count: number) {
        let usedWeapons = this._bottom.root.fight.heroController.getWeapons();
        usedWeapons = [...usedWeapons, ...this._bottom.bottomLayout.getWeapons()];
        let usedSet = new Set(usedWeapons);
        let hpRatio = this._bottom.root.fight.heroController.hero.hpRatio;
        let datas = HeroData.getRewardBonus(count, hpRatio, usedSet);
        return datas;
    }

}

