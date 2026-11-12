import { _decorator, BoxCollider2D, isValid, RigidBody2D, tween, v2, v3 } from 'cc';
import { Controller } from 'db://assets/script/dlspace/components/Controller';
import { Core } from '../../global/Core';
import { GameState } from '../../global/IGame';
import { BottomContainer } from '../BottomContainer';
const { ccclass, property } = _decorator;

@ccclass('BottomBulletUnit')
export class BottomBulletUnit extends Controller {

    @property(BoxCollider2D)
    collider: BoxCollider2D;

    @property(RigidBody2D)
    rigidBody: RigidBody2D;

    blockUids: Set<number> = new Set();

    private _bottom: BottomContainer;
    private _sleep: boolean;
    private _destroyCall: () => void;

    init(bottom: BottomContainer, destroyCall: () => void) {
        this.blockUids.clear();
        this._bottom = bottom;
        this._sleep = false;
        this._destroyCall = destroyCall;
        this.node.setScale(1, 1, 1);
        this.rigidBody.applyLinearImpulseToCenter(v2(0, 5), true);
    }

    remove() {
        if (isValid(this.node, true)) {
            this._destroyCall && this._destroyCall();
            this.node.destroy();
        }
    }

    protected update(dt: number): void {
        if (Core.game.state !== GameState.Gaming) return;

        if (!this._sleep) {
            let ventBox = this._bottom.ventRect;
            let r = this.node.uiTransfrom.getBoundingBox();
            if (r.intersects(ventBox)) {
                this.rigidBody.sleep();
                this._sleep = true;

                let weaponPos = this._bottom.ventToNode.worldPosition;
                tween(this.node).to(0.2, { worldPosition: v3(weaponPos), scale: v3(0.1, 0.1) }).call(() => {
                    this._bottom.root.fight.heroController.addBulletCount();
                    this.remove();
                }).start();
            }
            if (this.node.position.y > 330) {
                this.rigidBody.applyForceToCenter(v2(-10, 0), true);
            }
            else if (this.node.position.y > 280) {
                if (this.node.position.x > 45) {
                    this.rigidBody.applyForceToCenter(v2(-5, 10), true);
                }
                else if (this.node.position.x < -45) {
                    this.rigidBody.applyForceToCenter(v2(5, 10), true);
                }
                else {
                    this.rigidBody.applyForceToCenter(v2(0, 10), true);
                }
            }
        }
    }

}


