import { Sprite } from "cc";
import { MsgMgr } from "../../dlspace/common/MsgMgr";
import { GIFController, IGIFData } from "../../dlspace/components/GIFController";
import { Bundle } from "../../global/Bundle";
import { Core } from "../../global/Core";
import { PlayerMaxAtkSpeedBonus, PlayerMaxCrtChance } from "../../global/IGame";
import { WeaponNames, WeaponType } from "../../utils/Model";

export interface IRewardBonusData {
    title: string;
    data: IRewardBonusBaseData
}

export interface IRewardBonusBaseData {
    priority: number;
    ico: string;
    getTitle: () => string;
    fn: (title: string, ...args: any[]) => void;
    weaponType?: WeaponType;
}

export enum HeroAction {
    addHpRatio = 'addHpRatio',
    addProperty = 'addProperty',
    addWeapon = 'addWeapon',
    addBullet = 'addBullet',
    revive = 'revive',
}

export class HeroData {

    static boomGIFDatas: IGIFData[];

    static async loadRes(finish: () => void) {
        if (!this.boomGIFDatas) {
            let boomData = await GIFController.getGIFData(Bundle.game, 'texture/fight/bullets/boom/', 'animation');
            this.boomGIFDatas = [boomData];
        }

        finish && finish();
    }

    static getRewardBonus(count: number, hpRatio = 1, weapons: Set<WeaponType> = null): IRewardBonusData[] {
        let result: IRewardBonusData[] = [];
        let datas = [...this.rewardBonusDatas];
        let addAtkSpeedEnabled = Core.game.info.heroInfo.AtkSpeedBonus < PlayerMaxAtkSpeedBonus;
        let addCrtEnabled = Core.game.info.heroInfo.CrtChance < PlayerMaxCrtChance;
        let addHpRatioEnabled = hpRatio < 1;
        let hasWeapon = false;
        datas.randomSort();
        datas = datas.filter(v => {
            let title = v.getTitle();
            if (title.startsWith('攻速+')) {
                if (!addAtkSpeedEnabled) {
                    return false;
                }
            }
            else if (title.startsWith('暴击率+')) {
                if (!addCrtEnabled) {
                    return false;
                }
            }
            else if (title.startsWith('恢复') && title.endsWith('血量')) {
                if (!addHpRatioEnabled) {
                    return false;
                }
            }
            else if (v.weaponType !== undefined) {
                if (!weapons) {
                    return true;
                }
                if (hasWeapon) {
                    return false;
                }
                if (weapons.size < 3 && !weapons.has(v.weaponType)) {
                    hasWeapon = true;
                    return true;
                }
                return false;
            }
            return true;
        });
        let weights = datas.map(v => v.priority);
        for (let i = 0; i < count; i++) {
            let index = Math.randomByWeights(weights);
            let data = datas[index];
            let title = data.getTitle();
            result.push({
                title,
                data
            });

            datas.splice(index, 1);
            weights.splice(index, 1);
        }
        return result;
    }

    private static _rewardBonusDatas: IRewardBonusBaseData[];
    static get rewardBonusDatas(): IRewardBonusBaseData[] {
        if (!this._rewardBonusDatas) {
            this._rewardBonusDatas = [
                {
                    priority: 1,
                    ico: 'texture/ui/ico-up-hp',
                    getTitle: () => {
                        let values = [100, 50, 30];
                        let index = this.randomIndex(values.length);
                        let value = values[index];
                        return `恢复${value}%血量`;
                    },
                    fn: (title) => {
                        MsgMgr.emit(HeroAction.addHpRatio, title.extractIntegers()[0] / 100);
                    }
                },
                {
                    priority: 1 / 2,
                    ico: 'texture/ui/ico-up-damage',
                    getTitle: () => {
                        let values = [20, 15, 10, 5];
                        let index = this.randomIndex(values.length);
                        let value = values[index];
                        return `攻击+${value}%`;
                    },
                    fn: (title) => {
                        MsgMgr.emit(HeroAction.addProperty, title);
                    }
                },
                {
                    priority: 1 / 2,
                    ico: 'texture/ui/ico-up-damage',
                    getTitle: () => {
                        let values = [20, 15, 10, 5];
                        let index = this.randomIndex(values.length);
                        let value = values[index];
                        return `附加伤害+${value}%`;
                    },
                    fn: (title) => {
                        MsgMgr.emit(HeroAction.addProperty, title);
                    }
                },
                {
                    priority: 1 / 2,
                    ico: 'texture/ui/ico-up-damage',
                    getTitle: () => {
                        let values = [50, 30, 15];
                        let index = this.randomIndex(values.length);
                        let value = values[index];
                        return `暴击伤害+${value}%`;
                    },
                    fn: (title) => {
                        MsgMgr.emit(HeroAction.addProperty, title);
                    }
                },
                {
                    priority: 1,
                    ico: 'texture/ui/ico-up-damage',
                    getTitle: () => {
                        let values = [30, 20, 10];
                        let index = this.randomIndex(values.length);
                        let value = values[index];
                        return `暴击率+${value}%`;
                    },
                    fn: (title) => {
                        MsgMgr.emit(HeroAction.addProperty, title);
                    }
                },
                {
                    priority: 1,
                    ico: 'texture/ui/ico-up-atk-speed',
                    getTitle: () => {
                        let values = [50, 40, 30];
                        let index = this.randomIndex(values.length);
                        let value = values[index];
                        return `攻速+${value}%`;
                    },
                    fn: (title) => {
                        MsgMgr.emit(HeroAction.addProperty, title);
                    }
                },
                {
                    priority: 1 / 5,
                    ico: 'texture/fight/weapons/w-2',
                    getTitle: () => {
                        return WeaponNames[WeaponType.Weapon_2];
                    },
                    fn: (title, ico: Sprite) => {
                        MsgMgr.emit(HeroAction.addWeapon, WeaponType.Weapon_2, ico);
                    },
                    weaponType: WeaponType.Weapon_2
                },
                {
                    priority: 1 / 5,
                    ico: 'texture/fight/weapons/w-3',
                    getTitle: () => {
                        return WeaponNames[WeaponType.Weapon_3];
                    },
                    fn: (title, ico: Sprite) => {
                        MsgMgr.emit(HeroAction.addWeapon, WeaponType.Weapon_3, ico);
                    },
                    weaponType: WeaponType.Weapon_3
                },
                {
                    priority: 1 / 5,
                    ico: 'texture/fight/weapons/w-4',
                    getTitle: () => {
                        return WeaponNames[WeaponType.Weapon_4];
                    },
                    fn: (title, ico: Sprite) => {
                        MsgMgr.emit(HeroAction.addWeapon, WeaponType.Weapon_4, ico);
                    },
                    weaponType: WeaponType.Weapon_4
                },
                {
                    priority: 3,
                    ico: 'texture/fight/bullets/ico-add-bullet',
                    getTitle: () => {
                        let values = [200, 150, 100, 50];
                        let index = this.randomIndex(values.length, 1.5);
                        let value = values[index];
                        return `子弹+${value}`;
                    },
                    fn: (title, ico: Sprite) => {
                        MsgMgr.emit(HeroAction.addBullet, title.extractIntegers()[0], ico);
                    }
                },
            ];

        }
        return this._rewardBonusDatas;
    }

    //概率从小到大
    static randomIndex(length: number, t = 2.5) {
        let weights = Math.createWeights(length, t);
        return Math.randomByWeights(weights);
    }


}

