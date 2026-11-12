import { ServerTimeUrl } from "../constant/Constant";
import { Http } from "../libs/http/Http";

class _ServerTimeUtils {

    loaded = false;
    private _serverTimeOffset = 0;
    private _debugTimeOffset = 0;

    constructor() {
        this._requestTime();
    }

    getServerTimestamp() {
        return new Date().getTime() + this._serverTimeOffset + this._debugTimeOffset;
    }

    private async _requestTime(count = 3) {
        if (count < 0) {
            this.loaded = true;
            return;
        }
        try {
            await this._syncServerTime();
        } catch (error) {
            this._requestTime(count - 1);
        }
    }

    private async _syncServerTime() {
        if (!!ServerTimeUrl) {
            let resp = await Http.get(ServerTimeUrl);
            this._serverTimeOffset = resp.serverTime - new Date().getTime();
        }
        this.loaded = true;
    }

}

const utils = new _ServerTimeUtils();
export function getServerTimestamp(): number {
    return utils.getServerTimestamp();
}

export function getServerTimestampLoaded() {
    return utils.loaded;
}