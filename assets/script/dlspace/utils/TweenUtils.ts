import { Node, tween, v3, Vec3 } from "cc";

export type TweenFadeInType = 'fromTop' | 'fromBottom' | 'fromBig' | 'fromSmall';

const v3_1 = v3();

export class TweenUtils {
    static fadeIn(node: Node, type: TweenFadeInType, call: () => void = null, duration = 0.5) {
        if (type === 'fromTop') {
            let startPos = node.getPosition().add3f(0, 100, 0);
            let endPos = node.getPosition();
            node.position = startPos;
            this.modifyOpacity(node, 0, 255, null, duration / 3);
            return tween(node).to(duration, { position: endPos }, { easing: 'backOut' }).call(call).start();
        }
        else if (type === 'fromBottom') {
            let startPos = node.getPosition().add3f(0, -100, 0);
            let endPos = node.getPosition();
            node.position = startPos;
            this.modifyOpacity(node, 0, 255, null, duration / 3);
            return tween(node).to(duration, { position: endPos }, { easing: 'backOut' }).call(call).start();
        }
        else if (type === 'fromBig') {
            let startScale = node.getScale().multiplyScalar(1.5);
            let endScale = node.getScale();
            node.scale = startScale;
            this.modifyOpacity(node, 0, 255, null, duration / 3);
            return tween(node).to(duration, { scale: endScale }, { easing: 'backOut' }).call(call).start();
        }
        else if (type === 'fromSmall') {
            let startScale = node.getScale().multiplyScalar(0.5);
            let endScale = node.getScale();
            node.scale = startScale;
            this.modifyOpacity(node, 0, 255, null, duration / 3);
            return tween(node).to(duration, { scale: endScale }, { easing: 'backOut' }).call(call).start();
        }
    }

    static fadeOut(node: Node, call: () => void = null, duration = 0.1) {
        return this.modifyOpacity(node, 255, 0, call, duration);
    }

    static modifyOpacity(node: Node, startOpacity: number, endOpacity: number, call: () => void = null, duration = 0.2) {
        node.opacity = startOpacity;
        return tween(node).to(duration, { opacity: endOpacity }).call(call).start();
    }

    static modifyPositionByArc(node: Node, position: Vec3, height: number, duration: number, needRotate: boolean) {
        let start = v3(node.position);
        let end = v3(position);
        let getPos = (ratio: number) => {
            Vec3.lerp(v3_1, start, end, ratio);
            v3_1.y += Math.sin(ratio * Math.PI) * height;
            return v3_1;
        }
        needRotate && node.lookPosition(getPos(0.001));
        return tween({ t: 0 }).to(duration, { t: 1 }, {
            onUpdate(target: any, ratio) {
                let nextPos = getPos(ratio);
                needRotate && node.lookPosition(nextPos);
                node.setPosition(nextPos);
            },
        }).start();
    }

    static shake(node: Node, call: () => void = null, duration = 0.1, angle = 30) {
        return tween(node).to(duration / 5 * 2, { angle: angle }).to(duration / 5 * 2, { angle: -angle }).to(duration / 5, { angle: 0 }).call(call).start();
    }

}