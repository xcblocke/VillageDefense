import { _decorator, instantiate, Label, Node, Prefab, tween, Vec3 } from 'cc';
import { EquipmentConfig } from 'db://assets/config/EquipmentConfig';
import { EquipmentGrade, EquipmentGrades } from '../../config/IConfig';
import { DialogController } from '../../dlspace/components/DialogController';
import { UISprite } from '../../dlspace/components/UISprite';
import { Utils } from '../../dlspace/utils/Utils';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { addEquipment, getRandomEquipmentId, loadSpriteFrame, lookAdVideo } from '../../utils/GameUtils';
import { LockMgr } from '../../utils/LockMgr';
import { IRewardData } from '../../utils/Model';
import { ShowRewardDialog } from './ShowRewardDialog';
const { ccclass, property } = _decorator;

const WheelCount = 8;

interface IWheelData {
    grade: EquipmentGrade,
    equipmentId: number,
    active: boolean;
    i: number
}

interface IWheelItem {
    data: IWheelData;
    priority: number;
    node?: Node;
    angle?: number;
}

@ccclass('WheelController')
export class WheelController extends DialogController {

    @property(Node)
    wheel: Node;

    @property(Label)
    btnLabel: Label;

    @property(Node)
    btnMask: Node;

    private _items: IWheelItem[] = [];

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/wheel", Prefab);
    }

    protected _open() {
        let prefabNode = this.wheel.children[0];
        prefabNode.parent = null;

        this._items = this._getItems();

        let itemAngle = 360 / this._items.length;
        let offsetAngle = 0; //itemAngle / 2;
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            let node = instantiate(prefabNode);
            node.parent = this.wheel;
            let pos = prefabNode.getPosition();
            let angle = itemAngle * i + offsetAngle;
            Vec3.rotateZ(pos, pos, Vec3.ZERO, angle * Math.PI / 180);
            node.setPosition(pos);
            node.angle = angle;
            item.node = node;
            item.angle = angle;

            let config = EquipmentConfig.where('id', item.data.equipmentId);
            node.getChildByName('title').getComponent(Label).string = item.data.active ? config.name : '已领取';
            node.getChildByName('glow').active = item.data.active;
            node.getChildByName('mask').active = !item.data.active;
            node.getChildByName('grade').getComponent(Label).string = item.data.grade;
            let ico = node.getChildByName('ico').getComponent(UISprite);
            loadSpriteFrame(ico, `texture/equipment/${config.ico}`);
        }

        this.schedule(() => {
            this.reloadBtn();
        }, 1);
        this.reloadBtn();
    }

    randomWheel() {
        if (!Core.userInfo.day.wheel) {
            return;
        }
        lookAdVideo(err => {
            if (!!err) return;

            let weights = this._items.map(item => item.data.active ? item.priority : 0);
            let randomIndex = Math.randomByWeights(weights);
            let item = this._items[randomIndex];
            let curAngle = Math.ceil(this.wheel.angle / 360) * 360 + 360 * 3;
            curAngle += 360 - item.angle;
            LockMgr.lock();
            tween(this.wheel).to(6, { angle: curAngle }, { easing: 'quadInOut' }).call(() => {
                this.scheduleOnce(() => {
                    LockMgr.unlock();
                    this._getReward(item);
                }, 0.5);
            }).start();

        });
    }

    private reloadBtn(): void {
        if (!Core.userInfo.day.wheel) {
            let time = Core.userInfo.secondsMidnight;
            this.btnLabel.string = Utils.formatTime(time, 'hh:mm:ss');
            this.btnMask.active = true;
        }
        else {
            this.btnLabel.string = '免费';
            this.btnMask.active = false;
        }
    }

    private _getReward(item: IWheelItem) {
        Core.userInfo.day.wheel = false;

        let datas: IWheelData[] = [...Core.userInfo.wheel];
        datas.find(v => v.i === item.data.i).active = false;
        Core.userInfo.wheel = datas;

        let equipmentData = addEquipment(item.data.equipmentId, item.data.grade);
        let reward: IRewardData = {
            equipments: [equipmentData]
        };
        ShowRewardDialog.show(reward);
        this.close();
    }

    private _getItems() {
        let datas: IWheelData[] = Core.userInfo.wheel;
        if (datas.length <= 0 || !datas.find(item => item.grade === 'S').active) {
            datas = this._reloadDatas();
        }
        let items: IWheelItem[] = [];
        for (const data of datas) {
            items.push({
                data,
                priority: (EquipmentGrades.indexOf(data.grade) + 1)
            });
        }
        return items;
    }

    private _reloadDatas() {
        let datas: IWheelData[] = [];
        for (let i = 0; i < WheelCount; i++) {
            let grade: EquipmentGrade;
            if (i === 0) {
                grade = 'S';
            }
            else if (i <= 2) {
                grade = 'A';
            }
            else if (i <= 5) {
                grade = 'B';
            }
            else {
                grade = 'C';
            }
            datas.push({
                grade,
                equipmentId: getRandomEquipmentId(),
                active: true,
                i
            });
        }
        Core.userInfo.wheel = datas;
        return datas;
    }

}


