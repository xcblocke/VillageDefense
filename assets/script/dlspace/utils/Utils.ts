import { Camera, Rect, size, sys, v2, v3, Vec3, view } from "cc";
import { EDITOR } from "cc/env";
import { getServerTimestamp } from "./ServerUtils";

export class Utils {

    /**
     * 获取相机渲染大小
     * @param camera 
     * @returns 
     */
    static getCameraSize(camera: Camera) {
        const visibleSize = view.getVisibleSize();
        const scale = visibleSize.height / camera.orthoHeight / 2;
        const cameraSize = size(visibleSize.width / scale, visibleSize.height / scale);
        return cameraSize;
    }

    /**
     * 剩余多少秒 格式化
     * @param time 
     * @param fmt 
     * @param fill 
     * @returns 
     */
    static formatTime(time: number, fmt: string = "hh:mm:ss", fill: boolean = true) {
        let t = Math.floor(Math.max(0, time));
        let ret = fmt
        let idx = ret.indexOf("dd")
        if (idx >= 0) {
            let d = Math.floor(t / 3600 / 24)
            ret = ret.replace("dd", d > 9 ? "" + d : (fill ? "0" : "") + d)
            t -= d * 3600 * 24
        }
        idx = ret.indexOf("hh")
        if (idx >= 0) {
            let h = Math.floor(t / 3600)
            ret = ret.replace("hh", h > 9 ? "" + h : (fill ? "0" : "") + h)
            t -= h * 3600
        }
        idx = ret.indexOf("mm")
        if (idx >= 0) {
            let m = Math.floor(t / 60)
            ret = ret.replace("mm", m > 9 ? "" + m : (fill ? "0" : "") + m)
            t -= m * 60
        }
        idx = ret.indexOf("ss")
        if (idx >= 0) {
            let s = t
            ret = ret.replace("ss", s > 9 ? "" + s : (fill ? "0" : "") + s)
        }
        return ret
    }

    static async awaitAfter(time: number) {
        return new Promise(resolve => {
            setTimeout(resolve, time * 1000);
        });
    }


    /**
     * 获取唯一的uuid
     * @returns 
     */
    static randomUUID(): string {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.floor(Math.random() * 100000).toString(36);
        return `${timestamp}${randomStr}`.toUpperCase();
    }

    /**
     * 将字符串转为hash数值
     * @param str 
     * @returns 
     */
    static hash(str: string): number {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    /**
     * 将字符串转为hash字符串（缩短字符串）
     * @param str 
     * @returns 
     */
    static hashStr(str: string): string {
        return this.hash(str).toString(36);
    }

    /**
     * 获取矩形内随机点
     * @param rect 
     */
    static getRectRandomPos(rect: Rect) {
        let pos = new Vec3();
        let randomX = rect.width * Math.random();
        let randomY = rect.height * Math.random();
        pos.x = rect.x + randomX;
        pos.y = rect.y + randomY;
        return pos;
    }

    /**
     * 获取圆内随机点
     * @param radius 
     */
    static getCircleRandomPos(radius: number) {
        let x = (Math.random() - 0.5) * 2 * radius;
        let y = (Math.random() - 0.5) * 2 * radius;
        return v2(x, y);
    }

    /**
     * 通过半径和角度获取坐标
     * @param radius 
     * @param angle 
     * @returns 
     */
    static getCirclePos(radius: number, angle: number) {
        let radians = (Math.PI / 180) * angle;
        let x = Math.cos(radians) * radius;
        let y = Math.sin(radians) * radius;
        return v3(x, y, 0);
    }

    /**
     * 获取是否是周六
     * @returns 
     */
    static isDay6() {
        const today = new Date(getServerTimestamp());
        const day = today.getDay();
        return day === 6;
    }

    /**
     * 获取安全区域
     * @returns 
     */
    static getSafeArea() {
        if (EDITOR) {
            return { top: 0, bottom: 0 };
        }
        const safeArea = sys.getSafeAreaRect();
        const screenHeight = view.getVisibleSize().height;
        return { top: screenHeight - safeArea.y - safeArea.height, bottom: safeArea.y };
    }

}