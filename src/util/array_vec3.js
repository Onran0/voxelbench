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

export function euler_to_quat(euler, order = 'XYZ') {
    let quat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
            Math.degToRad(euler[0]),
            Math.degToRad(euler[1]),
            Math.degToRad(euler[2]),
            order
        )
    )

    return [ quat.x, quat.y, quat.z, quat.w ]
}

export function convert_euler_order(euler, from, to) {
    let quat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
            Math.degToRad(euler[0]),
            Math.degToRad(euler[1]),
            Math.degToRad(euler[2]),
            from
        )
    )

    let converted = new THREE.Euler().setFromQuaternion(quat, to)

    return [ Math.radToDeg(converted.x), Math.radToDeg(converted.y), Math.radToDeg(converted.z)]
}

export function rotate(v, degrees, origin = [0, 0, 0]) {
    const rad = [
        degrees[0] * (Math.PI / 180),
        degrees[1] * (Math.PI / 180),
        degrees[2] * (Math.PI / 180)
    ]

    let x = v[0] - origin[0]
    let y = v[1] - origin[1]
    let z = v[2] - origin[2]

    let x1 = x * Math.cos(rad[2]) - y * Math.sin(rad[2])
    let y1 = x * Math.sin(rad[2]) + y * Math.cos(rad[2])
    let z1 = z

    let x2 = x1 * Math.cos(rad[1]) + z1 * Math.sin(rad[1])
    let y2 = y1
    let z2 = -x1 * Math.sin(rad[1]) + z1 * Math.cos(rad[1])

    let x3 = x2
    let y3 = y2 * Math.cos(rad[0]) - z2 * Math.sin(rad[0])
    let z3 = y2 * Math.sin(rad[0]) + z2 * Math.cos(rad[0])

    return [
        x3 + origin[0],
        y3 + origin[1],
        z3 + origin[2]
    ]
}