import { _decorator, director, Prefab } from 'cc';
import { BYTEDANCE, HTML5, WECHAT } from 'cc/env';
import { DialogController } from '../../dlspace/components/DialogController';
import { TimerSystem } from '../../dlspace/libs/timerSystem/TimerSystem';
import { Bundle } from '../../global/Bundle';
import { Core, MainInterval } from '../../global/Core';
import { MessageDialog } from './MessageDialog';
import { RedeemCodeDialog } from './RedeemCodeDialog';
import { Toast } from './Toast';
const { ccclass, property } = _decorator;

@ccclass('SettingDialog')
export class SettingDialog extends DialogController {

    protected static _getPrefab(): Prefab {
        return Bundle.game.get("prefab/ui/settingDialog", Prefab);
    }

    onClickPlayerID() {
        let userID = Core.userInfo.userID;
        MessageDialog.show('玩家ID', userID, '复制', () => {
            if (WECHAT) {
                window['wx'].setClipboardData({ data: userID });
            }
            else if (BYTEDANCE) {
                window['tt'].setClipboardData({ data: userID });
            }
            else if (HTML5) {
                navigator.clipboard.writeText(userID);
            }
            else {
                Toast.show('平台暂不支持!');
                return;
            }
            Toast.show('复制成功!');
        });
        this.close();
    }

    onClickRedeemCode() {
        RedeemCodeDialog.show();
        this.close();
    }

    onClickReset() {
        //dl
        director.unregisterSystem(TimerSystem.instance);
        clearInterval(MainInterval);
        localStorage.clear();
        if (HTML5) {
            location.reload();
        }
        else if (BYTEDANCE) {
            window['tt'].restartMiniProgramSync();
        }
    }

}


