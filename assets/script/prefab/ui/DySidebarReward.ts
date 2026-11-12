import { _decorator, Label, Prefab } from 'cc';
import { BYTEDANCE } from 'cc/env';
import { Core } from 'db://assets/script/global/Core';
import { DialogController } from '../../dlspace/components/DialogController';
import { Bundle } from '../../global/Bundle';
import { AppName } from '../../global/IConfig';
const { ccclass, property } = _decorator;

@ccclass('DySidebarReward')
export class DySidebarReward extends DialogController {

    @property(Label)
    confirmLabel: Label = null

    @property(Label)
    appNameLabel: Label = null;

    private _isFromSidebar = false //状态，表示是否从侧边栏进入
    private _tt: any = null;

    private _call: () => void;

    static getVisible(visibleCall: () => void) {
        if (!BYTEDANCE || !Core.userInfo.day.dyRewardEnable) {
            return;
        }
        //判断用户是否支持侧边栏进入功能，有些旧版的抖音没有侧边栏，有的话显示入口有礼入口
        window['tt']?.checkScene({
            scene: "sidebar",
            success: (res: any) => {
                visibleCall && visibleCall()
            },
            fail: (res: any) => {
            }
        });
    }

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/dySidebarReward", Prefab);
    }

    onConfirm() {
        if (this._isFromSidebar) {
            this._getAward();
        }
        else {
            this._toSidebar();
        }
    }

    protected _open(...args: any[]) {
        let [call] = args;
        this._call = call;

        // this.confirmLabel.string = '立即领奖'
        // this._isFromSidebar = true
        // return

        this.appNameLabel.string = `「${AppName}」`;

        this._tt = window['tt'];
        this._tt?.onShow((res: any) => {
            //判断用户是否是从侧边栏进来的
            //如果是从侧边栏进来的，立即领奖,否则 去首页侧边栏（未完成）
            this._isFromSidebar = (res.launch_from == 'homepage' && res.location == 'sidebar_card')
            this.confirmLabel.string = this._isFromSidebar ? '立即领奖' : '去首页侧边栏'
        });

    }

    //去侧边栏按钮的逻辑
    private _toSidebar() {
        this._tt?.navigateToScene({
            scene: "sidebar",
            success: (res: any) => {
                console.log("navigate to scene success");
            },
            fail: (res: any) => {
                console.log("navigate to scene fail: ", res);
                alert('跳转失败，请稍后再试！')
            },
        });
    }

    //领取奖励的逻辑，自己实现
    private _getAward() {
        //获取奖励的逻辑（记得控制领取次数，比如每天一次，因为侧边栏是可以无限进入的）
        Core.userInfo.day.dyRewardEnable = false;
        this._call && this._call();
        this.close();
    }

}

