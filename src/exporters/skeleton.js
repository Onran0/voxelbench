// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

import * as avec3 from "../util/array_vec3";

function exportGroup(parentObject, parentOrigin, group, options) {
    const relativeOrigin = avec3.scale(avec3.sub(group.origin, parentOrigin), options.scale)

    let groupObject = {
        name: group.name,
        offset: relativeOrigin,
    }

    let needToExportModel = false

    for(const child of group.children) {
        if(child instanceof Group) {
            if(groupObject.nodes == null)
                groupObject.nodes = [ ]

            exportGroup(groupObject, group.origin, child, options)
        } else if(child instanceof Cube || child instanceof Mesh) {
            needToExportModel = true
        }
    }

    if(needToExportModel)
        groupObject.model = options.modelName + "." + group.name
}

export default function doExport(options) {
    let skeleton = { }

    let needToExportModel = false

    for (const element of Outliner.root) {
        if(element instanceof Group) {
            if(skeleton.nodes == null)
                skeleton.nodes = [ ]

            exportGroup(skeleton, [ 0, 0, 0 ], element, options)
        } else if(element instanceof Cube || element instanceof Mesh) {
            needToExportModel = true
        }
    }

    if(needToExportModel)
        skeleton.model = options.modelName

    return JSON.stringify({ root: skeleton }, null, 4)
}