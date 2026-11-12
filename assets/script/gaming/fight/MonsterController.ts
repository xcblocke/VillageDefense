import { _decorator, AudioClip, Node, Prefab } from 'cc';
import { NodePoolMgr } from 'db://assets/script/dlspace/common/NodePoolMgr';
import { Controller } from 'db://assets/script/dlspace/components/Controller';
import { FightContainer } from 'db://assets/script/gaming/FightContainer';
import { Bundle } from 'db://assets/script/global/Bundle';
import { AudioMgr } from '../../dlspace/common/AudioMgr';
import { Core } from '../../global/Core';
import { GameState } from '../../global/IGame';
import { NotifiDialog } from '../../prefab/ui/NotifiDialog';
import { MonsterUnit } from './MonsterUnit';
const { ccclass, property } = _decorator;

export interface ISummonMonsterData {
    time: number;
    isBoss?: boolean;
    tip?: string;
}

@ccclass('MonsterController')
export class MonsterController extends Controller {

    @property(Node)
    shadows: Node;

    private _fight: FightContainer;

    private _time = 0;

    private _summonDatas: ISummonMonsterData[][] = [];
    private _waveCount: number;
    private _currentWave: number;

    private _monsters: MonsterUnit[] = [];
    private _monsterMap: Map<number, MonsterUnit> = new Map();
    private _monsterNodes: Set<Node> = new Set();

    init(fight: FightContainer) {
        this._fight = fight;

        this._summonDatas.length = 0;

        let passLevel = Core.game.info.level;
        let waveCount = Math.min(21, Math.ceil(passLevel / 2) * 3);
        let subWaveInterval = Math.min(0.4, 0.2 + 0.1 * passLevel);
        this._waveCount = waveCount;
        this._currentWave = 0;

        let waveSummonCount = Core.game.info.monsterInfo.Count;
        let waveInterval = 0.9;
        for (let i = 0; i < waveCount; i++) {
            let summonCount = waveSummonCount * i + 10;
            let isLastWave = i === (waveCount - 1);
            waveInterval = Math.max(waveInterval - subWaveInterval, 0.1);

            let datas: ISummonMonsterData[] = [];

            let time = i === 0 ? 2 : 1;
            let tip = isLastWave ? '最后一波怪物来袭!' : `第${i + 1}波怪物来袭!`;
            datas.push({ time, tip });

            for (let j = 0; j < summonCount; j++) {
                time += waveInterval;
                datas.push({ time });
            }
            let showBoss = i % 3 === 2;
            if (showBoss) {
                time += 2;
                datas.push({ time, isBoss: true });
            }
            this._summonDatas.push(datas);
        }

        this._reloadWaveNumLabel();
    }

    getMonsters() {
        return this._monsters;
    }

    getMonster(uid: number): MonsterUnit | null {
        return this._monsterMap.get(uid);
    }

    protected update(dt: number): void {
        if (Core.game.state !== GameState.Gaming) return;

        this._time += dt;
        const datas = this._summonDatas[this._currentWave];
        if (!!datas) {
            if (datas.length > 0) {
                let data = datas[0];
                if (this._time >= data.time) {
                    if (data.tip !== undefined) {
                        NotifiDialog.show(data.tip);
                        AudioMgr.inst.playOneShot(Bundle.audio.get('monster-wave', AudioClip), 0.1);
                        this._reloadWaveNumLabel();
                    }
                    else {
                        this._createMonster(data);
                    }
                    datas.splice(0, 1);
                }
            }
            else {
                if (this._monsterNodes.size === 0) {
                    Core.game.info.progress = (this._currentWave + 1) / this._waveCount;
                    if (this._currentWave === (this._waveCount - 1)) {
                        Core.game.state = GameState.Ended;
                    }
                    else {
                        this._currentWave++;
                        this._time = 0;
                    }
                }
            }
        }
    }

    private _reloadWaveNumLabel() {
        this._fight.root.waveNumLabel.string = `${this._currentWave + 1}/${this._waveCount}`;
    }

    private _createMonster(data: ISummonMonsterData) {
        let prefabPath = data.isBoss ? 'boss' : 'monster';
        let prefab = Bundle.game.get(`prefab/gaming/${prefabPath}`, Prefab);
        let child = NodePoolMgr.get(prefab);
        child.parent = this.node;

        let contentHeight = this.node.uiTransfrom.height;
        if (data.isBoss) {
            child.setPosition(0, 0);
        }
        else {
            child.setPosition(0, Math.randomFloat(-contentHeight / 2, contentHeight / 2));
        }

        child.uiTransfrom.priority = -child.position.y;

        let shadow = this._createShadow(data.isBoss);

        let comp = child.getComponent(MonsterUnit);
        comp.init(this._fight, this._currentWave, shadow, () => {
            this._monsters.delete(comp);
            this._monsterMap.delete(comp.uid);
        }, () => {
            this._monsterNodes.delete(child);
        });
        this._monsters.push(comp);
        this._monsterMap.set(comp.uid, comp);
        this._monsterNodes.add(child);
    }

    private _createShadow(isBoss: boolean) {
        let prefab = Bundle.game.get(`prefab/gaming/shadow`, Prefab);
        let child = NodePoolMgr.get(prefab);
        child.parent = this.shadows;
        let scale = isBoss ? 1.5 : 1;
        child.setScale(scale, scale);
        return child;
    }

}


