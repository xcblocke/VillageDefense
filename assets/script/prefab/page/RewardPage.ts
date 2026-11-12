import { _decorator, AudioClip, Button, color, Component, Label, Sprite } from 'cc';
import { AchievementType, MoneyType } from '../../config/IConfig';
import { UISprite } from '../../dlspace/components/UISprite';
import { VirtualList } from '../../dlspace/components/VirtualList';
import { TweenUtils } from '../../dlspace/utils/TweenUtils';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { getAchievementCount, loadSpriteFrame } from '../../utils/GameUtils';
import { LockMgr } from '../../utils/LockMgr';
const { ccclass, property } = _decorator;

const ItemBg_yellow = color('FFFFDB');
const ItemBg_white = color('FFFFFF');

interface IRewardItem {
    type: AchievementType;
    rewardType: MoneyType;
    rewardNum: number;
    title: string;
    getNeedNum: (level: number) => number;
    didNum?: number;
    level?: number;
}

@ccclass('RewardPage')
export class RewardPage extends Component {

    @property(VirtualList)
    list: VirtualList;

    private _items: IRewardItem[];

    protected onLoad(): void {
        let clickAudio = Bundle.audio.get('add-money', AudioClip);
        this.list.init(null, (node, index) => {
            let item = this._items[index];
            let needNum = item.getNeedNum(item.level);
            let undone = item.didNum < needNum;
            node.getChildByPath('bg').getComponent(Sprite).color = undone ? ItemBg_white : ItemBg_yellow;
            let icoPath = item.rewardType === 'Gold' ? 'texture/ui/ico-gold' : 'texture/ui/ico-diamond';
            loadSpriteFrame(node.getChildByPath('frame/ico').getComponent(UISprite), icoPath);
            node.getChildByPath('frame/label').getComponent(Label).string = `${item.rewardNum}`;
            node.getChildByPath('title').getComponent(Label).string = item.title.replace('vvv', `${needNum}`);
            node.getChildByPath('progress/progress').getComponent(Sprite).fillRange = item.didNum / needNum;
            node.getChildByPath('progress/label').getComponent(Label).string = `${item.didNum}/${needNum}`;
            let getBtn = node.getChildByPath('get');
            getBtn.getComponent(Sprite).grayscale = undone;
            let getButtonComp = getBtn.getComponent(Button);
            getButtonComp.enabled = !undone;
            getButtonComp.setValue('ClickAudio', clickAudio);
            getBtn.off(Button.EventType.CLICK);
            getBtn.on(Button.EventType.CLICK, () => {
                item.level++;

                let reward = Core.userInfo.reward;
                reward[item.type]++;
                Core.userInfo.reward = reward;

                if (item.rewardType === 'Gold') {
                    Core.userInfo.gold += item.rewardNum;
                }
                else {
                    Core.userInfo.diamond += item.rewardNum;
                }
                let titleNode = node.getChildByPath('title');
                titleNode.setScale(1, 1, 1);
                LockMgr.lock();
                TweenUtils.fadeIn(titleNode, 'fromBig', () => {
                    LockMgr.unlock();
                }, 0.3);
                this.list.reloadWithIndex(index);
            });
        }, null);
    }

    protected onEnable(): void {
        this._items = this._getTaskItems();
        this.list.num = this._items.length;
    }

    private _getTaskItems(): IRewardItem[] {
        let items = this._getData();
        let reward = Core.userInfo.reward;
        if (!reward) {
            reward = {};
            for (const item of items) {
                reward[item.type] = 1;
            }
            Core.userInfo.reward = reward;
        }
        for (const item of items) {
            item.didNum = getAchievementCount(item.type);
            item.level = reward[item.type];
        }
        items.sort((a, b) => {
            return b.didNum / b.getNeedNum(b.level) - a.didNum / a.getNeedNum(a.level);
        });
        return items;
    }

    private _getData(): IRewardItem[] {
        return [
            {
                type: 'killMonster',
                rewardType: 'Gold',
                rewardNum: 2000,
                title: '打败vvv个怪物',
                getNeedNum: (level) => {
                    return level * 50;
                }
            },
            {
                type: 'passedLevel',
                rewardType: 'Diamond',
                rewardNum: 50,
                title: '通过vvv次关卡',
                getNeedNum: (level) => {
                    return level;
                }
            },
            {
                type: 'upgradeEquipment',
                rewardType: 'Diamond',
                rewardNum: 10,
                title: '升级vvv次装备',
                getNeedNum: (level) => {
                    return level * 5;
                }
            },
            {
                type: 'degradeEquipment',
                rewardType: 'Gold',
                rewardNum: 1000,
                title: '分解vvv次装备',
                getNeedNum: (level) => {
                    return level * 5;
                }
            },
            {
                type: 'buyChestInShop',
                rewardType: 'Diamond',
                rewardNum: 20,
                title: '打开vvv次装备宝箱',
                getNeedNum: (level) => {
                    return level * 10;
                }
            },
            {
                type: 'buyCompositesInShop',
                rewardType: 'Gold',
                rewardNum: 2000,
                title: '购买vvv次升级材料',
                getNeedNum: (level) => {
                    return level * 5;
                }
            },
            {
                type: 'buyInDailyShop',
                rewardType: 'Gold',
                rewardNum: 2000,
                title: '每日商店中购买vvv次',
                getNeedNum: (level) => {
                    return level * 5;
                }
            },
            {
                type: 'buyInDailyReward',
                rewardType: 'Gold',
                rewardNum: 2000,
                title: '领取商店的每日福利',
                getNeedNum: (level) => {
                    return level;
                }
            },
            {
                type: 'getOfflineReward',
                rewardType: 'Gold',
                rewardNum: 1000,
                title: '领取挂机奖励',
                getNeedNum: (level) => {
                    return level * 2;
                }
            },
            {
                type: 'lookAdVideo',
                rewardType: 'Diamond',
                rewardNum: 50,
                title: '看vvv次广告视频',
                getNeedNum: (level) => {
                    return level * 2;
                }
            },
        ];
    }
}


