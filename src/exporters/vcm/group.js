import { Indent, exportElement } from "../vcm.js"

import * as avec3 from "../../util/array_vec3.js"

export const TargetType = Group

export default function exportGroup(element, builder, parentOrigin, indent) {
    let relativeOrigin = avec3.sub(element.origin, parentOrigin)

    builder.push(`${indent}@bone name "${element.name}" `)

    if(!avec3.is_zero(relativeOrigin))
        builder.push(`move (${relativeOrigin.join(`, `)}) `)

    if(!avec3.is_zero(element.rotation))
        builder.push(`rotate (${element.rotation.join(`, `)}) `)

    builder.push(`{\n`)

    for(let child of element.children) {
        exportElement(child, builder, relativeOrigin, indent + Indent)
    }

    builder.push(`${indent}}\n`)
}