"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceFromParams = void 0;
const replaceFromParams = function (content, params) {
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
};
exports.replaceFromParams = replaceFromParams;
