export function findTexture(uuid) {
    return Texture.all.find(t => t.uuid === uuid)
}

export function getTextureName(texture) {
    return texture.name.substring(0, texture.name.lastIndexOf('.'))
}

export function normalizeUVByTexture(uv, texture) {
    if(texture == null)
        return normalizeUV(uv, 16, 16)
    else
        return normalizeUV(uv, texture.uv_width, texture.uv_height)
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