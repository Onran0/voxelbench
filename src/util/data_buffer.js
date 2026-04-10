const textEncoder = new TextEncoder()

export default class DataBuffer {
    #data

    constructor() {
        this.#data = [ ]
    }

    #putDirect(arr) {
        this.#data.push(...arr)
    }

    #putBuf(buf) {
        this.#data.push(
            ...new Uint8Array(buf)
        )
    }

    #put(ctor, val) {
        this.#putBuf(ctor(val).buffer)
    }

    putFloat32(val) { this.#put(Float32Array, val) }

    putFloat64(val) { this.#put(Float64Array, val) }

    putInt8(val) { this.#put(Int8Array, val) }

    putInt16(val) { this.#put(Int16Array, val) }

    putInt32(val) { this.#put(Int32Array, val) }

    putInt64(val) { this.#put(BigInt64Array, val) }

    putUint8(val) { this.#putBuf(val) }

    putUint16(val) { this.#put(Uint16Array, val) }

    putUint32(val) { this.#put(Uint32Array, val) }

    putUint64(val) { this.#put(BigUint64Array, val) }

    putUtf(val) {
        this.#putDirect(textEncoder.encode(val))
    }

    getArrayBuffer() {
        return new Uint8Array(this.#data).buffer
    }
}