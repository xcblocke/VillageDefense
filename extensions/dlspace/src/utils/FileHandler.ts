import { existsSync, lstatSync, readdirSync } from "fs";
import path from "path";

type HandlerFileCall = (filePath: string, name: string, ext: string) => void;

export class FileHandler {

    private _call: HandlerFileCall;

    async start(rootDir: string, call: HandlerFileCall) {
        this._call = call;
        await this._handle(rootDir, true);
    }

    private async _handle(handlePath: string, isRoot = false) {
        if (!existsSync(handlePath)) {
            isRoot && console.log(`${handlePath} 目录不存在`);
            return;
        }
        let stat = lstatSync(handlePath);
        if (stat.isFile()) {
            await this._handleFile(handlePath);
        }
        else if (stat.isDirectory()) {
            await this._handleDir(handlePath);
        }
    }

    private async _handleDir(dirPath: string) {
        let dir = readdirSync(dirPath);
        for (const fileName of dir) {
            let filePath = path.resolve(dirPath, fileName);
            await this._handle(filePath);
        }
    }

    private async _handleFile(filePath: string) {
        const ext = path.extname(filePath);
        const name = path.basename(filePath, ext);
        this._call && await this._call(filePath, name, ext);
    }

}

export const startFileHandler = async (rootDir: string, call: HandlerFileCall) => {
    await new FileHandler().start(rootDir, call);
}