import { _decorator, assetManager, Component, SpriteFrame } from 'cc';
import { GIFController } from '../dlspace/components/GIFController';
const { ccclass, property } = _decorator;

const EmptyFakeStr = 'xx/xx/';

@ccclass('GIFAutoPlay')
export class GIFAutoPlay extends Component {

    @property
    bundleName = 'game';

    @property
    folderPath = EmptyFakeStr;

    @property
    frame = 15;

    protected start(): void {
        let gif = this.getComponent(GIFController);
        if (!gif) {
            return;
        }
        gif.frame = this.frame;

        let bundle = assetManager.getBundle(this.bundleName);
        bundle.loadDir(this.folderPath, SpriteFrame, (err, data) => {
            let sfs = [...data];
            sfs.sort((a, b) => a.name < b.name ? -1 : 1);
            gif.init([{
                animation: 'a',
                images: sfs
            }]);
            gif.play('a');
        });
    }

}


