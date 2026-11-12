import { _decorator, AudioClip, Button, color, Component, Label, Node, Sprite, tween, Tween } from 'cc';
import { AchievementType, MoneyType } from '../../config/IConfig';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { MsgMgr } from '../../dlspace/common/MsgMgr';
import { UISprite } from '../../dlspace/components/UISprite';
import { VirtualList } from '../../dlspace/components/VirtualList';
import { getServerTimestamp } from '../../dlspace/utils/ServerUtils';
import { Utils } from '../../dlspace/utils/Utils';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { GameAction } from '../../global/IGame';
import { getAchievementCountInDay, loadSpriteFrame } from '../../utils/GameUtils';
const { ccclass, property } = _decorator;

const FullTaskDiamondReward = 200;

const ItemBg_yellow = color('FFFFDB');
const ItemBg_white = color('FFFFFF');

interface ITaskItem {
    type: AchievementType;
    rewardType: MoneyType;
    rewardNum: number;
    title: string;
    getNeedNum: () => number;
    needNum?: number;
    didNum?: number;
    didGet?: boolean;
}

@ccclass('TaskPage')
export class TaskPage extends Component {

    @property(Label)
    clockLabel: Label;

    @property(Sprite)
    fullProgressSprite: Sprite;

    @property(Label)
    fullProgressLabel: Label;

    @property(Label)
    fullGetLabel: Label;

    @property(Node)
    fullRedDot: Node;

    @property(VirtualList)
    list: VirtualList;

    private _items: ITaskItem[];
    private _canGetFullTask: boolean;
    private _fullProgressSpriteTween: Tween<any>;

    protected onLoad(): void {
        let clickAudio = Bundle.audio.get('add-money', AudioClip);
        this.list.init(null, (node, index) => {
            let item = this._items[index];
            let undone = item.didNum < item.needNum;
            node.getChildByPath('bg').getComponent(Sprite).color = (undone || item.didGet) ? ItemBg_white : ItemBg_yellow;
            let icoPath = item.rewardType === 'Gold' ? 'texture/ui/ico-gold' : 'texture/ui/ico-diamond';
            loadSpriteFrame(node.getChildByPath('frame/ico').getComponent(UISprite), icoPath);
            node.getChildByPath('frame/label').getComponent(Label).string = `${item.rewardNum * item.needNum}`;
            node.getChildByPath('title').getComponent(Label).string = item.title;
            node.getChildByPath('progress/progress').getComponent(Sprite).fillRange = item.didNum / item.needNum;
            node.getChildByPath('progress/label').getComponent(Label).string = `${item.didNum}/${item.needNum}`;
            let getBtn = node.getChildByPath('get');
            getBtn.active = !item.didGet;
            getBtn.off(Button.EventType.CLICK);
            if (getBtn.active) {
                let getButtonComp = getBtn.getComponent(Button);
                getButtonComp.enabled = !undone;
                getButtonComp.setValue('ClickAudio', clickAudio);
                getBtn.on(Button.EventType.CLICK, () => {
                    if (item.didGet) return;
                    item.didGet = true;

                    let taskCache = Core.userInfo.day.task;
                    taskCache[item.type + '_didGet'] = true;
                    Core.userInfo.day.task = taskCache;

                    if (item.rewardType === 'Gold') {
                        Core.userInfo.gold += item.rewardNum * item.needNum;
                    }
                    else {
                        Core.userInfo.diamond += item.rewardNum * item.needNum;
                    }
                    this._reload();
                    this.list.reloadWithIndex(index);
                });
                getBtn.getComponent(Sprite).grayscale = undone;
            }
            node.getChildByPath('check').active = item.didGet;
            node.getChildByPath('mask').active = item.didGet;

        }, null);
        this.fullProgressSprite.fillRange = 0;
    }

    protected onEnable(): void {
        this._reload(true);
        MsgMgr.on(GameAction.onDayEnd, this._reload, this);
    }

    protected onDisable(): void {
        MsgMgr.off(GameAction.onDayEnd, this._reload, this);
    }

    update(deltaTime: number) {
        let time = Core.userInfo.secondsMidnight;
        this.clockLabel.string = Utils.formatTime(time, 'hh:mm:ss');
    }

    onClickFullTask() {
        if (!this._canGetFullTask) return;
        let taskCache = Core.userInfo.day.task;
        taskCache['fullTaskDidGet'] = true;
        Core.userInfo.day.task = taskCache;
        Core.userInfo.diamond += FullTaskDiamondReward;
        AudioMgr.inst.playOneShot(Bundle.audio.get('reward', AudioClip));
        this._reload();
    }

    private _reload(reloadList = false) {
        if (reloadList) {
            this._items = this._getTaskItems();
            this.list.num = this._items.length;
        }

        let didGet = Core.userInfo.day.task['fullTaskDidGet'] as boolean;
        let needNum = this._items.length;
        let didNum = this._items.filter(item => item.didGet).length;
        let canGet = didNum >= needNum && !didGet;
        this._canGetFullTask = canGet;

        if (this._fullProgressSpriteTween) {
            this._fullProgressSpriteTween.stop();
        }
        this._fullProgressSpriteTween = tween(this.fullProgressSprite).to(0.5, { fillRange: didNum / needNum }).call(() => {
            this._fullProgressSpriteTween = null;
        }).start();
        this.fullProgressLabel.string = `${didNum}/${needNum}`;
        this.fullGetLabel.string = didGet ? '已领取' : `${FullTaskDiamondReward}`;
        this.fullRedDot.active = canGet;
    }

    private _getSecondsUntilMidnight(): number {
        // 获取当前时间
        const now = new Date(getServerTimestamp());
        // 创建一个表示明天 0 点的日期对象
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        // 计算当前时间和明天 0 点的时间差（以毫秒为单位）
        const diffInMs = midnight.getTime() - now.getTime();
        // 将时间差转换为秒
        const diffInSeconds = Math.floor(diffInMs / 1000);
        return diffInSeconds;
    }

    private _getTaskItems(): ITaskItem[] {
        let items = this._getData();
        let taskCache = Core.userInfo.day.task;
        if (!taskCache) {
            taskCache = {};
            for (const item of items) {
                taskCache[item.type + '_needNum'] = item.getNeedNum();
                taskCache[item.type + '_didGet'] = false;
            }
            taskCache['fullTaskDidGet'] = false;
            Core.userInfo.day.task = taskCache;
        }
        for (const item of items) {
            item.needNum = taskCache[item.type + '_needNum'];
            item.didNum = Math.min(getAchievementCountInDay(item.type), item.needNum);
            item.didGet = taskCache[item.type + '_didGet'];
            item.title = item.title.replace('vvv', `${item.needNum}`);
        }
        items.sort((a, b) => {
            if (a.didGet) return 1;
            if (b.didGet) return -1;
            return b.didNum / b.needNum - a.didNum / a.needNum;
        });
        return items;
    }

    private _getData(): ITaskItem[] {
        return [
            {
                type: 'killMonster',
                rewardType: 'Gold',
                rewardNum: 30,
                title: '打败vvv个怪物',
                getNeedNum: () => {
                    return Math.randomInt2(1, 4) * 50;
                }
            },
            {
                type: 'passedLevel',
                rewardType: 'Diamond',
                rewardNum: 50,
                title: '通过vvv次关卡',
                getNeedNum: () => {
                    return 1;
                }
            },
            {
                type: 'upgradeEquipment',
                rewardType: 'Diamond',
                rewardNum: 10,
                title: '升级vvv次装备',
                getNeedNum: () => {
                    return Math.randomInt2(1, 2);
                }
            },
            {
                type: 'degradeEquipment',
                rewardType: 'Gold',
                rewardNum: 300,
                title: '分解vvv次装备',
                getNeedNum: () => {
                    return Math.randomInt2(1, 3) * 5;
                }
            },
            {
                type: 'buyChestInShop',
                rewardType: 'Diamond',
                rewardNum: 20,
                title: '打开vvv次装备宝箱',
                getNeedNum: () => {
                    return 1;
                }
            },
            {
                type: 'buyCompositesInShop',
                rewardType: 'Gold',
                rewardNum: 2000,
                title: '购买vvv次升级材料',
                getNeedNum: () => {
                    return Math.randomInt2(1, 2);
                }
            },
            {
                type: 'buyInDailyShop',
                rewardType: 'Gold',
                rewardNum: 2000,
                title: '每日商店中购买vvv次',
                getNeedNum: () => {
                    return Math.randomInt2(1, 2);
                }
            },
            {
                type: 'buyInDailyReward',
                rewardType: 'Gold',
                rewardNum: 2000,
                title: '领取商店的每日福利',
                getNeedNum: () => {
                    return 1;
                }
            },
            {
                type: 'getOfflineReward',
                rewardType: 'Gold',
                rewardNum: 2000,
                title: '领取挂机奖励',
                getNeedNum: () => {
                    return 1;
                }
            },
            {
                type: 'lookAdVideo',
                rewardType: 'Diamond',
                rewardNum: 50,
                title: '看vvv次广告视频',
                getNeedNum: () => {
                    return Math.randomInt2(1, 2);
                }
            },
        ];
    }
}


