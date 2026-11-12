

interface Number {
    formatNumber(): string
}

Number.prototype.formatNumber = function () {
    if (this > 10000) {
        return (this / 10000).toFixed(1) + '万'
    }
    if (this > 100000000) {
        return (this / 100000000).toFixed(1) + '亿'
    }
    return String(Math.floor(this));
}

