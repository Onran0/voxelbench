// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

export default function toRelativeControlPoints(sortedKeyframes, keyframeIndex, axis) {
    const len = sortedKeyframes.length

    function getKeyframeVector(index) {
        const clampedIndex = Math.max(0, Math.min(len - 1, index))
        const kf = sortedKeyframes[clampedIndex]
        return new THREE.Vector2(kf.time, kf.data_points[axis])
    }

    const previous = getKeyframeVector(keyframeIndex - 1)
    const next = getKeyframeVector(keyframeIndex + 1)

    const tangent = next
        .clone()
        .sub(previous)
        .divideScalar(6)

    return [
        -tangent.x,
        -tangent.y,
        tangent.x,
        tangent.y
    ]
}