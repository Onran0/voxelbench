// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

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