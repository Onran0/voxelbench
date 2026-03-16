import * as avec3 from "../../util/array_vec3.js"

export default function exportGroup(element, builder, parentInfo, indent, baseIndent, exportElement) {
    let relativeOrigin = avec3.sub(element.origin, parentInfo.origin)

    builder.push(`${indent}@bone name "${element.name}" `)

    if(!avec3.is_zero(relativeOrigin))
        builder.push(`move (${relativeOrigin.join(`, `)}) `)

    if(!avec3.is_zero(element.rotation))
        builder.push(`rotate (${element.rotation.join(`, `)}) `)

    builder.push(`{\n`)

    const asParent = {
        origin: element.origin,
        rotation: element.rotation,
        parent: parentInfo
    }

    for(let child of element.children) {
        exportElement(child, builder, asParent, indent + baseIndent)
    }

    builder.push(`${indent}}\n`)
}