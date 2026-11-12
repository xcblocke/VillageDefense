import { clamp01, isValid, lerp, SpriteFrame } from "cc";
import { EquipmentConfig } from "../../config/EquipmentConfig";
import { EquipmentGradeConfig } from "../../config/EquipmentGradeConfig";
import { HeroProperty } from "../../config/HeroProperty";
import { AchievementType, EquipmentGrade, EquipmentGrades, EquipmentType, EquipmentTypes, HeroPropertyDescEnums, HeroPropertyEnum, HeroPropertyEnums } from "../config/IConfig";
import { AudioMgr } from "../dlspace/common/AudioMgr";
import { LoadMgr } from "../dlspace/common/LoadMgr";
import { TShareCallback } from "../dlspace/libs/platform/IPlatformMgr";
import { PlatformMgr } from "../dlspace/libs/platform/PlatformMgr";
import { Utils } from "../dlspace/utils/Utils";
import { Bundle } from "../global/Bundle";
import { Core } from "../global/Core";
import { MaxBackpackCount, PlayerMaxLevel } from "../global/IGame";
import { IUserEquipmentData } from "../global/UserInfo";
import { NotifiDialog } from "../prefab/ui/NotifiDialog";
import { Toast } from "../prefab/ui/Toast";
import { IGamingHeroInfo, IRewardData } from "./Model";
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html
/**
 * 数字转字符串显示
 * @param num 
 * @returns 
 */
export function numberToString(num: number) {
    if (num >= 1000000000) {
        return (num / 100000000).toFixed(1) + "亿";
    }
    if (num >= 100000) {
        return (num / 10000).toFixed(1) + "万";
    }
    return num.toString();
}

/**
 * 获取不同装备的占位图
 * @param type 
 * @returns 
 */
export function getEquipmentEmptyIco(type: EquipmentType) {
    return `texture/ui/equipment-${type}-empty`;
}

/**
 * 获取装备类型的图标
 * @param type 
 * @returns 
 */
export function getEquipmentTypeIco(type: EquipmentType) {
    return `texture/ui/equipment-${type}`;
}

/**
 * 根据装备类型获取边框
 * @param grade 
 * @returns 
 */
export function getEquipmentFrame(grade: EquipmentGrade) {
    let filename = '';
    if (grade === 'S') {
        filename = 'equipment-frame4';
    }
    else if (grade === 'A') {
        filename = 'equipment-frame3';
    }
    else if (grade === 'B') {
        filename = 'equipment-frame2';
    }
    else if (grade === 'C') {
        filename = 'equipment-frame1';
    }
    return `texture/ui/${filename}`;
}

/**
 * 获取道具的边框
 * @returns 
 */
export function getPropFrame() {
    return 'texture/ui/frame-composites';
}

/**
 * 移除装备
 * @param uids 
 * @param isDegrade 
 */
export function deleteEquipment(uids: string[]) {
    let keys = Object.keys(Core.userInfo.equipped);
    for (const key of keys) {
        let uid = Core.userInfo.equipped[key];
        if (!!uid && uids.indexOf(uid) !== -1) {
            Core.userInfo.equipped[key] = null;
        }
    }
    let equipments = [...Core.userInfo.equipments];
    Core.userInfo.equipments = equipments.filter(item => uids.indexOf(item.uid) === -1);
    Core.userInfo.equipped = Core.userInfo.equipped;
}

/**
 * 获取升级所需要的材料
 * @param level 
 * @returns 
 */
export function getUpgradeNeedComposite(level: number, star: number) {
    return Math.ceil(level / 10) * (3 + star);
}

/**
 * 获取升级所需要的金币
 * @param level 
 * @returns 
 */
export function getUpgradeNeedGold(level: number, star: number) {
    return Math.ceil((level * 200 + 1000) * (1 + star / 2));
}

/**
 * 获取比率 装备换成多少个升级材料
 * @param grade 
 * @returns 
 */
export function getRatioByEquipmentToCompsites(grade: EquipmentGrade) {
    return 10;
}

/**
 * 获取比率 升级材料换成多少金币
 * @param grade 
 * @returns 
 */
export function getRatioByCompsitesToGold(grade: EquipmentGrade) {
    if (grade === 'S') {
        return 3000;
    }
    else if (grade === 'A') {
        return 1000;
    }
    else if (grade === 'B') {
        return 300;
    }
    else if (grade === 'C') {
        return 100;
    }
}

/**
 * 获取分解都能得到什么奖励
 * @param grade 
 * @param star 
 * @param level 
 * @returns 
 */
export function getDegradeReward(grade: EquipmentGrade, star: number, level: number) {
    let gradeConfig = EquipmentGradeConfig.where('grade', grade);
    let gold = 0;
    let composite = 0;
    while (star >= 0 && level > 0) {
        level--;
        if (level === 0) {
            if (star === 0) {
                break;
            }
            star--;
            level = gradeConfig.maxLevel;
        }
        else {
            gold += getUpgradeNeedGold(level, star);
            composite += getUpgradeNeedComposite(level, star);
        }
    }
    gold = Math.floor(gold * 0.8);
    composite = Math.floor(composite * 0.8);

    gold += Math.ceil(getShopEquipmentSaleMoney(grade) / 5);
    composite += getRatioByEquipmentToCompsites(grade);
    return { gold, composite };
}

/**
 * 获取装备的属性类型
 * @param type 
 * @returns 
 */
export function getHeroPropertyTypeByEquipmentType(type: EquipmentType): HeroPropertyEnum {
    if (type === 'p3' || type === 'p4') {
        return 'Damage';
    }
    return 'Hp';
}

/**
 * 获取装备的属性值
 * @param property 
 * @param grade 
 * @param star 
 * @param level 
 * @returns 
 */
export function getHeroPropertyValueByEquipment(property: HeroPropertyEnum, grade: string, star: number, level: number) {
    let gradeConfig = EquipmentGradeConfig.where('grade', grade);
    level += star * gradeConfig.maxLevel + star * starEqualLevel * 5;
    level -= 1;
    if (property === 'Damage') {
        return gradeConfig.damageIncrease * level + gradeConfig.damage;
    }
    if (property === 'Hp') {
        return gradeConfig.hpIncrease * level + gradeConfig.hp;
    }
    return 0;
}

/**
 * 获取已穿戴的套装数量
 * @returns 
 */
export function getEquipmentSetEquippedCount(setName: string) {
    let equippedKeys = Object.keys(Core.userInfo.equipped);
    let count = 0;
    for (const key of equippedKeys) {
        let uid = Core.userInfo.equipped[key];
        if (!!uid) {
            let item = Core.userInfo.equipments.find(v => v.uid === uid);
            let config = EquipmentConfig.where('id', item.id);
            if (!setName) {
                setName = config.setName;
            }
            if (setName === config.setName) {
                count++;
            }
        }
    }
    return count;
}

/**
 * 获取材料数量
 * @param grade 
 * @returns 
 */
export function getCompositeCount(grade: EquipmentGrade): number {
    let key = `${grade}`;
    return Core.userInfo.composites[key] ?? 0;
}

/**
 * 设置材料数量
 * @param grade 
 * @param count 
 */
export function setCompositeCount(grade: EquipmentGrade, count: number) {
    let key = `${grade}`;
    Core.userInfo.composites[key] = count;
    Core.userInfo.composites = Core.userInfo.composites;
}

/**
 * 添加材料数量
 * @param grade 
 * @param count 
 */
export function addCompositeCount(grade: EquipmentGrade, count: number) {
    if (count === 0) return;
    let v = getCompositeCount(grade);
    setCompositeCount(grade, v + count);
}

/**
 * 获取成就数量
 * @param type 
 * @returns 
 */
export function getAchievementCount(type: AchievementType): number {
    let key = `${type}`;
    return Core.userInfo.achievement[key] ?? 0;
}

/**
 * 获取当天成就数量
 * @param type 
 * @returns 
 */
export function getAchievementCountInDay(type: AchievementType): number {
    let key = `${type}`;
    return Core.userInfo.day.achievement[key] ?? 0;
}

/**
 * 设置成就数量
 * @param type 
 * @param count 
 */
export function setAchievementCount(type: AchievementType, count: number) {
    let key = `${type}`;
    Core.userInfo.achievement[key] = count;
    Core.userInfo.achievement = Core.userInfo.achievement;
}

/**
 * 设置当天成就数量
 * @param type 
 * @param count 
 */
export function setAchievementCountInDay(type: AchievementType, count: number) {
    let key = `${type}`;
    Core.userInfo.day.achievement[key] = count;
    Core.userInfo.day.achievement = Core.userInfo.day.achievement;
}

/**
 * 添加成就数量和或者当天的
 * @param type 
 * @param count 
 */
export function addAchievementCount(type: AchievementType, count = 1, inDay = true) {
    if (count === 0) return;
    let v = getAchievementCount(type);
    setAchievementCount(type, v + count);
    if (inDay) {
        let vv = getAchievementCountInDay(type);
        setAchievementCountInDay(type, vv + count);
    }
}

/**
 * 升级装备
 * @param uid 
 */
export function upgradeEquipment(uid: string) {
    let item = Core.userInfo.equipments.find(v => v.uid === uid);
    if (!!item) {
        let gradeConfig = EquipmentGradeConfig.where('grade', item.grade);
        let needUpStar = gradeConfig.maxLevel === item.level;
        if (needUpStar) {
            item.star++;
            item.level = 1;
        }
        else {
            item.level++;
        }
        Core.userInfo.equipments = Core.userInfo.equipments;
    }
}

/**
 * 获取装备是否已穿戴
 * @param uid 
 */
export function getEquipmentIsEquipped(uid: string) {
    if (Core.userInfo.equipped.p1 === uid) return true;
    if (Core.userInfo.equipped.p2 === uid) return true;
    if (Core.userInfo.equipped.p3 === uid) return true;
    if (Core.userInfo.equipped.p4 === uid) return true;
    return false;
}

export async function loadSpriteFrame(sprite: { spriteFrame: SpriteFrame }, path: string) {
    if (!sprite || sprite['_SFPath'] === path) {
        return;
    }
    sprite['_SFPath'] = path;
    sprite.spriteFrame = null;
    LoadMgr.loadSpriteFrame(Bundle.game, path).then(sf => {
        if (isValid(sprite, true) && sprite['_SFPath'] === path) {
            sprite.spriteFrame = sf;
        }
    });
}

/**
 * 根据稀有度几率获取稀有度等级
 * @param low 几率是否低，目前只有闯关失败获得的奖励几率是低
 * @returns 
 */
export function getRandomGrade(low = false): EquipmentGrade {
    let gradeWeight = getRandomGradeWeights(low);
    let randomIndex = Math.randomByWeights(gradeWeight);
    return EquipmentGrades[randomIndex];
}

/**
 * 获取稀有度的权重
 * @param low 
 * @returns 
 */
export function getRandomGradeWeights(low = false): number[] {
    let levelProgress = Core.userInfo.level / (PlayerMaxLevel * 2 / 3);
    levelProgress = clamp01(levelProgress);
    let sProbability = lerp(0, 0.1, levelProgress);
    let aProbability = lerp(0.01, 0.2, levelProgress);
    let bProbability = lerp(0.2, 0.6, levelProgress);
    let cProbability = lerp(0.79, 0.1, levelProgress);
    if (low) {
        sProbability /= 9;
        aProbability /= 6;
        bProbability /= 3;
    }
    if (Core.userInfo.vip) {
        sProbability = 0.3;
        aProbability = 0.3;
        bProbability = 0.3;
        cProbability = 0.1;
    }
    let gradeWeight = [sProbability, aProbability, bProbability, cProbability];
    return gradeWeight;
}

/**
 * 获取随机装备id
 * @returns 
 */
export function getRandomEquipmentId() {
    let randomIndex = Math.randomInt(0, EquipmentConfig.configs.length);
    return EquipmentConfig.configs[randomIndex].id;
}

/**
 * 装备排序
 * @param datas 
 * @returns 
 */
export function sortEquipments(datas: IUserEquipmentData[]) {
    const gradeOrder = ['S', 'A', 'B', 'C'];
    datas.sort((a, b) => {
        const indexA = gradeOrder.indexOf(a.grade);
        const indexB = gradeOrder.indexOf(b.grade);
        if (indexA === indexB) {
            if (a.star !== b.star) {
                return b.star - a.star;
            }
            if (a.level !== b.level) {
                return b.level - a.level;
            }
            const configA = EquipmentConfig.where('id', a.id);
            const configB = EquipmentConfig.where('id', b.id);
            const typeA = EquipmentTypes.indexOf(configA.type);
            const typeB = EquipmentTypes.indexOf(configB.type);
            if (typeA !== typeB) {
                return typeA - typeB;
            }
            return configA.id - configB.id;
        }
        return indexA - indexB;
    });
    return datas;
}

/**
 * 获取装备的数量（已装备的除外）
 * @param equipped 是否计算已装备的（默认不计算）
 * @returns 
 */
export function getEquipmentCount(equipped = false): number {
    let count = Core.userInfo.equipments.length;
    if (!equipped) {
        if (Core.userInfo.equipped.p1 !== null) count--;
        if (Core.userInfo.equipped.p2 !== null) count--;
        if (Core.userInfo.equipped.p3 !== null) count--;
        if (Core.userInfo.equipped.p4 !== null) count--;
    }
    return count;
}

/**
 * 获取商城的售价（材料）
 * @param grade 
 * @returns 
 */
export function getShopCompositesSaleMoney(grade: EquipmentGrade): number {
    return getRatioByCompsitesToGold(grade);
}

/**
 * 获取商城的售价（装备）
 * @param grade 
 * @returns 
 */
export function getShopEquipmentSaleMoney(grade: EquipmentGrade): number {
    let count = getRatioByEquipmentToCompsites(grade);
    return getRatioByCompsitesToGold(grade) * count;
}

/**
 * 添加装备到背包中
 * @param equipmentId 
 * @param grade 
 */
export function addEquipment(equipmentId: number, grade: EquipmentGrade): IUserEquipmentData {
    let data = createEquipment(equipmentId, grade);
    addEquipmentByDatas([data]);
    return data;
}

export function addEquipmentByDatas(datas: IUserEquipmentData[]) {
    Core.userInfo.equipments = [...Core.userInfo.equipments, ...datas];
}

/**
 * 创建装备数据
 * @param equipmentId 
 * @param grade 
 * @returns 
 */
export function createEquipment(equipmentId: number, grade: EquipmentGrade): IUserEquipmentData {
    return {
        id: equipmentId,
        level: 1,
        star: 0,
        grade,
        uid: Utils.randomUUID(),
    };
}

/**
 * 返回背包是否已满
 * @param toast 
 * @returns 
 */
export function isBackpackFull(toast = true): boolean {
    let isFull = getEquipmentCount() >= MaxBackpackCount;
    if (isFull && toast) {
        Toast.show('背包已满, 请先整理背包!');
    }
    return isFull;
}

/**
 * 看视频广告
 * @param call 
 * @returns
 */
let _lookAdTime: number;
export function lookAdVideo(call: TShareCallback): boolean {
    if (!!_lookAdTime) {
        let now = Date.now();
        if (now - _lookAdTime < 3000) {
            return false;
        }
        _lookAdTime = null;
    }
    let finish = (err: string) => {
        if (!err) {
            addAchievementCount('lookAdVideo');
        }
        call && call(err);
    };
    if (Core.userInfo.vip) {
        setTimeout(() => {
            finish(null);
        }, 1);
    }
    else {
        _lookAdTime = Date.now();
        let audio = AudioMgr.background.audio;
        let isPlaying = audio.playing;
        isPlaying && audio.pause();
        PlatformMgr.instance.showVideoAd(err => {
            _lookAdTime = null;
            isPlaying && audio.play();
            finish(err);
        });
    }
    return true;
}

/**
 * 添加经验
 * @param exp 
 */
export function addExp(exp: number) {
    if (exp === 0) return;
    if (Core.userInfo.level >= PlayerMaxLevel) return;
    let newExp = exp + Core.userInfo.exp;
    let addLevel = 0;
    while (1) {
        let upExp = getUpExp();
        if (newExp >= upExp) {
            addLevel++;
            newExp = newExp - upExp;
        }
        else {
            break;
        }
    }
    //升级弹框
    if (addLevel > 0) {
        let newLevel = Math.min(PlayerMaxLevel, Core.userInfo.level + addLevel);
        Core.userInfo.level = newLevel;
        setTimeout(() => {
            NotifiDialog.show(`恭喜你，等级提升到${Core.userInfo.level}级!`)
        }, 500);
    }
    if (Core.userInfo.level >= PlayerMaxLevel) {
        newExp = 0;
    }
    Core.userInfo.exp = newExp;
}

/**
 * 获取升级所需经验
 * @returns 
 */
export function getUpExp() {
    let upExp = HeroProperty.exp * Core.userInfo.level;
    return upExp;
}

/**
 * 获取挂机奖励（金币，经验，材料）
 * @param fast 
 * @param seconds 
 * @returns 
 */
export function getOfflineReward(seconds: number): IRewardData {
    let maxExp = getUpExp() * 0.6;
    maxExp *= 1 - Math.ceil(Core.userInfo.level / 5) / 10;
    let hours = seconds / 60 / 60;
    let progress = clamp01(hours / 12);
    return {
        gold: Math.floor(15000 * progress),
        exp: Math.floor(maxExp * progress),
        chestCount: Math.min(12, Math.floor(hours)),
    };
}

/**
 * 获取游戏闯关奖励
 * @param progress 
 * @returns 
 */
export function getGamingReward(progress: number): IRewardData {
    if (progress < 1) {
        progress /= 2;
    }
    let equipmentCount = Math.floor(progress * 10);
    equipmentCount = Math.max(1, equipmentCount);
    let lowReward = progress < 1;
    let equipments: IUserEquipmentData[] = [];
    for (let i = 0; i < equipmentCount; i++) {
        equipments.push(createEquipment(getRandomEquipmentId(), getRandomGrade(lowReward)));
    }
    let maxExp = getUpExp() * 0.7;
    maxExp *= 1 - Math.ceil(Core.userInfo.level / 5) / 10;
    return {
        gold: Math.floor(5000 * progress),
        exp: Math.floor(maxExp * progress),
        equipments
    };
}

/**
 * 获取基础的伤害和血量
 * @param bonus 是否计算加成
 */
export function getGamingHeroInfo(needBonus = false): IGamingHeroInfo {
    let level = Core.userInfo.level;
    let result: IGamingHeroInfo = {
        Hp: HeroProperty.Hp + HeroProperty.HpIncrease * level,
        Damage: HeroProperty.Damage + HeroProperty.DamageIncrease * level,
        AtkSpeed: HeroProperty.AtkSpeed,
        HpBonus: HeroProperty.HpBonus,
        DamageBonus: HeroProperty.DamageBonus,
        AtkSpeedBonus: HeroProperty.AtkSpeedBonus,
        CrtChance: HeroProperty.CrtChance,
        CrtDamageBonus: HeroProperty.CrtDamageBonus,
        AddDamageBonus: HeroProperty.AddDamageBonus,
    }
    let bounsStr = '';
    let setSkill: string;

    let keys = Object.keys(Core.userInfo.equipped);
    for (const key of keys) {
        let uid = Core.userInfo.equipped[key];
        if (!!uid) {
            let item = Core.userInfo.equipments.find(v => v.uid === uid);
            let config = EquipmentConfig.where('id', item.id);
            let heroPropertyType = getHeroPropertyTypeByEquipmentType(config.type);
            let propertyValue = getHeroPropertyValueByEquipment(heroPropertyType, item.grade, item.star, item.level);
            result[heroPropertyType] += propertyValue;
            if (needBonus) {
                for (let i = 0; i < item.star; i++) {
                    let starSkill = config[`starSkill${i + 1}`];
                    bounsStr += starSkill + ',';
                }
                if (!setSkill) {
                    setSkill = config.setSkill;
                }
            }
        }
    }
    if (needBonus) {
        let equipmentSetActive = getEquipmentSetEquippedCount(null) === EquipmentTypes.length;
        if (equipmentSetActive) {
            bounsStr += setSkill;
        }
        for (let i = 0; i < HeroPropertyDescEnums.length; i++) {
            const propertyDesc = HeroPropertyDescEnums[i];
            const propertyEnum = HeroPropertyEnums[i];
            const regex = new RegExp(propertyDesc + '\\+(\\d+)%', 'g');
            let match: RegExpExecArray;
            while ((match = regex.exec(bounsStr)) !== null) {
                let value = parseInt(match[1], 10);
                result[propertyEnum] += value;
            }
        }
    }
    return result;
}

/**
 * 打开宝箱奖励
 * @param count 
 */
export function openChest(count: number, achievement = true) {
    let datas: IUserEquipmentData[] = [];
    for (let i = 0; i < count; i++) {
        datas.push(createEquipment(getRandomEquipmentId(), getRandomGrade()));
    }
    addEquipmentByDatas(datas);
    sortEquipments(datas);
    achievement && addAchievementCount('buyChestInShop', datas.length);
    return datas;
}

export const starEqualLevel = 5;