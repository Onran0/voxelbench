export function prettify(num, precision = 12) {
    return Number(num.toFixed(precision));
}

export function prettyJoin(nums, separator, precision = 12) {
    let arr = [ ]

    for(const num of nums) {
        arr.push(prettify(num, precision))
    }

    return arr.join(separator)
}