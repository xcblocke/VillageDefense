export const replaceFromParams = function (content: string, params: { [key: string]: any }) {
    let result = content;
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