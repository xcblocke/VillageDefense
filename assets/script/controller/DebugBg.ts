import { _decorator, Sprite } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('DebugBg')
@executeInEditMode(true)
export class DebugBg extends Sprite {
    onLoad(): void {
        super.onLoad();
        this.sizeMode = Sprite.SizeMode.CUSTOM;
        this.trim = false;
        if (!EDITOR) {
            this.enabled = false;
        }
    }
}


