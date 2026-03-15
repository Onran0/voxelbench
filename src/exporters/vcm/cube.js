import * as avec3 from "../../util/array_vec3.js"

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
        case "east":
            return [u1,v2,u2,v1]

        case "west":
            return [u2,v2,u1,v1]

        case "up":
            return [u2,v1,u1,v2]

        case "down":
            return [u2,v2,u1,v1]

        case "north": case "south":
            return [u1,v2,u2,v1]

        default:
            return uv
    }
}

export default function exportCube(element, builder, parentOrigin, indent, baseIndent) {
    builder.push(`${indent}@box from (${
        avec3.sub(element.from, parentOrigin).join(', ')
    }) to (${
        avec3.sub(element.to, parentOrigin).join(', ')
    }) `)

    let relativeOrigin = avec3.sub(element.origin, parentOrigin)

    if(!avec3.is_zero(relativeOrigin))
        builder.push(`origin (${relativeOrigin.join(', ')}) `)

    if(!avec3.is_zero(element.rotation))
        builder.push(`rotate (${element.rotation.join(', ')}) `)

    builder.push(`{\n`)

    for (let faceName in element.faces) {
        const face = element.faces[faceName]

        builder.push(`${indent}${baseIndent}@part tags (${BBSideToVCM[faceName]}) `)

        let width = 16, height = 16

        if(face.texture !== false) {
            let texture = Texture.all.find(t => t.uuid === face.texture)

            if(texture != null) {
                builder.push(`texture "${texture.name.substring(0, texture.name.lastIndexOf('.'))}" `)

                width = texture.uv_width
                height = texture.uv_height
            }
        }

        let normalizedUv = [
            face.uv[0] / width, 1 - face.uv[1] / height,
            face.uv[2] / width, 1 - face.uv[3] / height
        ]

        normalizedUv = fixCubeFaceUV(faceName, normalizedUv)

        builder.push(`region (${normalizedUv.join(', ')})\n`)
    }

    builder.push(`${indent}}\n`)
}