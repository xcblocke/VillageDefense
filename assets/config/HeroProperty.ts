import { ObjectConfig } from "./ObjectConfig";

/* 英雄属性信息 */
export interface IHeroProperty {
  /* 每级所需经验增加(0,100,200,300) */
  exp: number;

  /* 生命值 */
  Hp: number;

  /* 生命值-每级加成 */
  HpIncrease: number;

  /* 攻击力 */
  Damage: number;

  /* 攻击力-每级加成 */
  DamageIncrease: number;

  /* 攻击速度 */
  AtkSpeed: number;

  /* 生命加成 */
  HpBonus: number;

  /* 攻击加成 */
  DamageBonus: number;

  /* 攻击速度加成 */
  AtkSpeedBonus: number;

  /* 暴击几率加成 */
  CrtChance: number;

  /* 暴击伤害加成 */
  CrtDamageBonus: number;

  /* 附加伤害加成 */
  AddDamageBonus: number;
}

export const HeroProperty: IHeroProperty = ObjectConfig.getObject(
  "%5B%7B%22exp%22%3A100%2C%22Hp%22%3A600%2C%22HpIncrease%22%3A60%2C%22Damage%22%3A200%2C%22DamageIncrease%22%3A20%2C%22AtkSpeed%22%3A2%2C%22HpBonus%22%3A0%2C%22DamageBonus%22%3A0%2C%22AtkSpeedBonus%22%3A0%2C%22CrtChance%22%3A10%2C%22CrtDamageBonus%22%3A50%2C%22AddDamageBonus%22%3A0%7D%5D",
);
