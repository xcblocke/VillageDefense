import { EDITOR } from "cc/env";
import { SaveProp } from "../dlspace/utils/SaveProp";
import { getServerTimestampLoaded } from "../dlspace/utils/ServerUtils";
import { Utils } from "../dlspace/utils/Utils";
import { AppName } from "./IConfig";
import { IGame } from "./IGame";
import { UserInfo } from "./UserInfo";

SaveProp.Name = Utils.hashStr(AppName);

export class Core {

    static userInfo = new UserInfo();

    static game: IGame;

}

export let MainInterval = null;
if (!EDITOR) {
    MainInterval = setInterval(() => {
        if (!getServerTimestampLoaded()) {
            return;
        }
        Core.userInfo.reloadHalfSecond();
    }, 500);
}