import { IPlatformHandle, IPlatformInfo, IShareInfo, TShareCallback, TVideoAdCallback } from "../platform/IPlatformMgr";

export class PlatformDY implements IPlatformHandle {

    private _videoId: string
    private _interstitialId: string
    private _shareInfo: IShareInfo;

    private _interstitialAd: any
    private _videoAd: any

    get app() {
        return window['tt']
    }

    init(platformInfo: IPlatformInfo, shareInfo?: IShareInfo) {
        this._videoId = platformInfo.videoId_dy
        this._interstitialId = platformInfo.interstitialId_dy
        this._shareInfo = shareInfo

        if (!!this._shareInfo) {
            this.app.showShareMenu()
            this.app.onShareAppMessage(() => {
                return {
                    title: this._shareInfo.title,
                }
            })
        }

        if (this._videoId) {
            this._videoAd = this.app.createRewardedVideoAd({
                adUnitId: this._videoId,
            })
            this._videoAd.onError((errMsg: string, errCode: number) => {
                console.log(errMsg)
            })
        }

    }

    showShare(call: TShareCallback): void {
        if (!!this._shareInfo) {
            this.app.shareAppMessage({
                title: this._shareInfo.title,
                success: () => {
                    call && call(null)
                },
                fail: () => {
                    call && call('分享失败')
                },
            })
        }
    }

    showInterstitialAd(): void {
        if (!!this._interstitialAd) {
            this._interstitialAd.destroy()
        }
        if (!this._interstitialId) {
            return
        }
        this._interstitialAd = this.app.createInterstitialAd({ adUnitId: this._interstitialId });
        this._interstitialAd.onLoad(() => {
            this._interstitialAd.show().then(() => {
                console.log("插屏广告展示成功");
            })
        })
    }

    showVideoAd(call: TVideoAdCallback): void {
        if (!this._videoAd) {
            call && call(null)
            return
        }
        let onClose = (data: any) => {
            this._videoAd.offClose(onClose)
            if (data && data.isEnded) {
                call && call(null);
            }
            else {
                call && call('未观看完整广告，不予奖励')
            }
        }
        this._videoAd.onClose(onClose)
        this._videoAd.show().catch((err) => {
            this._videoAd.load()
                .then(() => this._videoAd.show())
                .catch((err: any) => {
                    this._videoAd.offClose(onClose)
                    call && call('加载失败,请稍后再试')
                })
        });
    }

}