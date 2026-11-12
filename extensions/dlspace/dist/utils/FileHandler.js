"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFileHandler = exports.FileHandler = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class FileHandler {
    async start(rootDir, call) {
        this._call = call;
        await this._handle(rootDir, true);
    }
    async _handle(handlePath, isRoot = false) {
        if (!(0, fs_1.existsSync)(handlePath)) {
            isRoot && console.log(`${handlePath} 目录不存在`);
            return;
        }
        let stat = (0, fs_1.lstatSync)(handlePath);
        if (stat.isFile()) {
            await this._handleFile(handlePath);
        }
        else if (stat.isDirectory()) {
            await this._handleDir(handlePath);
        }
    }
    async _handleDir(dirPath) {
        let dir = (0, fs_1.readdirSync)(dirPath);
        for (const fileName of dir) {
            let filePath = path_1.default.resolve(dirPath, fileName);
            await this._handle(filePath);
        }
    }
    async _handleFile(filePath) {
        const ext = path_1.default.extname(filePath);
        const name = path_1.default.basename(filePath, ext);
        this._call && await this._call(filePath, name, ext);
    }
}
exports.FileHandler = FileHandler;
const startFileHandler = async (rootDir, call) => {
    await new FileHandler().start(rootDir, call);
};
exports.startFileHandler = startFileHandler;
