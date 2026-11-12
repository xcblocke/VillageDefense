import { ObjectConfig } from "./ObjectConfig";

/* 怪物属性信息 */
export interface IMonsterProperty {
  /* 生命 */
  Hp: number;

  /* 生命-每级加成 */
  HpIncrease: number;

  /* 生命-Boss加成比例 */
  HpIncreaseBoss: number;

  /* 攻击 */
  Damage: number;

  /* 攻击-每级加成 */
  DamageIncrease: number;

  /* 攻击-Boss加成比例 */
  DamageIncreaseBoss: number;

  /* 攻击速度 */
  AtkSpeed: number;

  /* 移动速度 */
  MoveSpeed: number;

  /* 每波数量 */
  Count: number;

  /* 每波数量-每级加成 */
  CountIncrease: number;
}

export const MonsterProperty: IMonsterProperty = ObjectConfig.getObject(
  "%5B%7B%22Hp%22%3A800%2C%22HpIncrease%22%3A400%2C%22HpIncreaseBoss%22%3A40%2C%22Damage%22%3A100%2C%22DamageIncrease%22%3A50%2C%22DamageIncreaseBoss%22%3A2%2C%22AtkSpeed%22%3A2%2C%22MoveSpeed%22%3A30%2C%22Count%22%3A10%2C%22CountIncrease%22%3A1%7D%5D",
);
