"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractText = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const xlsx_1 = require("xlsx");
const FileHandler_1 = require("./utils/FileHandler");
class ExtractText {
    constructor() {
        this._allChar = new Set();
    }
    async start() {
        let extractDir = path_1.default.resolve(Editor.Project.path, "assets");
        await (0, FileHandler_1.startFileHandler)(extractDir, (filePath, name, ext) => {
            this._handleFile(filePath);
        });
        let extractDir2 = path_1.default.resolve(Editor.Project.path, "config");
        await (0, FileHandler_1.startFileHandler)(extractDir2, (filePath, name, ext) => {
            this._handleFile(filePath);
        });
        let txt = Array.from(this._allChar).join("");
        let outPath = path_1.default.resolve(Editor.Project.path, "./extractText.txt");
        const header = Buffer.from([0xEF, 0xBB, 0xBF]);
        const body = Buffer.from(txt);
        (0, fs_1.writeFileSync)(outPath, Buffer.concat([header, body]), 'utf8');
        console.log(`已导出到: ${outPath}`);
        (0, child_process_1.exec)(`notepad.exe ${outPath}`);
    }
    _handleFile(filePath) {
        if (filePath.endsWith(".ts") || filePath.endsWith(".scene") || filePath.endsWith(".prefab")) {
            let txt = (0, fs_1.readFileSync)(filePath, 'utf8');
            this._handleTxt(txt);
        }
        else if (filePath.endsWith(".xlsx") && !filePath.includes("~$")) {
            let txt = readXlsx(filePath);
            this._handleTxt(txt);
        }
    }
    _handleTxt(txt) {
        if (!txt || txt.length === 0) {
            return;
        }
        let charSet = new Set(Array.from(txt));
        for (const char of charSet) {
            this._allChar.add(char);
        }
    }
}
exports.ExtractText = ExtractText;
let readXlsx = function (xlsxPath) {
    let workbook = (0, xlsx_1.readFile)(xlsxPath);
    let worksheets = Object.values(workbook.Sheets);
    let txt = "";
    for (const worksheet of worksheets) {
        let json = JSON.stringify(worksheet);
        txt += json;
    }
    return txt;
};
