import { _decorator, AudioClip, Button, Font, game, Label, lerp, Node, Prefab } from 'cc';
import { RunScene } from '../controller/RunScene';
import { AudioMgr } from '../dlspace/common/AudioMgr';
import { LoadMgr } from '../dlspace/common/LoadMgr';
import { Controller } from '../dlspace/components/Controller';
import { PlatformMgr } from '../dlspace/libs/platform/PlatformMgr';
import { TimerSystem } from '../dlspace/libs/timerSystem/TimerSystem';
import { Bundle } from '../global/Bundle';
import { AppShareText, PlatformInfo } from '../global/IConfig';
import { SceneName } from '../global/IGame';
import { TimerInfo } from '../global/TimerInfo';
const { ccclass, property } = _decorator;

@ccclass('LoadScene')
export class LoadScene extends Controller {

    @property(Node)
    progressBar: Node;

    protected _targetProgress: number = 0;
    protected _progress: number = 0;

    protected onLoad(): void {
        //计算
        // let totalGold = 0;
        // let totalComposite = 0;
        // for (let s = 0; s <= 5; s++) {
        //     let upgradeGold = 0;
        //     let upgradeComposite = 0;
        //     for (let i = 0; i < 30; i++) {
        //         upgradeGold += getUpgradeNeedGold(i + 1, s);
        //         upgradeComposite += getUpgradeNeedComposite(i + 1, s);
        //     }
        //     console.log(s + '星的1到30级总金币：', upgradeGold, '总复合：', upgradeComposite);

        //     totalGold += upgradeGold;
        //     totalComposite += upgradeComposite;
        // }
        // console.log('满星满级：总金币：', totalGold, '总复合：', totalComposite);
        // console.log(getRandomGradeWeights());
        // console.log(getRandomGradeWeights(true));
        // console.log(Math.weightsToProbabilities(getRandomGradeWeights()));
        // console.log(Math.weightsToProbabilities(getRandomGradeWeights(true)));
        // let obj = {};
        // for (let i = 0; i < 10000; i++) {
        //     let n = getRandomGrade();
        //     obj[n] = (obj[n] || 0) + 1;
        // }
        // console.log(obj);

        // let obj2 = {};
        // for (let i = 0; i < 10000; i++) {
        //     let n = getRandomGrade(true);
        //     obj2[n] = (obj2[n] || 0) + 1;
        // }
        // console.log(obj2);
    }

    start() {
        game.frameRate = 50;
        TimerSystem.registerSystem([TimerInfo]);

        this._setProgressBar(0);
        this._toLoad();
    }

    private async _toLoad() {
        try {
            this._load();
        }
        catch {
            this.scheduleOnce(() => {
                console.log('加载失败重试');
                this._toLoad();
            }, 2);
        }
    }

    private async _load() {
        this._targetProgress = 0.1;

        Bundle.font = await LoadMgr.loadBundle('font');
        this._targetProgress = 0.5;

        Bundle.audio = await LoadMgr.loadBundle('audio');
        await LoadMgr.loadDir(Bundle.audio, '/', AudioClip);
        this._targetProgress = 0.6;

        Bundle.game = await LoadMgr.loadBundle('game');
        this._targetProgress = 0.7;

        Bundle.monster = await LoadMgr.loadBundle('monster');
        this._targetProgress = 0.8;

        await LoadMgr.loadDir(Bundle.game, 'prefab', Prefab);
        this._targetProgress = 0.9;

        await LoadMgr.loadScene('Lobby');
        await LoadMgr.loadScene('Game');
        this._targetProgress = 0.95;

        this._initPlatform();
        await this._privateFunc();
        this._targetProgress = 1;
    }

    private _initPlatform() {
        /**
         * PlatformMgr.instance为抖音和微信 分享、广告的控制器
         * 调用时控制器内部会自动区分平台处理
         * 尽量提前调用init函数来加载微信抖音的广告组件
         */
        PlatformMgr.instance.init({
            //微信激励视频id
            videoId_wx: PlatformInfo.videoId_wx,
            //微信插屏广告id
            interstitialId_wx: PlatformInfo.interstitialId_wx,
            //抖音激励视频id
            videoId_dy: PlatformInfo.videoId_dy,
            //抖音插屏广告id
            interstitialId_dy: PlatformInfo.interstitialId_dy,
        }, {
            //分享标题
            title: AppShareText,
        });

        //调用分享的函数
        // PlatformMgr.instance.showShare
        //调用插屏广告的函数
        // PlatformMgr.instance.showInterstitialAd
        //调用激励视频广告的函数
        // PlatformMgr.instance.showVideoAd
    }

    private _nextScene() {
        RunScene.show(SceneName.Lobby, true);
    }

    private _setProgressBar(v: number) {
        this.progressBar.uiTransfrom.width = lerp(50, 660, v);
    }

    private async _privateFunc() {
        let customFont = await LoadMgr.loadFile(Bundle.font, 'SweiHalfMoonCJKSC', Font);
        let clickAudio = Bundle.audio.get('click', AudioClip);

        let labelOnLoad = Label.prototype.onLoad;
        Label.prototype.onLoad = function (...args: any[]) {
            let self = this as Label;
            labelOnLoad.call(self, ...args);
            if (!!customFont) {
                self.useSystemFont = false;
                self.isBold = false;
                self.font = customFont;
            }
        }

        Button.prototype["onLoad"] = function (...args: any[]) {
            let self = this as Button;
            self.transition = Button.Transition.SCALE;
            self.zoomScale = 1.1;
        }

        let onTouchEnded = Button.prototype["_onTouchEnded"];
        Button.prototype["_onTouchEnded"] = function (...args: any[]) {
            let self = this as Button;
            onTouchEnded.call(self, ...args);
            let audio = self.getValue('ClickAudio', clickAudio);
            AudioMgr.inst.playOneShot(audio, 0.1);
        }

    }

    update(dt: number) {
        if (this._progress >= 0) {
            if (this._progress < this._targetProgress) {
                this._progress = Math.min(this._targetProgress, this._progress + 1 * dt);
                this._setProgressBar(this._progress);
            }
            else if (this._progress >= 1) {
                this._setProgressBar(1);
                this._progress = -1;

                this.scheduleOnce(() => {
                    this._nextScene();
                }, 0.5);
            }
        }
    }

}


