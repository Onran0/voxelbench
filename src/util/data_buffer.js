const textEncoder = new TextEncoder()

export default class DataBuffer {
    #buffer
    #view
    #offset

    constructor(initialSize = 64) {
        this.#offset = 0
        this.#buffer = new ArrayBuffer(initialSize)
        this.#view = new DataView(this.#buffer)
    }

    #ensureCapacity(size) {
        if (this.#offset + size <= this.#buffer.byteLength) return

        let newSize = this.#buffer.byteLength * 2
        while (newSize < this.#offset + size) {
            newSize *= 2
        }

        const newBuffer = new ArrayBuffer(newSize)
        new Uint8Array(newBuffer).set(new Uint8Array(this.#buffer))

        this.#buffer = newBuffer
        this.#view = new DataView(this.#buffer)
    }

    getBytesCountInUtf(str) {
        return textEncoder.encode(str).byteLength
    }

    putInt8(val) {
        this.#ensureCapacity(1)
        this.#view.setInt8(this.#offset, val)
        this.#offset += 1
    }

    putUint8(val) {
        this.#ensureCapacity(1)
        this.#view.setUint8(this.#offset, val)
        this.#offset += 1
    }

    putInt16(val) {
        this.#ensureCapacity(2)
        this.#view.setInt16(this.#offset, val, true)
        this.#offset += 2
    }

    putUint16(val) {
        this.#ensureCapacity(2)
        this.#view.setUint16(this.#offset, val, true)
        this.#offset += 2
    }

    putInt32(val) {
        this.#ensureCapacity(4)
        this.#view.setInt32(this.#offset, val, true)
        this.#offset += 4
    }

    putUint32(val) {
        this.#ensureCapacity(4)
        this.#view.setUint32(this.#offset, val, true)
        this.#offset += 4
    }

    putFloat32(val) {
        this.#ensureCapacity(4)
        this.#view.setFloat32(this.#offset, val, true)
        this.#offset += 4
    }

    putFloat64(val) {
        this.#ensureCapacity(8)
        this.#view.setFloat64(this.#offset, val, true)
        this.#offset += 8
    }

    putInt64(val) {
        this.#ensureCapacity(8)
        this.#view.setBigInt64(this.#offset, BigInt(val), true)
        this.#offset += 8
    }

    putUint64(val) {
        this.#ensureCapacity(8)
        this.#view.setBigUint64(this.#offset, BigInt(val), true)
        this.#offset += 8
    }

    putBytes(arr) {
        const len = arr.length || arr.byteLength

        this.#ensureCapacity(len)
        new Uint8Array(this.#buffer, this.#offset, len).set(arr)
        this.#offset += len
    }

    putUtf(str) {
        const encoded = textEncoder.encode(str)
        this.putBytes(encoded)
    }

    getArrayBuffer() {
        return this.#buffer.slice(0, this.#offset)
    }

    getUint8Array() {
        return new Uint8Array(this.#buffer, 0, this.#offset)
    }

    reset() {
        this.#offset = 0
    }
}