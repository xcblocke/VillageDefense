/**
 * 全局通知消息
 */

export type MsgCall = (...params: any[]) => void

export interface IMsgMgrCall {
    target: any;
    func: (...params: any[]) => void;
}

export class MsgMgr {

    private static _map: Map<string, IMsgMgrCall[]> = new Map()

    public static on(key: string, func: MsgCall, target: any): void {
        let calls = this._map.get(key)
        if (!calls) {
            calls = []
            this._map.set(key, calls)
        }
        calls.push({
            target,
            func
        })
    }

    public static off(key: string, func: MsgCall, target: any): void {
        let calls = this._map.get(key)
        if (calls) {
            let call = calls.find(c => c.target === target && c.func === func)
            call && calls.delete(call)
        }
    }

    public static emit(key: string, ...params: any[]): void {
        let calls = this._map.get(key)
        if (calls) {
            calls.forEach(c => c.func.call(c.target, ...params))
        }
    }

}
