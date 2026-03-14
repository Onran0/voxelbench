const Indent = `  `

const BBSideToVCM = {
    north: "north",
    south: "south",
    east: "east",
    west: "west",
    up: "top",
    down: "bottom",
}

function exportElement(element, builder, indent) {
    if(!element.export)
        return

    if(indent == null)
        indent = ``
    else
        indent += Indent

    if(element instanceof Cube) {
        builder.push(`${indent}@cube from (${element.from.join(', ')}) to (${element.to.join(', ')}) `)
        builder.push(`origin (${element.origin.join(', ')}) rotate (${element.rotation.join(', ')}) {\n`)

        for (let faceName in element.faces) {
            const face = element.faces[faceName]

            builder.push(`${indent}${Indent}@part tags (${BBSideToVCM[faceName]}) `)

            if(face.texture !== false) {
                builder.push(`texture "${face.texture}" `)
            }

            builder.push(`region (${face.uv.join(', ')}) {}\n`)
        }

        builder.push(`${indent}}`)
    } else if (element instanceof Group) {
        builder.push(`${indent}@bone name "${element.name}" move (${element.origin.join(', ')}) `)
        builder.push(`rotate (${element.rotation.join(`, `)}) {\n`)

        for(let child in element.children) {
            exportElement(child, builder, indent)
            builder.push(`\n`)
        }

        builder.push(`\n${indent}}`)
    }
}

export default function getVcm() {
    let builder = [ ]

    Outliner.root.forEach(element => exportElement(element, builder))

    return builder.join('')
}