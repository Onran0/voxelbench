export function findTexture(uuid) {
    return Texture.all.find(t => t.uuid === uuid)
}

export function getTextureName(texture) {
    if(texture.name.includes('.'))
        return texture.name.substring(0, texture.name.lastIndexOf('.'))
    else
        return texture.name
}

export function normalizeUVByTexture(uv, texture) {
    return normalizeUV(uv, texture?.uv_width || 16, texture?.uv_height || 16)
}

export function normalizeUV(uv, width, height) {
    let res = [ ]

    for(let i = 0;i < uv.length;i++) {
        if(i % 2 === 0)
            res[i] = uv[i] / width
        else
            res[i] = 1 - uv[i] / height
    }

    return res
}