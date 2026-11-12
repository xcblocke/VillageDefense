import { _decorator, AudioClip, EPhysics2DDrawFlags, Node, PhysicsSystem2D } from 'cc';
import { AudioMgr } from '../dlspace/common/AudioMgr';
import { Controller } from '../dlspace/components/Controller';
import { DialogController } from '../dlspace/components/DialogController';
import { Bundle } from '../global/Bundle';
import { Core } from '../global/Core';
import { FirstGiftDialog } from '../prefab/ui/FirstGiftDialog';
import { GuideDialog } from '../prefab/ui/GuideDialog';
import { OpenChestDialog } from '../prefab/ui/OpenChestDialog';
import { TabbarController } from '../prefab/ui/TabbarController';
import { openChest } from '../utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('LobbyScene')
export class LobbyScene extends Controller {

    @property(TabbarController)
    tabbar: TabbarController;

    protected start(): void {
        AudioMgr.background.volume = 0.5;
        PhysicsSystem2D.instance.enable = false;
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.None;
        AudioMgr.background.play(Bundle.audio.get('lobby-bg', AudioClip));

        this._showFirstGift();
    }

    private _showFirstGift() {
        if (Core.userInfo.firstGift) {
            FirstGiftDialog.show((chestIcoNode: Node) => {
                let datas = openChest(10);
                let comp = OpenChestDialog.show(chestIcoNode, datas);
                comp.node.once(DialogController.EventType.OnClose, () => {
                    this._showGuide();
                });
                Core.userInfo.firstGift = false;
            });
        }
    }

    private _showGuide() {
        let comp = GuideDialog.init();
        let fn = (step: number) => {
            if (step === 0) {
                comp.show(this.tabbar.getItem(0), '这里是商店', '每日0点刷新 每日福利 | 每日商店\n宝箱商店:快速获取装备\n材料商店:升级材料转换', () => {
                    this.tabbar.setItem(0);
                }, () => {
                    fn(step + 1);
                });
            }
            else if (step === 1) {
                comp.show(this.tabbar.getItem(1), '快来这看看你的装备', '通过分解装备获得升级材料\n穿戴并升级装备提升战力', () => {
                    this.tabbar.setItem(1);
                }, () => {
                    fn(step + 1);
                });
            }
            else if (step === 2) {
                comp.show(this.tabbar.getItem(3), '每日任务', '每日0点刷新\n完成全部任务可获额外奖励', () => {
                    this.tabbar.setItem(3);
                }, () => {
                    fn(step + 1);
                });
            }
            else if (step === 3) {
                comp.show(this.tabbar.getItem(4), '累计目标奖励', '达成目标即可领取奖励', () => {
                    this.tabbar.setItem(4);
                }, () => {
                    fn(step + 1);
                });
            }
            else if (step === 4) {
                comp.show(this.tabbar.getItem(2), '准备好了吗？', '来这里开始游戏吧~', () => {
                    this.tabbar.setItem(2);
                }, () => {
                    fn(step + 1);
                }, '完成');
            }
            else {
                comp.node.destroy();
            }
        };
        fn(0);
    }

}


