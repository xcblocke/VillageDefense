import { _decorator, Button, isValid, Label, Node, tween, v3 } from 'cc';
import { HurtEffectController } from '../../controller/HurtEffectController';
import { MonitorValuesController } from '../../controller/MonitorValuesController';
import { RunScene } from '../../controller/RunScene';
import { GIFController } from '../../dlspace/components/GIFController';
import { HeroData } from '../../gaming/other/HeroData';
import { MonsterData } from '../../gaming/other/MonsterData';
import { Core } from '../../global/Core';
import { MaxEnergy, SceneName } from '../../global/IGame';
import { isBackpackFull } from '../../utils/GameUtils';
import { IRewardData } from '../../utils/Model';
import { AdGetRewardDialog, AdGetRewardType } from '../ui/AdGetRewardDialog';
import { DySidebarReward } from '../ui/DySidebarReward';
import { OfflineRewardDialog } from '../ui/OfflineRewardDialog';
import { SettingDialog } from '../ui/SettingDialog';
import { ShowRewardDialog } from '../ui/ShowRewardDialog';
import { Toast } from '../ui/Toast';
import { WheelController } from '../ui/WheelController';
const { ccclass, property } = _decorator;

@ccclass('BattlePage')
export class BattlePage extends MonitorValuesController {

    @property(Label)
    passLevelLabel: Label;

    @property(Label)
    passLevelLabel2: Label;

    @property(Label)
    energyLabel: Label;

    @property(Node)
    energyIco: Node;

    @property(Node)
    settingBtn: Node;

    @property(Node)
    dyRewardBtn: Node;

    @property(Node)
    offlineRewardBtn: Node;

    @property(Node)
    wheelBtn: Node;

    @property(Node)
    monsterPreview: Node;

    protected start(): void {
        this.addMonitor({
            label: this.energyLabel,
            getValue: () => Core.userInfo.energy,
            getValueFormat: (v) => {
                return `${v}/${MaxEnergy}`;
            },
            animData: {
                ico: this.energyIco,
                count: 10
            },
            checkShow: (diff) => {
                return diff === MaxEnergy;
            }
        });
        this.settingBtn.on(Button.EventType.CLICK, () => {
            SettingDialog.show();
        });
        this.dyRewardBtn.on(Button.EventType.CLICK, () => {
            DySidebarReward.show(() => {
                this.dyRewardBtn.active = false;
                Core.userInfo.diamond += 50;
                let reward: IRewardData = {
                    diamond: 50
                };
                ShowRewardDialog.show(reward);
            });
        });
        this.offlineRewardBtn.on(Button.EventType.CLICK, () => {
            OfflineRewardDialog.show();
        });
        this.wheelBtn.on(Button.EventType.CLICK, () => {
            WheelController.show();
        });

        this.dyRewardBtn.active = false;
        DySidebarReward.getVisible(() => {
            this.dyRewardBtn.active = true;
        });

        this.monsterPreview.active = false;
        MonsterData.loadRes(() => {
            if (!isValid(this) || !isValid(this.node, true)) {
                return;
            }
            this.monsterPreview.active = true;
            let hurtEffect = this.monsterPreview.getComponentInChildren(HurtEffectController);
            this.monsterPreview.on(Button.EventType.CLICK, () => {
                hurtEffect.trigger();
            });

            let pos = this.monsterPreview.tempPosition;
            pos.x = -500;
            this.monsterPreview.position = pos;
            let image = this.monsterPreview.getComponentInChildren(GIFController);
            image.frame = 24;
            image.init(MonsterData.monsterGIFDatas);
            image.play('Walking', true);
            image.node.position = MonsterData.monsterOffset;

            this._monsterPreviewWalking();
        });
        HeroData.loadRes(() => { });
    }

    protected onEnable(): void {
        super.onEnable();
        this.passLevelLabel.string = `关卡`;
        this.passLevelLabel2.string = `${Core.userInfo.passLevel}`;
    }

    clickStart() {
        if (isBackpackFull()) {
            return;
        }
        if (Core.userInfo.energy < 10) {
            Toast.show('体力不足,快去获取体力吧!');
            return;
        }
        Core.userInfo.energy -= 10;

        RunScene.show(SceneName.Game);
    }

    clickEnergy() {
        let moneyType: AdGetRewardType = 'Energy';
        AdGetRewardDialog.show(moneyType);
    }

    private _monsterPreviewWalking() {
        let pos = this.monsterPreview.position;
        let endPos = v3(pos);
        endPos.x = pos.x > 0 ? -300 : 300;
        tween(this.monsterPreview).to(15 + Math.randomFloat(0, 2), { position: endPos }).call(() => {
            this._monsterPreviewWalking();
        }).start();

        let scale = this.monsterPreview.tempScale;
        scale.x = Math.abs(scale.x) * (endPos.x > 0 ? 1 : -1);
        this.monsterPreview.scale = scale;
    }

}


