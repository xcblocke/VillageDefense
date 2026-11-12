export abstract class ArrayConfig<T> {

    configs: T[];

    private _cache: Map<string, T> = new Map();

    constructor(json: string) {
        this.configs = JSON.parse(decodeURIComponent(json));
    }

    where<P extends keyof T>(propName: P, propValue: any): T | undefined {
        let key = `${String(propName)}=${String(propValue)}`;
        let value = this._cache.get(key);
        if (!value) {
            value = this.configs.find(v => v[propName] === propValue);
            if (!!value) {
                this._cache.set(key, value);
            }
        }
        if (!value) {
            debugger;
        }
        return value;
    }

}


