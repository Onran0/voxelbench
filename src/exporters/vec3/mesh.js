import * as avec3 from "../../util/array_vec3.js"
import * as texture_util from "../../util/texture_util";

function accumulateTransform(node) {
    let position = new THREE.Vector3()
    let rotation = new THREE.Quaternion()

    while (node) {
        position.applyQuaternion(node.rotation)

        rotation.premultiply(node.rotation)

        position.x += node.origin[0]
        position.y += node.origin[1]
        position.z += node.origin[2]

        node = node.parent
    }

    return [ [ position.x, position.y, position.z ], rotation ]
}

export function applyTransforms(parent, vertices, normals, baseOrigin, baseRotation, scale) {
    if(parent == null && baseOrigin == null && baseRotation == null)
        return

    const [ position, rotation ] = accumulateTransform({
        origin: baseOrigin,
        rotation: baseRotation,
        parent: parent
    })

    for (let i = 0; i < vertices.length; i++) {
        vertices[i] = avec3.scale(avec3.add(
            avec3.rotate_quat(vertices[i], rotation),
            position
        ), scale)
    }

    if(normals) {
        for (let i = 0; i < normals.length; i++)
            normals[i] = avec3.rotate_quat(normals[i], rotation)
    }
}

export function getThreeMeshSubmeshes(mesh, origin, parent, options) {
    const geo = mesh.geometry

    const posAttr = geo.attributes.position.array
    const normalsAttr = geo.attributes.normal.array
    const uvAttr = geo.attributes.uv.array
    const index = geo.index?.array

    const groups = geo.groups.length
        ? geo.groups
        : [{
            start: 0,
            count: index != null ? geo.index.count : posAttr.length / 3,
            materialIndex: 0
        }]

    let materials = Array.isArray(mesh.material) ? mesh.material : [ mesh.material ]

    let submeshes = { }

    function getAttrVec2(attr, idx) {
        return [
            attr[idx*2],
            attr[idx*2+1]
        ]
    }

    function getAttrVec3(attr, idx) {
        return [
            attr[idx*3],
            attr[idx*3+1],
            attr[idx*3+2]
        ]
    }

    for (const group of groups) {
        const material = materials[group.materialIndex]
        let texture = material != null ? texture_util.getTextureName(material) || '' : ''

        let coords = [ ], uvs = [ ], normals = options.exportNormals ? [ ] : undefined

        for (let i = group.start; i < group.start + group.count; i += 3) {
            const ia = index != null ? index[i] : i
            const ib = index != null ? index[i+1] : i+1
            const ic = index != null ? index[i+2] : i+2

            coords.push(getAttrVec3(posAttr, ia))
            coords.push(getAttrVec3(posAttr, ib))
            coords.push(getAttrVec3(posAttr, ic))

            uvs.push(getAttrVec2(uvAttr, ia))
            uvs.push(getAttrVec2(uvAttr, ib))
            uvs.push(getAttrVec2(uvAttr, ic))

            if(options.exportNormals) {
                normals.push(getAttrVec3(normalsAttr, ia))
                normals.push(getAttrVec3(normalsAttr, ib))
                normals.push(getAttrVec3(normalsAttr, ic))
            }
        }

        applyTransforms(parent, coords, normals, origin, mesh.quaternion, options.scale)

        if(submeshes[texture] == null) {
            submeshes[texture] = {
                coords: coords,
                uvs: uvs,
                normals: normals
            }
        } else {
            const submesh = submeshes[texture]

            submesh.coords.push(...coords)
            submesh.uvs.push(...uvs)

            if(options.exportNormals)
                submesh.normals.push(...normals)
        }
    }

    return submeshes
}

export default function getMeshSubmeshes(mesh, parent, options) {
    return getThreeMeshSubmeshes(
        mesh.mesh,
        parent != null ? avec3.sub(mesh.origin, parent.origin) : mesh.origin,
        parent,
        options
    )
}