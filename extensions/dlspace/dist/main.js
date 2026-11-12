"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const ExportConfig_1 = require("./ExportConfig");
const ExtractText_1 = require("./ExtractText");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    exportConfig: function () {
        new ExportConfig_1.ExportConfig().start();
    },
    extractText: function () {
        new ExtractText_1.ExtractText().start();
    }
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
    console.log("扩展加载完成");
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() {
    console.log("扩展卸载完成");
}
exports.unload = unload;
