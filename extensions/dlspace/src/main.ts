import { ExportConfig } from "./ExportConfig";
import { ExtractText } from "./ExtractText";

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    exportConfig: function () {
        new ExportConfig().start();
    },
    extractText: function () {
        new ExtractText().start();
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
    console.log("扩展加载完成");
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {
    console.log("扩展卸载完成");
}
