

interface String {
    /**
     * 替换字符串
     * @param params 
     */
    replaceFromParams(params: { [key: string]: any }): string;

    /**
     * 提取整数
     * @param text 
     */
    extractIntegers(): number[];
}

String.prototype.replaceFromParams = function (params: { [key: string]: any }) {
    let result = this as string;
    let list = result.match(/\${[a-zA-Z0-9_.]+}/g);
    if (list) {
        for (let i = 0; i < list.length; i++) {
            let m = list[i];
            let k = m.replace(/\$|{|}/g, '');
            result = result.replace(m, String(params[k]));
        }
    }
    return result;
}

String.prototype.extractIntegers = function (): number[] {
    let self = this as string;
    const regex = /[+-]?\d+/g;
    const matches = self.match(regex);
    return matches ? matches.map(Number) : [];
}
