import { v3 } from "cc";
import { GIFController, IGIFData } from "../../dlspace/components/GIFController";
import { Bundle } from "../../global/Bundle";
import { Core } from "../../global/Core";

export const MonsterAnimations = ['Attacking', 'Dying', 'Idle', 'Walking'] as const;
export type MonsterAnimation = typeof MonsterAnimations[number];

export class MonsterData {
    static monsterGIFDatas: IGIFData[];
    static monsterOffset = v3();

    static bossGIFDatas: IGIFData[];
    static bossOffset = v3();

    static async loadRes(finish: () => void) {
        let info = this._getMonstersPath();

        this.monsterGIFDatas = await this._getMonsterGIFDatas(info.monster);
        this.bossGIFDatas = await this._getMonsterGIFDatas(info.boss);

        if (info.monster.endsWith('m1') || info.monster.endsWith('m2') || info.monster.endsWith('m3')) {
            this.monsterOffset.set(-6, 0, 0);
        }
        else {
            this.monsterOffset.set(0, 0, 0);
        }
        this.bossOffset.set(0, 0, 0);

        finish && finish();
    }

    private static _getMonstersPath() {
        let level = Core.userInfo.passLevel - 1;
        return {
            monster: `monster/m${level % 6 + 1}/`,
            boss: `boss/b${level % 3 + 1}/`
        }
    }

    private static async _getMonsterGIFDatas(path: string) {
        let datas: IGIFData[] = [];
        for (const animation of MonsterAnimations) {
            let animPath = `${path}${animation}/`;
            let data = await GIFController.getGIFData(Bundle.monster, animPath, animation);
            datas.push(data);
        }
        return datas;
    }

}