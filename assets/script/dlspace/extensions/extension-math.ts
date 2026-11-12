interface Math {

    /**
     * 获取当前的进度比例
     * @param start 
     * @param end 
     * @param value 
     */
    getRatio(start: number, end: number, value: number): number;

    /**
     * 返回最小(包含)和最大(不包含)之间的浮点随机数
     * @param min 
     * @param max 
     */
    randomFloat(min: number, max: number): number;

    /**
     * 返回最小(包含)和最大(不包含)之间的随机整数
     * @param min 
     * @param max 
     * @param forbid 
     */
    randomInt(min: number, max: number, forbid?: number): number;

    /**
     * 返回最小(包含)和最大(包含)之间的随机整数
     * @param min 
     * @param max 
     * @param forbid 
     */
    randomInt2(min: number, max: number, forbid?: number): number;

    /**
     * 返回最小数和最大数之间的一个数值
     * @param v 
     * @param min 
     * @param max 
     */
    clamp(v: number, min: number, max: number): number;

    /**
     * 创建权重数组（t<1概率越来越小,t>1概率越来越大）
     * @param length 数组长度 
     * @param t 下标0的值乘以t=下标1的值，默认1
     */
    createWeights(length: number, t?: number): number[];

    /**
     * 返回一个随机权重的下标
     * @param weights 
     */
    randomByWeights(weights: number[]): number;

    /**
     * 将权重数组转为几率数组
     * @param weights 
     */
    weightsToProbabilities(weights: number[]): number[];

}

Math.getRatio = function (start: number, end: number, value: number) {
    return (value - start) / (end - start);
}
Math.randomFloat = function (min: number, max: number) {
    return Math.random() * (max - min) + min;
}
Math.randomInt = function (min: number, max: number, forbid: number = null) {
    let v = Math.floor(Math.randomFloat(min, max));
    if (forbid !== null && v === forbid) {
        return Math.randomInt(min, max, forbid);
    }
    return v;
}
Math.randomInt2 = function (min: number, max: number, forbid: number = null) {
    return Math.randomInt(min, max + 1, forbid);
}
Math.clamp = function (v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}
Math.createWeights = function (length: number, t = 1) {
    let weights: number[] = [];
    for (let i = 0; i < length; i++) {
        let w: number;
        if (i === 0) {
            w = 100;
        }
        else {
            w = weights[i - 1] * t;
        }
        weights.push(w);
    }
    return weights;
}
Math.randomByWeights = function (weights: number[]) {
    let totalWeight = 0;
    for (let weight of weights) {
        totalWeight += weight;
    }
    let randomNum = Math.random() * totalWeight;
    let accumulatedWeight = 0;
    for (let i = 0; i < weights.length; i++) {
        accumulatedWeight += weights[i];
        if (randomNum < accumulatedWeight) {
            return i;
        }
    }
    return 0;
}
Math.weightsToProbabilities = function (weights: number[]) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) {
        return new Array(weights.length).fill(0);
    }
    return weights.map(weight => weight / totalWeight);
}