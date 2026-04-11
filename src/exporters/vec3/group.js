export default function getGroupParts(group, parent, options, getElementParts) {
    const myNode = {
        parent: parent,
        origin: group.origin,
        rotation: group.mesh.quaternion
    }

    let parts =  { }

    for(let child of group.children) {
        const elementParts = getElementParts(child, myNode, options, getElementParts)

        for(let texture in elementParts) {
            const part = elementParts[texture]

            if(parts[texture] == null) {
                parts[texture] = {
                    coords: part.coords,
                    uvs: part.uvs,
                    normals: part.normals
                }
            } else {
                const map = parts[texture]

                map.coords.push(...part.coords)
                map.uvs.push(...part.uvs)

                if(options.exportNormals)
                    map.normals.push(...part.normals)
            }
        }
    }

    return parts
}