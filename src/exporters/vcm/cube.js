// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

import * as avec3 from "../../util/array_vec3.js"
import * as texture_util from "../../util/texture_util.js"
import { prettyJoin } from "../../util/floats_prettifier"

const BBSideToVCM = {
    north: "north",
    south: "south",
    east: "east",
    west: "west",
    up: "top",
    down: "bottom"
}

export default function exportCube(element, builder, parentInfo, indent, options, baseIndent) {
    builder.push(`${indent}@box from (${
        prettyJoin(avec3.scale(avec3.sub(element.from, parentInfo.origin), options.scale), ', ')
    }) to (${
        prettyJoin(avec3.scale(avec3.sub(element.to, parentInfo.origin), options.scale), ', ')
    }) `)

    let relativeOrigin = avec3.scale(avec3.sub(element.origin, parentInfo.origin), options.scale)

    if(!avec3.is_zero(relativeOrigin) || parentInfo.parent != null)
        builder.push(`origin (${prettyJoin(relativeOrigin, ', ')}) `)

    const q = element.mesh.quaternion

    if(!avec3.is_zero(element.rotation))
        builder.push(`rotate (${prettyJoin([ q.x, q.y, q.z, q.w ], ', ')}) `)

    builder.push(`{\n`)

    for (let faceName in element.faces) {
        const face = element.faces[faceName]

        builder.push(`${indent}${baseIndent}@part tags (${BBSideToVCM[faceName]}) `)

        let texture = face.texture !== false ? texture_util.findTexture(face.texture) : null

        const textureName = texture != null ? texture_util.getTextureName(texture) : ''

        if (textureName.trim() !== '') {
            builder.push(`texture "${options.texturesPrefix + textureName}" `)
        } else if(options.colorUntextured) {
            builder.push('texture "blocks:white" ')
        }

        let normalizedUv = texture_util.normalizeUVByTexture(face.uv, texture)

        let tmp = normalizedUv[1]

        normalizedUv[1] = normalizedUv[3]
        normalizedUv[3] = tmp

        builder.push(`region (${normalizedUv.join(', ')})\n`)
    }

    builder.push(`${indent}}\n`)
}