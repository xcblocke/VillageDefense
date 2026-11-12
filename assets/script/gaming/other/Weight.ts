function createWeights(length: number, t = 1) {
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
function randomByWeights(weights: number[]) {
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
function weightsToProbabilities(weights: number[]) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) {
        return new Array(weights.length).fill(0);
    }
    return weights.map(weight => weight / totalWeight);
}
function lerp(start: number, end: number, t: number) {
    return start + (end - start) * t;
}
// console.log('----------------Weight.ts');
