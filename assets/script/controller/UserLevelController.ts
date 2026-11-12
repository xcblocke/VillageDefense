import { _decorator, clamp01, Component, Label, macro, Node, Sprite } from 'cc';
import { Core } from '../global/Core';
import { PlayerMaxLevel } from '../global/IGame';
import { getUpExp } from '../utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('UserLevelController')
export class UserLevelController extends Component {

    @property(Label)
    label: Label;

    @property(Sprite)
    sprite: Sprite;

    @property(Node)
    spriteBg: Node;

    protected onEnable(): void {
        this.schedule(this._updateLevel, 0.1, macro.REPEAT_FOREVER);
        this._updateLevel();
    }

    protected onDisable(): void {
        this.unschedule(this._updateLevel);
    }

    private _updateLevel() {
        this.label.string = `${Core.userInfo.level}`;
        let isMaxLevel = Core.userInfo.level >= PlayerMaxLevel;
        let progress = isMaxLevel ? 1 : clamp01(Core.userInfo.exp / getUpExp());
        this.sprite.node.uiTransfrom.width = this.spriteBg.uiTransfrom.width * progress;
    }
}


