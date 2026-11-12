type booleanCallback<T> = (a: T) => boolean
type numberCallback<T> = (a: T) => number

interface Array<T> {
    first(): T
    delete(item: T | booleanCallback<T>): this
    pushArray(array: Array<T>): this
    sum(callback: numberCallback<T>): number
    max(callback: numberCallback<T>): T
    min(callback: numberCallback<T>): T
    getRandomIndexArr(): number[]
    randomSort(): this
}

Array.prototype.first = function () {
    let self = this as any[]
    return self[0]
}
Array.prototype.delete = function (item) {
    let self = this as any[]
    if (item instanceof Function) {
        for (let i = 0; i < self.length; i++) {
            let element = self[i];
            if (item(element)) {
                self.splice(i, 1)
                i--
            }
        }
    }
    else {
        while (1) {
            const index = self.indexOf(item)
            if (index !== -1) {
                self.splice(index, 1)
            }
            else {
                break
            }
        }
    }
    return self
}
Array.prototype.pushArray = function (array) {
    let self = this as any[]
    self.push.apply(self, array)
    return self
}
Array.prototype.sum = function (callback) {
    let self = this as any[]
    let sum = 0
    for (const element of self) {
        sum += callback(element)
    }
    return sum
}
Array.prototype.max = function (callback) {
    let self = this as any[]
    var maxItem = null
    var maxValue = null;
    for (var i = 0; i < self.length; i++) {
        var element = self[i]
        var value = callback(element)
        if (maxItem === null || maxValue < value) {
            maxItem = element
            maxValue = value
        }
    }
    return maxItem
}
Array.prototype.min = function (callback) {
    let self = this as any[]
    var minItem = null
    var minValue = null
    for (var i = 0; i < self.length; i++) {
        var element = self[i]
        var value = callback(element)
        if (minItem === null || minValue > value) {
            minItem = element
            minValue = value
        }
    }
    return minItem
}
Array.prototype.getRandomIndexArr = function () {
    let self = this as any[]
    let arr: number[] = []
    for (let i = 0; i < self.length; i++) {
        arr.push(i)
    }
    arr.sort((a, b) => {
        return Math.random() > 0.5 ? -1 : 1;
    })
    return arr
}
Array.prototype.randomSort = function () {
    let self = this as any[]
    self.sort((a, b) => {
        return Math.random() > 0.5 ? -1 : 1
    })
    return self
}

