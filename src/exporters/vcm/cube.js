import * as avec3 from "../../util/array_vec3.js"
import * as texture_util from "../../util/texture_util.js"

const BBSideToVCM = {
    north: "south",
    south: "north",
    east: "west",
    west: "east",
    up: "top",
    down: "bottom"
}

function fixCubeFaceUV(face, uv) {
    let [u1,v1,u2,v2] = uv

    switch(face) {
        case "north":
        case "south":
        case "east":
            return [u1,v2,u2,v1]

        case "down":
        case "west":
            return [u2,v2,u1,v1]

        case "up":
            return [u2,v1,u1,v2]

        default:
            return uv
    }
}

export default function exportCube(element, builder, parentInfo, indent, baseIndent) {
    builder.push(`${indent}@box from (${
        avec3.sub(element.from, parentInfo.origin).join(', ')
    }) to (${
        avec3.sub(element.to, parentInfo.origin).join(', ')
    }) `)

    let relativeOrigin = avec3.sub(element.origin, parentInfo.origin)

    if(!avec3.is_zero(relativeOrigin))
        builder.push(`origin (${relativeOrigin.join(', ')}) `)

    if(!avec3.is_zero(element.rotation))
        builder.push(`rotate (${element.rotation.join(', ')}) `)

    builder.push(`{\n`)

    for (let faceName in element.faces) {
        const face = element.faces[faceName]

        builder.push(`${indent}${baseIndent}@part tags (${BBSideToVCM[faceName]}) `)

        let texture

        if(face.texture !== false) {
            texture = texture_util.findTexture(face.texture)

            if(texture != null)
                builder.push(`texture "${texture_util.getTextureName(texture)}" `)
        }

        let normalizedUv = fixCubeFaceUV(
            faceName,
            texture_util.normalizeUVByTexture(face.uv, texture)
        )

        builder.push(`region (${normalizedUv.join(', ')})\n`)
    }

    builder.push(`${indent}}\n`)
}