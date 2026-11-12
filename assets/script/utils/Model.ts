import { HeroPropertyEnum, MonsterPropertyEnum } from "../config/IConfig";
import { IUserEquipmentData } from "../global/UserInfo";
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html
export interface IGameingInfo {
    level: number;
    progress: number;
    revived: boolean;
    heroInfo: IGamingHeroInfo;
    monsterInfo: IGamingMonsterInfo;
}

export type IGamingHeroInfo = {
    [key in HeroPropertyEnum]: number;
}

export type IGamingMonsterInfo = {
    [key in MonsterPropertyEnum]: number;
} & {
    HpBoss: number;
    DamageBoss: number;
    Count: number;
}

export interface IRewardData {
    diamond?: number;
    gold?: number;
    exp?: number;
    equipments?: IUserEquipmentData[];
    composites?: {
        S?: number;
        A?: number;
        B?: number;
        C?: number;
    };
    chestCount?: number;
}

export enum WeaponType {
    //步枪
    Weapon_1 = 0,
    //灵能爆弹枪
    Weapon_2,
    //脉冲急射枪
    Weapon_3,
    //电磁激光枪
    Weapon_4,
}

export const WeaponNames = ['异能者步枪', '灵能爆弹枪', '脉冲急射枪', '电磁激光枪'];