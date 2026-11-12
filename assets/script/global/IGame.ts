import { IGameingInfo } from "../utils/Model";

export interface IGame {
    get state(): GameState;
    set state(state: GameState);
    info: IGameingInfo;
}

export enum GameState {
    Gaming,
    Pause,
    Ended,
}

export enum GameAction {
    onGuideNext = 'onGuideNext',
    onEquipmentUpgrade = 'onEquipmentUpgrade',
    onDayEnd = 'onDayEnd',
}

export enum SceneName {
    Lobby = 'Lobby',
    Game = 'Game',
}

//最大体力值
export const MaxEnergy = 100;
//体力值恢复速度,x秒恢复1点体力
export const EnergyCreateDelay = 60;
//最大背包数量
export const MaxBackpackCount = 200;
//通关后奖励经验值
export const PassedLevelRewardExp = 100;
//玩家等级上限
export const PlayerMaxLevel = 30;
//玩家最大攻击速度加成百分比
export const PlayerMaxAtkSpeedBonus = 200;
//玩家最大暴击率百分比
export const PlayerMaxCrtChance = 100;