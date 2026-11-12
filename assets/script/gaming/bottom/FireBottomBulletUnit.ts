import { _decorator, clamp, EventTouch, instantiate, isValid, Node, Prefab, tween, v2, v3 } from 'cc';
import { Controller } from 'db://assets/script/dlspace/components/Controller';
import { Bundle } from '../../global/Bundle';
import { Core } from '../../global/Core';
import { GameState } from '../../global/IGame';
import { BottomContainer } from '../BottomContainer';
import { BottomBulletUnit } from './BottomBulletUnit';
const { ccclass, property } = _decorator;

const v2_1 = v2();

export const MaxBulletCount = 300;

@ccclass('FireBottomBulletUnit')
export class FireBottomBulletUnit extends Controller {

    @property(Node)
    fireNode: Node;

    private _bottom: BottomContainer;
    private _boxMinX = 0;
    private _boxMaxX = 0;

    private _time = 0;

    private _bullets: BottomBulletUnit[] = [];

    init(bottom: BottomContainer) {
        this._bottom = bottom;
        this._bottom.root.node.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
            if (!isValid(this.node, true)) {
                return;
            }
            let delta = event.getUIDelta(v2_1);
            let newPos = this.node.tempPosition.add3f(delta.x, 0, 0);
            newPos.x = clamp(newPos.x, this._boxMinX, this._boxMaxX);
            this.node.position = newPos;
        });
    }

    protected start(): void {
        let contentSize = this.node.uiTransfrom.contentSize;
        let parentSize = this.node.parent.uiTransfrom.contentSize;
        this._boxMinX = -parentSize.width / 2 + contentSize.width / 2;
        this._boxMaxX = parentSize.width / 2 - contentSize.width / 2;
    }

    getBullets() {
        return this._bullets;
    }

    createBullet(fromBullet: BottomBulletUnit = null) {
        let prefab = Bundle.game.get('prefab/gaming/bottom/bottom-bullet', Prefab);
        let child = instantiate(prefab);
        child.parent = this._bottom.bulletContainer;
        if (!!fromBullet) {
            child.worldPosition = fromBullet.node.tempWorldPosition.add3f(Math.randomFloat(-5, 5), Math.randomFloat(-5, 5), 0);
            child.angle = fromBullet.node.angle;
        }
        else {
            child.worldPosition = this.fireNode.worldPosition;
            child.angle = child.position.x < 0 ? -1 : 1;
        }

        let comp = child.getComponent(BottomBulletUnit);
        comp.init(this._bottom, () => {
            this._bullets.delete(comp);
        });
        if (!!fromBullet) {
            for (const uid of fromBullet.blockUids) {
                comp.blockUids.add(uid);
            }
        }
        this._bullets.push(comp);
    }

    update(dt: number) {
        if (Core.game.state !== GameState.Gaming) return;

        if (this._time >= 0) {
            if (this._time === 0) {
                if (this._bullets.length > MaxBulletCount) {
                    this._time = 0.1;
                    return;
                }
                this._time = -1;

                let speed = 1;
                speed *= 1 + Core.game.info.heroInfo.AtkSpeedBonus / 100;

                this.node.setScale(1, 1);
                tween(this.node).to(0.2 / speed, { scale: v3(0.97, 0.9) }).to(0.15 / speed, { scale: v3(1, 1) }).call(() => {
                    this.createBullet();
                    this._time = 0;
                }).start();
            }
            else {
                this._time = Math.max(0, this._time - dt);
            }
        }
    }

}


