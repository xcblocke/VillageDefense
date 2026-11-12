"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportConfig = void 0;
const path_1 = __importDefault(require("path"));
const FileHandler_1 = require("./utils/FileHandler");
const GenerateCode_1 = require("./utils/GenerateCode");
const ParseExcel_1 = require("./utils/ParseExcel");
class ExportConfig {
    async start() {
        await this._copyTemplates();
        await (0, FileHandler_1.startFileHandler)(path_1.default.resolve(Editor.Project.path, "config"), async (filePath, name, ext) => {
            await handleFile(filePath, name, ext);
        });
        console.log("所有表格导出成功");
    }
    async _copyTemplates() {
        let arrayConfigPath = path_1.default.resolve(__dirname, "../config/ArrayConfig");
        await Editor.Message.request('asset-db', 'import-asset', arrayConfigPath, 'db://assets/config/ArrayConfig.ts', { overwrite: true });
        let objectConfigPath = path_1.default.resolve(__dirname, "../config/ObjectConfig");
        await Editor.Message.request('asset-db', 'import-asset', objectConfigPath, 'db://assets/config/ObjectConfig.ts', { overwrite: true });
    }
}
exports.ExportConfig = ExportConfig;
let handleFile = async function (filePath, name, ext) {
    if (!(filePath.endsWith(".xlsx") && !filePath.startsWith("~$"))) {
        return;
    }
    let workbook = (0, ParseExcel_1.parseExcel)(filePath);
    for (const worksheet of workbook.sheets) {
        let code = await (0, GenerateCode_1.generateTypescriptCode)(worksheet);
        await Editor.Message.request('asset-db', 'create-asset', `db://assets/config/${worksheet.sheetName}.ts`, code, { overwrite: true });
        console.log(`${worksheet.sheetName} 导出成功`);
    }
};
