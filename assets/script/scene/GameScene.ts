import { _decorator, AudioClip, instantiate, Node, PhysicsSystem2D, Prefab, tween, v3 } from 'cc';
import { MonsterProperty } from '../../config/MonsterProperty';
import { RunScene } from '../controller/RunScene';
import { AudioMgr } from '../dlspace/common/AudioMgr';
import { MsgMgr } from '../dlspace/common/MsgMgr';
import { UIMgr } from '../dlspace/common/UIMgr';
import { GameController } from '../dlspace/components/GameController';
import { HeroAction } from '../gaming/other/HeroData';
import { Bundle } from '../global/Bundle';
import { Core } from '../global/Core';
import { GameState, IGame, SceneName } from '../global/IGame';
import { GameFinishDialog } from '../prefab/ui/GameFinishDialog';
import { GameReviveDialog } from '../prefab/ui/GameReviveDialog';
import { MessageDialog } from '../prefab/ui/MessageDialog';
import { addAchievementCount, getGamingHeroInfo } from '../utils/GameUtils';
import { IGameingInfo, IGamingHeroInfo, IGamingMonsterInfo } from '../utils/Model';
const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends GameController<GameState> implements IGame {

    info: IGameingInfo;

    protected onLoad(): void {
        AudioMgr.background.play(Bundle.audio.get('game-bg', AudioClip));
        this.info = this._createGamingInfo();
        if (this._loadGuide()) {
            this.state = GameState.Pause;
        }
        else {
            this.state = GameState.Gaming;
        }
    }

    onClickBack() {
        this.state = GameState.Pause;
        MessageDialog.show('提示', '确定现在退出?', '确定', () => {
            RunScene.show(SceneName.Lobby);
        }, () => {
            if (this.state === GameState.Pause) {
                this.state = GameState.Gaming;
            }
        });
    }

    protected onEnable(): void {
        Core.game = this;
    }

    protected onDisable(): void {
        Core.game = null;
    }

    protected _onStateChanged(state: GameState, oldState: GameState): void {
        PhysicsSystem2D.instance.enable = state === GameState.Gaming;

        if (state === GameState.Gaming) {
            if (!AudioMgr.background.audio.playing) {
                AudioMgr.background.play(Bundle.audio.get('game-bg', AudioClip));
            }
        }
        else if (state === GameState.Ended) {
            AudioMgr.background.stop();
            let passProgress = this.info.progress;
            let success = passProgress === 1;
            if (success) {
                GameFinishDialog.show(passProgress);
                Core.userInfo.passLevel++;
                addAchievementCount('passedLevel');
            }
            else {
                if (this.info.revived) {
                    GameFinishDialog.show(passProgress);
                }
                else {
                    GameReviveDialog.show(() => {
                        GameFinishDialog.show(passProgress);
                    }, () => {
                        this.info.revived = true;
                        MsgMgr.emit(HeroAction.revive);
                        this.state = GameState.Gaming;
                    });
                }
            }
        }
    }

    private _createGamingInfo(): IGameingInfo {
        let passLevel = Core.userInfo.passLevel;
        let heroInfo: IGamingHeroInfo = getGamingHeroInfo(true);
        let monsterInfo: IGamingMonsterInfo = {
            Hp: MonsterProperty.Hp + MonsterProperty.HpIncrease * (passLevel - 1),
            HpBoss: (MonsterProperty.Hp + MonsterProperty.HpIncrease * (passLevel - 1)) * MonsterProperty.HpIncreaseBoss,
            Damage: MonsterProperty.Damage + MonsterProperty.DamageIncrease * (passLevel - 1),
            DamageBoss: (MonsterProperty.Damage + MonsterProperty.DamageIncrease * (passLevel - 1)) * MonsterProperty.DamageIncreaseBoss,
            AtkSpeed: MonsterProperty.AtkSpeed,
            MoveSpeed: MonsterProperty.MoveSpeed,
            Count: MonsterProperty.Count + MonsterProperty.CountIncrease * (passLevel - 1),
        };
        return {
            level: Core.userInfo.passLevel,
            progress: 0,
            revived: false,
            heroInfo,
            monsterInfo
        };
    }

    private _loadGuide() {
        if (!Core.userInfo.gameGuide) {
            return false;
        }
        let node = instantiate(Bundle.game.get('prefab/other/guide', Prefab));
        node.parent = UIMgr.instance.dialogParent;
        this.node.once(Node.EventType.TOUCH_START, () => {
            Core.userInfo.gameGuide = false;
            this.state = GameState.Gaming;
            node.destroy();
        });
        let guideHand = node.getChildByPath('content/guide');
        tween(guideHand).to(1, { position: v3(20, guideHand.position.y, 0) }).to(1, { position: v3(-20, guideHand.position.y, 0) }).union().repeat(111).start();
        return true;
    }

}


