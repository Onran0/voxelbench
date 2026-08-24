// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

import * as avec3 from "../../util/array_vec3";

export default function getGroupSubmeshes(group, parent, options, getElementSubmeshes) {
    const myNode = {
        parent: parent,
        origin: parent != null ? avec3.sub(group.origin, parent.origin) : group.origin,
        rotation: options.applyBonesRotation ? group.mesh.quaternion : new THREE.Quaternion().identity()
    }

    let submeshes =  { }

    for(let child of group.children) {
        if(child instanceof Group && !options.singleModel)
            continue

        const elementSubmeshes = getElementSubmeshes(child, myNode, options)

        for(let texture in elementSubmeshes) {
            const submesh = elementSubmeshes[texture]

            if(submeshes[texture] == null) {
                submeshes[texture] = {
                    coords: submesh.coords,
                    uvs: submesh.uvs,
                    normals: submesh.normals
                }
            } else {
                const map = submeshes[texture]

                map.coords.push(...submesh.coords)
                map.uvs.push(...submesh.uvs)

                if(options.exportNormals)
                    map.normals.push(...submesh.normals)
            }
        }
    }

    return submeshes
}