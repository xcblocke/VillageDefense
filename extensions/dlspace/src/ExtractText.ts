import { exec } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { readFile } from "xlsx";
import { startFileHandler } from "./utils/FileHandler";

export class ExtractText {

    private _allChar: Set<string> = new Set()

    async start() {
        let extractDir = path.resolve(Editor.Project.path, "assets");
        await startFileHandler(extractDir, (filePath, name, ext) => {
            this._handleFile(filePath)
        })

        let extractDir2 = path.resolve(Editor.Project.path, "config");
        await startFileHandler(extractDir2, (filePath, name, ext) => {
            this._handleFile(filePath)
        })

        let txt = Array.from(this._allChar).join("");

        let outPath = path.resolve(Editor.Project.path, "./extractText.txt");
        const header = Buffer.from([0xEF, 0xBB, 0xBF]);
        const body = Buffer.from(txt);
        writeFileSync(outPath, Buffer.concat([header, body]), 'utf8');
        console.log(`已导出到: ${outPath}`);
        exec(`notepad.exe ${outPath}`);
    }

    private _handleFile(filePath: string) {
        if (filePath.endsWith(".ts") || filePath.endsWith(".scene") || filePath.endsWith(".prefab")) {
            let txt = readFileSync(filePath, 'utf8');
            this._handleTxt(txt);
        }
        else if (filePath.endsWith(".xlsx") && !filePath.includes("~$")) {
            let txt = readXlsx(filePath);
            this._handleTxt(txt);
        }
    }

    private _handleTxt(txt: string) {
        if (!txt || txt.length === 0) {
            return;
        }
        let charSet = new Set(Array.from(txt));
        for (const char of charSet) {
            this._allChar.add(char);
        }
    }

}

let readXlsx = function (xlsxPath: string): string | null {
    let workbook = readFile(xlsxPath)
    let worksheets = Object.values(workbook.Sheets);
    let txt = ""
    for (const worksheet of worksheets) {
        let json = JSON.stringify(worksheet);
        txt += json;
    }
    return txt
}

