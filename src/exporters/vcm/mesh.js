import * as avec3 from "../../util/array_vec3.js"
import * as texture_util from "../../util/texture_util.js"
import { prettyJoin } from "../../util/floats_prettifier"

export default function exportMesh(mesh, builder, parentInfo, indent) {
    const geo = mesh.mesh.geometry

    const pos = geo.attributes.position.array
    const uvAttr = geo.attributes.uv?.array
    const index = geo.index.array

    const materials = []

    for (let key in mesh.faces) {
        let face = mesh.faces[key]

        if (face.texture === null)
            continue

        let tex = face.getTexture()

        if (tex && tex.uuid)
            materials.push(tex.getMaterial())
    }

    const relativeOrigin = avec3.sub(mesh.origin, parentInfo.origin)

    function getVertex(idx) {
        let v = [
            pos[idx*3],
            pos[idx*3+1],
            pos[idx*3+2]
        ]

        v = avec3.rotate(v, mesh.rotation)
        v = avec3.add(v, relativeOrigin)
        v = avec3.scale(v, parentInfo.scale)

        return v
    }

    const groups = geo.groups.length
        ? geo.groups
        : [{ start: 0, count: geo.index.count, materialIndex: 0 }];

    for (const group of groups) {
        let texture = materials[group.materialIndex]

        for (let i = group.start; i < group.start + group.count; i += 3) {
            const ia = index[i]
            const ib = index[i+1]
            const ic = index[i+2]

            const a = getVertex(ia)
            const b = getVertex(ib)
            const c = getVertex(ic)

            let uv = null

            if (uvAttr) {
                uv = [
                    uvAttr[ia*2], uvAttr[ia*2+1],
                    uvAttr[ib*2], uvAttr[ib*2+1],
                    uvAttr[ic*2], uvAttr[ic*2+1],
                ]
            }

            builder.push(
                `${indent}@tri a (${prettyJoin(a, ', ')}) b (${prettyJoin(b, ', ')}) c (${prettyJoin(c, ', ')})`
            )

            if (uv)
                builder.push(` uv (${uv.join(', ')})`)

            if (texture) {
                texture = texture_util.getTextureName(texture)

                if(texture.trim() !== '')
                    builder.push(` texture "${texture}"`)
            }

            builder.push(`\n`)
        }
    }
}
