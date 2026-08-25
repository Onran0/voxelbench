// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

import { getFileStem } from '../util/path'

import * as avec3 from "../util/array_vec3";

function exportGroup(parentChildren, parentOrigin, group, options) {
    const relativeOrigin = avec3.scale(avec3.sub(group.origin, parentOrigin), options.scale)

    let groupObject = {
        name: group.name,
    }

    let nodes = [ ]

    let needToExportModel = false

    for(const child of group.children) {
        if(child instanceof Group) {
            exportGroup(nodes, group.origin, child, options)
        } else if(child instanceof Cube || child instanceof Mesh) {
            needToExportModel = true
        }
    }

    if(needToExportModel)
        groupObject.model = options.modelName + "." + group.name

    if(!avec3.is_zero(relativeOrigin))
        groupObject.offset = relativeOrigin

    if(nodes.length > 0)
        groupObject.nodes = nodes

    parentChildren.push(groupObject)
}

export default function doExport(options) {
    options = Object.assign(structuredClone(options), {
            modelName: options.autoModelName ? getFileStem(options.filePath) : options.modelName,
            scale: 1/16 // from blockbench pixels to meters,
        }
    )

    let skeleton = { offset: [ 0, -0.5 - options.worldCenter[1], 0 ] }
    let nodes = [ ]

    let needToExportModel = false

    for (const element of Outliner.root) {
        if(element instanceof Group) {
            exportGroup(nodes, [ 0, 0, 0 ], element, options)
        } else if(element instanceof Cube || element instanceof Mesh) {
            needToExportModel = true
        }
    }

    if(needToExportModel)
        skeleton.model = options.modelName

    if(nodes.length > 0)
        skeleton.nodes = nodes

    return JSON.stringify({ root: skeleton }, null, 4)
}