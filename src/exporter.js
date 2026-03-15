const Indent = `    `

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

function vec3_sub(a, b) {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
    ]
}

function vec3_is_zero(a) {
    return a[0] === 0 &&
           a[1] === 0 &&
           a[2] === 0;
}

function exportElement(element, builder, parentOrigin, indent) {
    if(!element.export)
        return

    if(indent == null)
        indent = ``
    else
        indent += Indent

    if(element instanceof Cube) {
        builder.push(`${indent}@box from (${
            vec3_sub(element.from, parentOrigin).join(', ')
        }) to (${
            vec3_sub(element.to, parentOrigin).join(', ')
        }) `)

        let relativeOrigin = vec3_sub(element.origin, parentOrigin)

        if(!vec3_is_zero(relativeOrigin))
            builder.push(`origin (${relativeOrigin.join(', ')}) `)

        if(!vec3_is_zero(element.rotation))
            builder.push(`rotate (${element.rotation.join(', ')}) `)

        builder.push(`{\n`)

        for (let faceName in element.faces) {
            const face = element.faces[faceName]

            builder.push(`${indent}${Indent}@part tags (${BBSideToVCM[faceName]}) `)

            let width = 16, height = 16

            if(face.texture !== false) {
                let texture = Texture.all.find(t => t.uuid === face.texture)

                if(texture != null) {
                    builder.push(`texture "${texture.name.substring(0, texture.name.lastIndexOf('.'))}" `)

                    width = texture.width
                    height = texture.height
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
    } else if (element instanceof Group) {
        let relativeOrigin = vec3_sub(element.origin, parentOrigin)

        builder.push(`${indent}@bone name "${element.name}" `)

        if(!vec3_is_zero(relativeOrigin))
            builder.push(`move (${relativeOrigin.join(`, `)}) `)

        if(!vec3_is_zero(element.rotation))
            builder.push(`rotate (${element.rotation.join(`, `)}) `)

        builder.push(`{\n`)

        for(let child of element.children) {
            exportElement(child, builder, relativeOrigin, indent)
        }

        builder.push(`${indent}}\n`)
    }
}

export default function getVcm() {
    let builder = [ ]

    Outliner.root.forEach(element => exportElement(element, builder, [ 0, 0, 0 ]))

    return builder.join('')
}