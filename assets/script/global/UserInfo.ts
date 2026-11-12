import { EquipmentGrade } from "../config/IConfig";
import { MsgMgr } from "../dlspace/common/MsgMgr";
import { SaveProp } from "../dlspace/utils/SaveProp";
import { getServerTimestamp } from "../dlspace/utils/ServerUtils";
import { Utils } from "../dlspace/utils/Utils";
import { EnergyCreateDelay, GameAction, MaxEnergy } from "./IGame";

export class UserInfo {

    @SaveProp.decorator(null)
    userID: string;

    @SaveProp.decorator('')
    dayTag: string;

    private _day: UserInfoDay;
    get day() {
        if (!this._day) {
            this._day = new UserInfoDay(this);
        }
        return this._day;
    }

    //要通关的关卡
    @SaveProp.decorator(1)
    passLevel: number;

    //玩家经验
    @SaveProp.decorator(0)
    exp: number;

    //玩家等级
    @SaveProp.decorator(1)
    level: number;

    @SaveProp.decorator(0)
    gold: number;

    @SaveProp.decorator(0)
    diamond: number;

    @SaveProp.decorator(MaxEnergy)
    energy: number;

    @SaveProp.decorator(0)
    energyTime: number;

    //已装备的装备信息
    @SaveProp.decorator({
        p1: null,
        p2: null,
        p3: null,
        p4: null
    })
    equipped: IEquippedData;

    //所有装备信息
    @SaveProp.decorator([])
    equipments: IUserEquipmentData[];

    //所有升级材料
    @SaveProp.decorator({})
    composites: any;

    @SaveProp.decorator({})
    achievement: any;

    @SaveProp.decorator(null)
    reward: any;

    @SaveProp.decorator(0)
    offlineRewardTime: number;

    @SaveProp.decorator([])
    redeems: string[];

    @SaveProp.decorator(true)
    firstGift: boolean;

    @SaveProp.decorator(true)
    gameGuide: boolean;

    @SaveProp.decorator(false)
    vip: boolean;

    @SaveProp.decorator([])
    wheel: any[];

    //距离明天还要多少秒
    secondsMidnight = 0;

    constructor() {
        SaveProp.initObject(this);
        if (!this.userID) {
            this.userID = Utils.randomUUID();
        }
    }

    reloadHalfSecond() {
        if (this.day.isDayEnd()) {
            this._day = null;
            MsgMgr.emit(GameAction.onDayEnd);
        }
        this.secondsMidnight = this._getSecondsMidnight();

        let nowTime = getServerTimestamp();

        let energy = this.energy;
        if (energy >= MaxEnergy) {
            this.energyTime = nowTime;
        }
        else {
            let lastTime = this.energyTime;
            let addPower = Math.floor((nowTime - lastTime) / 1000 / EnergyCreateDelay);
            if (addPower > 0) {
                energy = Math.min(MaxEnergy, energy + addPower);
                this.energyTime = nowTime;
                this.energy = energy;
            }
        }

        if (this.offlineRewardTime === 0) {
            this.offlineRewardTime = nowTime;
        }
    }

    private _getSecondsMidnight() {
        const now = new Date(getServerTimestamp());
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const diffInMs = midnight.getTime() - now.getTime();
        const diffInSeconds = Math.floor(diffInMs / 1000);
        return diffInSeconds;
    }

}

export class UserInfoDay {

    //今天的抖音奖励是否可用
    @SaveProp.decorator(true)
    dyRewardEnable: boolean;

    //每日金币奖励
    @SaveProp.decorator(true)
    goldReward: boolean;

    //每日钻石奖励
    @SaveProp.decorator(true)
    diamondReward: boolean;

    //每日抽奖
    @SaveProp.decorator(true)
    wheel: boolean;

    @SaveProp.decorator(null)
    shopItems: any[];

    @SaveProp.decorator(null)
    task: any;

    @SaveProp.decorator({})
    achievement: any;

    private _userInfo: UserInfo;

    constructor(userInfo: UserInfo) {
        this._userInfo = userInfo;
        let tag = this._getTag();
        if (userInfo.dayTag.length > 0 && tag !== userInfo.dayTag) {
            SaveProp.removeObject(this, userInfo.dayTag);
        }
        userInfo.dayTag = tag;
        SaveProp.initObject(this, tag);
    }

    isDayEnd() {
        let tag = this._getTag();
        if (this._userInfo.dayTag.length > 0 && tag !== this._userInfo.dayTag) {
            return true;
        }
        return false;
    }

    private _getTag() {
        let date = new Date(getServerTimestamp());
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let tag = `${year % 100}${month}${day}`;
        return Number(tag).toString(36);
    }

}

//已拥有的装备数据
export interface IUserEquipmentData {
    id: number;
    level: number;
    star: number;
    grade: EquipmentGrade;
    //当获取时随机生成的id
    uid: string;
}

//已装备的数据,value是uid去我的装备里查，或者null就是没装备
export interface IEquippedData {
    p1: string | null;
    p2: string | null;
    p3: string | null;
    p4: string | null;
}
