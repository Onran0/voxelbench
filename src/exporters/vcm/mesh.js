import * as avec3 from "../../util/array_vec3.js"
import * as texture_util from "../../util/texture_util.js"
import { prettyJoin } from "../../util/floats_prettifier"

function getTriangles(mesh, face, faceKey) {
    const v = face.vertices

    switch(v.length) {
        case 3: return [v]

        case 4: return [
            [v[0], v[1], v[2]],
            [v[0], v[2], v[3]]
        ]

        default:
            console.error(`voxelbench: failed to export face "${faceKey}" on mesh "${mesh.name}" because it have unsupported vertices count (${v.length})`)
            return [ ]
    }
}

export default function exportMesh(mesh, builder, parentInfo, indent) {
    const relativeOrigin = avec3.sub(mesh.origin, parentInfo.origin)

    for(const faceKey in mesh.faces) {
        const face = mesh.faces[faceKey]

        for(const triangle of getTriangles(mesh, face, faceKey)) {
            const a = avec3.scale(
                avec3.add(
                    avec3.rotate(mesh.vertices[triangle[0]], mesh.rotation),
                    relativeOrigin
                ),
                parentInfo.scale
            )

            const b = avec3.scale(
                avec3.add(
                    avec3.rotate(mesh.vertices[triangle[1]], mesh.rotation),
                    relativeOrigin
                ),
                parentInfo.scale
            )

            const c = avec3.scale(
                avec3.add(
                    avec3.rotate(mesh.vertices[triangle[2]], mesh.rotation),
                    relativeOrigin
                ),
                parentInfo.scale
            )

            let texture = texture_util.findTexture(face.texture)

            const uv = texture_util.normalizeUVByTexture([
                ...face.uv[triangle[0]],
                ...face.uv[triangle[1]],
                ...face.uv[triangle[2]]
            ], texture)

            builder.push(
                `${indent}@tri a (${
                    prettyJoin(a, ', ')
                }) b (${
                    prettyJoin(b, ', ')
                }) c (${
                    prettyJoin(c, ', ')
                }) uv (${uv.join(', ')})`
            )

            if(texture != null)
                builder.push(` texture "${ texture_util.getTextureName(texture) }"`)

            builder.push(`\n`)
        }
    }
}