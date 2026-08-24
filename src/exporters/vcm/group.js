// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

import * as avec3 from "../../util/array_vec3.js"
import { prettyJoin } from "../../util/floats_prettifier"

export default function exportGroup(element, builder, parentInfo, indent, options, baseIndent, exportElement) {
    let relativeOrigin = avec3.scale(avec3.sub(element.origin, parentInfo.origin), options.scale)

    if(options.targetUsage === 'block') {
        builder.push(`${indent}@bone `)
    } else {
        builder.push(`${indent}@bone name "${element.name}" `)
    }

    if(!avec3.is_zero(relativeOrigin))
        builder.push(`move (${prettyJoin(relativeOrigin, `, `)}) `)

    const q = element.mesh.quaternion

    if(!avec3.is_zero(element.rotation) && options.applyBonesRotation)
        builder.push(`rotate (${prettyJoin([ q.x, q.y, q.z, q.w ], ', ')}) `)

    builder.push(`{\n`)

    const asParent = {
        origin: element.origin,
        rotation: element.rotation,
        parent: parentInfo
    }

    for(let child of element.children) {
        exportElement(child, builder, asParent, indent + baseIndent, options)
    }

    builder.push(`${indent}}\n`)
}