"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExcel = void 0;
const xlsx_1 = require("xlsx");
const parseExcel = function (path) {
    let workbook = (0, xlsx_1.readFile)(path);
    let outSheets = [];
    for (const sheetName of workbook.SheetNames) {
        let worksheet = workbook.Sheets[sheetName];
        let sheetData = xlsx_1.utils.sheet_to_json(worksheet, { header: 'A' });
        let sheetType = sheetData[0]['A'];
        let sheetDesc = sheetData[0]['B'];
        let props = [];
        let datas = [];
        if (sheetType === 'Array') {
            let keys = Object.keys(sheetData[2]);
            sortKeys(keys);
            for (const key of keys) {
                props.push({
                    name: sheetData[2][key],
                    type: sheetData[3][key],
                    desc: sheetData[1][key],
                });
            }
            for (let i = 4; i < sheetData.length; i++) {
                const cellData = sheetData[i];
                let newData = {};
                for (const key of keys) {
                    let propName = sheetData[2][key];
                    let propType = sheetData[3][key];
                    let propValue = cellData[key];
                    newData[propName] = handleValue(propType, propValue);
                }
                datas.push(newData);
            }
        }
        else if (sheetType === 'Object') {
            let newData = {};
            for (let i = 1; i < sheetData.length; i++) {
                const cellData = sheetData[i];
                props.push({
                    name: cellData['B'],
                    type: cellData['C'],
                    desc: cellData['A'],
                });
                newData[cellData['B']] = cellData['D'];
            }
            datas.push(newData);
        }
        else {
            continue;
        }
        outSheets.push({
            sheetName,
            sheetType,
            sheetDesc,
            props,
            datas,
        });
    }
    let out = {
        path,
        sheets: outSheets,
    };
    return out;
};
exports.parseExcel = parseExcel;
const handleValue = function (type, value) {
    if (type === 'number[]' ||
        type === 'string[]' ||
        type === 'number[][]' ||
        type === 'string[][]') {
        try {
            return JSON.parse(value);
        }
        catch (_a) {
            return value;
        }
    }
    return value;
};
const sortKeys = function (keys) {
    keys.sort((a, b) => {
        if (a.length === b.length)
            return a < b ? -1 : 1;
        return a.length - b.length;
    });
};
