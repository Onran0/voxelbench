import * as avec3 from "../../util/array_vec3";

export default function getGroupSubmeshes(group, parent, options, getElementSubmeshes) {
    const myNode = {
        parent: parent,
        origin: parent != null ? avec3.sub(group.origin, parent.origin) : group.origin,
        rotation: group.mesh.quaternion
    }

    let submeshes =  { }

    for(let child of group.children) {
        const elementSubmeshes = getElementSubmeshes(child, myNode, options, getElementSubmeshes)

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