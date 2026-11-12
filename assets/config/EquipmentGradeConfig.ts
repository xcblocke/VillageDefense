import { ArrayConfig } from "./ArrayConfig";

/* 品阶表 */
export interface IEquipmentGradeConfig {
  /* 品阶 */
  grade: any;

  /* 最高星级 */
  maxStar: number;

  /* 最高Lv */
  maxLevel: number;

  /* 生命 */
  hp: number;

  /* 攻击 */
  damage: number;

  /* 生命-每级加成 */
  hpIncrease: number;

  /* 攻击-每级加成 */
  damageIncrease: number;
}

class __EquipmentGradeConfig__ extends ArrayConfig<IEquipmentGradeConfig> {}

export const EquipmentGradeConfig = new __EquipmentGradeConfig__(
  "%5B%7B%22grade%22%3A%22S%22%2C%22maxStar%22%3A5%2C%22maxLevel%22%3A30%2C%22hp%22%3A1500%2C%22damage%22%3A300%2C%22hpIncrease%22%3A90%2C%22damageIncrease%22%3A30%7D%2C%7B%22grade%22%3A%22A%22%2C%22maxStar%22%3A3%2C%22maxLevel%22%3A30%2C%22hp%22%3A900%2C%22damage%22%3A200%2C%22hpIncrease%22%3A60%2C%22damageIncrease%22%3A20%7D%2C%7B%22grade%22%3A%22B%22%2C%22maxStar%22%3A1%2C%22maxLevel%22%3A30%2C%22hp%22%3A600%2C%22damage%22%3A150%2C%22hpIncrease%22%3A45%2C%22damageIncrease%22%3A15%7D%2C%7B%22grade%22%3A%22C%22%2C%22maxStar%22%3A1%2C%22maxLevel%22%3A30%2C%22hp%22%3A300%2C%22damage%22%3A100%2C%22hpIncrease%22%3A30%2C%22damageIncrease%22%3A10%7D%5D",
);
