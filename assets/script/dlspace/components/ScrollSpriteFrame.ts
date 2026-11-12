import { _decorator, Enum, rect, Sprite, SpriteFrame, Texture2D } from 'cc';
import { Controller } from './Controller';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('ScrollSpriteFrame')
@requireComponent(Sprite)
export class ScrollSpriteFrame extends Controller {

    @property
    moveSpeedX = 0;

    @property
    moveSpeedY = 0;

    @property({ type: Enum(Texture2D.WrapMode) })
    wrapMode = Texture2D.WrapMode.REPEAT;

    private _sprite: Sprite;
    private _rect = rect();

    getRect() {
        return this._rect;
    }

    onLoad() {
        this._sprite = this.getComponent(Sprite);
        let oldSpriteFrame = this._sprite.spriteFrame;
        let newSpriteFrame = new SpriteFrame();
        newSpriteFrame.packable = false;
        newSpriteFrame.texture = oldSpriteFrame.texture;
        newSpriteFrame.texture.setWrapMode(this.wrapMode, this.wrapMode);
        this._sprite.spriteFrame = newSpriteFrame;

        this._rect.set(this._sprite.spriteFrame.rect);
    }

    update(dt: number) {
        this._rect.x += this.moveSpeedX * dt;
        this._rect.y += this.moveSpeedY * dt;

        this._sprite.spriteFrame.rect = this._rect;
        this._sprite.markForUpdateRenderData();
    }

}