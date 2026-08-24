// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

export default function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item))
    }

    const clonedObj = {}

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clonedObj[key] = deepCopy(obj[key])
        }
    }

    return clonedObj
}