export function sub(a, b) {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
    ]
}

export function add(a, b) {
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2]
    ]
}

export function mul(a, b) {
    return [
        a[0] * b[0],
        a[1] * b[1],
        a[2] * b[2]
    ]
}

export function div(a, b) {
    return [
        a[0] / b[0],
        a[1] / b[1],
        a[2] / b[2]
    ]
}

export function map(v, fn) {
    return [
        fn(v[0]),
        fn(v[1]),
        fn(v[2])
    ]
}

export function is_zero(v) {
    return v[0] === 0 &&
           v[1] === 0 &&
           v[2] === 0
}

export function dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
}

export function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ]
}

export function scale(a, b) {
    if (typeof(b) == "number") {
        return [
            a[0] * b,
            a[1] * b,
            a[2] * b
        ]
    } else {
        return [
            a[0] * b[0],
            a[1] * b[1],
            a[2] * b[2]
        ]
    }
}

export function rotate_quat(v, q) {
    const vec = new THREE.Vector3(v[0], v[1], v[2])
    vec.applyQuaternion(q)
    return [vec.x, vec.y, vec.z]
}