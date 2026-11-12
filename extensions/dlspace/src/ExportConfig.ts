import path from "path";
import { startFileHandler } from "./utils/FileHandler";
import { generateTypescriptCode } from "./utils/GenerateCode";
import { parseExcel } from "./utils/ParseExcel";

export class ExportConfig {
    async start() {
        await this._copyTemplates();
        await startFileHandler(path.resolve(Editor.Project.path, "config"), async (filePath, name, ext) => {
            await handleFile(filePath, name, ext);
        });
        console.log("所有表格导出成功");
    }

    private async _copyTemplates() {
        let arrayConfigPath = path.resolve(__dirname, "../config/ArrayConfig");
        await Editor.Message.request('asset-db', 'import-asset', arrayConfigPath, 'db://assets/config/ArrayConfig.ts', { overwrite: true });

        let objectConfigPath = path.resolve(__dirname, "../config/ObjectConfig");
        await Editor.Message.request('asset-db', 'import-asset', objectConfigPath, 'db://assets/config/ObjectConfig.ts', { overwrite: true });
    }

}

let handleFile = async function (filePath: string, name: string, ext: string) {
    if (!(filePath.endsWith(".xlsx") && !filePath.startsWith("~$"))) {
        return;
    }
    let workbook = parseExcel(filePath);
    for (const worksheet of workbook.sheets) {
        let code = await generateTypescriptCode(worksheet);
        await Editor.Message.request('asset-db', 'create-asset', `db://assets/config/${worksheet.sheetName}.ts`, code, { overwrite: true });

        console.log(`${worksheet.sheetName} 导出成功`);
    }

}
