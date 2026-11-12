import { _decorator, AudioClip, Button, instantiate, Label, Node } from 'cc';
import { EquipmentConfig } from 'db://assets/config/EquipmentConfig';
import { EquipmentGrade, EquipmentGrades } from '../../config/IConfig';
import { ShopDailyShopData, ShopDailyShopItem } from '../../controller/ShopDailyShopItem';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { MsgMgr } from '../../dlspace/common/MsgMgr';
import { Controller } from '../../dlspace/components/Controller';
import { UIScrollView } from '../../dlspace/components/UIScrollView';
import { Utils } from '../../dlspace/utils/Utils';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { GameAction } from '../../global/IGame';
import { addAchievementCount, addCompositeCount, addEquipment, getRandomGrade, isBackpackFull } from '../../utils/GameUtils';
import { IRewardData } from '../../utils/Model';
import { ShowRewardDialog } from '../ui/ShowRewardDialog';
import { Toast } from '../ui/Toast';
const { ccclass, property } = _decorator;

@ccclass('ShopPage')
export class ShopPage extends Controller {

    @property(UIScrollView)
    scrollView: UIScrollView;

    @property(Node)
    dailyRewardList: Node;

    @property(Node)
    dailyShopList: Node;

    @property(Node)
    chestBuyAd: Node;

    @property(Node)
    chestBuyDiamond: Node;

    @property(Node)
    chestDetail: Node;

    @property(Node)
    compositesShopList: Node;

    @property(Label)
    countdownLabels: Label[] = [];

    private _dailyShopItem: Node;

    protected onLoad(): void {
        this._dailyShopItem = this.dailyShopList.children[0];
        this._dailyShopItem.parent = null;
    }

    start() {
        this.scrollView.init((node) => {
            node.emit(Button.EventType.CLICK);
            AudioMgr.inst.playOneShot(Bundle.audio.get('click', AudioClip), 0.1);
        });
        for (const child of this.dailyRewardList.children) {
            this.scrollView.addClickNode(child);
        }
        this.scrollView.addClickNode(this.chestBuyAd);
        this.scrollView.addClickNode(this.chestBuyDiamond);
        this.scrollView.addClickNode(this.chestDetail);
        for (const child of this.compositesShopList.children) {
            this.scrollView.addClickNode(child);
        }
    }

    protected onEnable(): void {
        this._reloadDailyShop();
        MsgMgr.on(GameAction.onDayEnd, this._reloadDailyShop, this);
    }

    protected onDisable(): void {
        MsgMgr.off(GameAction.onDayEnd, this._reloadDailyShop, this);
    }

    update(deltaTime: number) {
        let time = Core.userInfo.secondsMidnight;
        for (const label of this.countdownLabels) {
            label.string = Utils.formatTime(time, 'hh:mm:ss');
        }
    }

    private _reloadDailyShop() {
        for (const child of this.dailyShopList.children) {
            this.scrollView.deleteClickNode(child);
        }
        let items: ShopDailyShopData[] = Core.userInfo.day.shopItems;
        if (!items) {
            items = [];
            const gradeOrder = ['S', 'A', 'B', 'C'];
            for (let i = 0; i < EquipmentGrades.length; i++) {
                let data: ShopDailyShopData = {
                    type: 'Composites',
                    grade: EquipmentGrades[i],
                    active: true,
                };
                let addCountRate = gradeOrder.indexOf(data.grade) + 1;
                data.compositesNum = Math.ceil(Math.randomInt2(3, 15) * addCountRate);
                items.push(data);
            }
            let equipmentIds = EquipmentConfig.configs.map(item => item.id);
            let equipmentGrades: EquipmentGrade[] = [];
            for (let i = 0; i < 4; i++) {
                equipmentGrades.push(getRandomGrade());
            }
            equipmentGrades.sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b));

            for (let i = 0; i < equipmentGrades.length; i++) {
                let data: ShopDailyShopData = {
                    type: 'Equipment',
                    grade: equipmentGrades[i],
                    active: true,
                };
                let randomIndex = Math.randomInt(0, equipmentIds.length);
                data.equipmentId = equipmentIds[randomIndex];
                equipmentIds.splice(randomIndex, 1);
                items.push(data);
            }
            Core.userInfo.day.shopItems = items;
        }

        this.dailyShopList.removeAllChildren();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let node = instantiate(this._dailyShopItem);
            node.parent = this.dailyShopList;
            let comp = node.getComponent(ShopDailyShopItem);
            comp.init(item, (saleMoney) => {
                if (item.type === 'Equipment' && isBackpackFull()) {
                    return;
                }
                if (Core.userInfo.gold < saleMoney) {
                    Toast.show('金币不足!');
                    return;
                }
                Core.userInfo.gold -= saleMoney;
                item.active = false;
                Core.userInfo.day.shopItems = items;
                addAchievementCount('buyInDailyShop');
                comp.init(item, null);

                if (item.type === 'Composites') {
                    addCompositeCount(item.grade, item.compositesNum);
                    let reward: IRewardData = {
                        composites: {
                            [item.grade]: item.compositesNum
                        }
                    };
                    ShowRewardDialog.show(reward);
                }
                else {
                    let data = addEquipment(item.equipmentId, item.grade);
                    let reward: IRewardData = {
                        equipments: [data]
                    };
                    ShowRewardDialog.show(reward);
                }
            });
        }

        for (const child of this.dailyShopList.children) {
            this.scrollView.addClickNode(child);
        }
    }

}

