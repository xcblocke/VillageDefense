import { SaveProp } from "../dlspace/utils/SaveProp";

/**
 * 时间信息类，用于保存剩余时间的数据。
 * 根据TimerSystem自动计算距离目标时间还有多少s
 */
class _TimerInfo {
    @SaveProp.decorator(0)
    getAdGold: number;

    @SaveProp.decorator(0)
    getAdDiamond: number;

    @SaveProp.decorator(0)
    getAdEnergy: number;

    @SaveProp.decorator(0)
    getFreeChest: number;

    @SaveProp.decorator(0)
    offlineRewardFast: number;

    constructor() {
        SaveProp.initObject(this);
    }

}

export const TimerInfo = new _TimerInfo();