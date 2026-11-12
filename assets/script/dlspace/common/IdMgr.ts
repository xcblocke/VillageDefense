export class IdMgr {
    private static _map: Map<any, number> = new Map();
    static getId(key: any = ''): number {
        let id = this._map.get(key) ?? 0;
        id++;
        this._map.set(key, id);
        return id;
    }

    static clear() {
        this._map.clear();
    }
}