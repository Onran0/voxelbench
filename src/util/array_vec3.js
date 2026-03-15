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

export function map(a, fn) {
    return [
        fn(a[0]),
        fn(a[1]),
        fn(a[2])
    ]
}

export function is_zero(a) {
    return a[0] === 0 &&
        a[1] === 0 &&
        a[2] === 0;
}