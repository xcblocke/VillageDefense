import { Mode } from "fs";
import { readFile, utils } from "xlsx";

type WorksheetType = 'Object' | 'Array';
type Model = { [key: string]: any };

export interface IWorkbook {
    path: string;
    sheets: IWorksheet[];
}

export interface IWorksheet {
    sheetName: string;
    sheetType: WorksheetType;
    sheetDesc: string;

    props: IClassProp[];
    datas: Model[];
}

export interface IClassProp {
    name: string;
    type: string;
    desc: string;
}

export const parseExcel = function (path: string): IWorkbook {
    let workbook = readFile(path);

    let outSheets: IWorksheet[] = [];
    for (const sheetName of workbook.SheetNames) {
        let worksheet = workbook.Sheets[sheetName];
        let sheetData = utils.sheet_to_json<Mode>(worksheet, { header: 'A' })
        let sheetType = sheetData[0]['A'] as WorksheetType;
        let sheetDesc = sheetData[0]['B'];
        let props: IClassProp[] = [];
        let datas: Model[] = [];

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
                })
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
    let out: IWorkbook = {
        path,
        sheets: outSheets,
    }
    return out;
}

const handleValue = function (type: string, value: any) {
    if (type === 'number[]' ||
        type === 'string[]' ||
        type === 'number[][]' ||
        type === 'string[][]') {
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    return value;
}

const sortKeys = function (keys: string[]) {
    keys.sort((a, b) => {
        if (a.length === b.length) return a < b ? -1 : 1;
        return a.length - b.length;
    });
}