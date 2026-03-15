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

function exportElement(element, builder, indent) {
    if(!element.export)
        return

    if(indent == null)
        indent = ``
    else
        indent += Indent

    if(element instanceof Cube) {
        builder.push(`${indent}@box from (${element.from.join(', ')}) to (${element.to.join(', ')}) `)
        builder.push(`origin (${element.origin.join(', ')}) rotate (${element.rotation.join(', ')}) {\n`)

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
        builder.push(`${indent}@bone name "${element.name}" `)
        builder.push(`rotate (${element.rotation.join(`, `)}) {\n`)

        for(let child of element.children) {
            exportElement(child, builder, indent)
        }

        builder.push(`${indent}}`)
    }
}

export default function getVcm() {
    let builder = [ ]

    Outliner.root.forEach(element => exportElement(element, builder))

    return builder.join('')
}