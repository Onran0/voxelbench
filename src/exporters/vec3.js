import DataBuffer from '../util/data_buffer'

import getCubeSubmeshes from './vec3/cube.js'
import getGroupSubmeshes from './vec3/group.js'
import getMeshSubmeshes from './vec3/mesh.js'

let submeshBuilders = { }

submeshBuilders[Cube] = getCubeSubmeshes
submeshBuilders[Group] = getGroupSubmeshes
submeshBuilders[Mesh] = getMeshSubmeshes

/*
all keys in returned maps must be texture names;
all values must be an object with following fields:
    [ x: number, y: number, z: number ] coords[],
    [ u: number, v: number] uvs[],
    <can be undefined if options.exportNormals == false> [ x: number, y: number, z: number ] normals[]
 */

const MAGIC = '\0\0VEC3\0\0'
const VERSION = 1

const U16_INDICES = 0b10

const ATTR_POSITION = 0
const ATTR_UV = 1
const ATTR_NORMAL = 2

function getElementSubmeshes(element, parent, options) {
    if(!element.export || (element.visibility != null && !element.visibility))
        return { }

    const elementSubmeshesBuilder = submeshBuilders[element.constructor]

    if(elementSubmeshesBuilder != null) {
        return elementSubmeshesBuilder(element, parent, options, getElementSubmeshes)
    } else {
        console.warn(
            `failed to export element "${element}" with type "${element.constructor}" because no exporter is defined for it`
        )
        return { }
    }
}

function exportMeshes(options) {
    let meshBuffers = [ ]
    let textureNames = [ ]

    let meshesMap = { }

    for (const element of Outliner.root) {
        const submeshes = getElementSubmeshes(element, null, options)

        for(const texture in submeshes) {
            const submesh = submeshes[texture]

            if(meshesMap[texture] == null) {
                meshesMap[texture] = {
                    coords: submesh.coords,
                    uvs: submesh.uvs,
                    normals: options.exportNormals ? submesh.normals : undefined
                }
            } else {
                const map = meshesMap[texture]

                map.coords.push(...submesh.coords)
                map.uvs.push(...submesh.uvs)
                if(map.normals != null)
                    map.normals.push(...submesh.normals)
            }
        }
    }

    for(const textureName in meshesMap) {
        textureNames.push(textureName)

        const { coords, uvs, normals } = meshesMap[textureName]

        // mesh writing

        const buffer = new DataBuffer()

        const trianglesCount = coords.length / 3
        const attributesCount = normals != null ? 3 : 2
        const u16Indices = trianglesCount > 256

        buffer.putUint32(trianglesCount)
        buffer.putUint16(textureNames.length - 1) // material id
        buffer.putUint16(u16Indices ? U16_INDICES : 0) // flags
        buffer.putUint16(attributesCount)

        let indices = [ ]
        let indicesOffset = 0

        function putAttribute(type, floatsCount, arr) {
            buffer.putUint8(type) // type
            buffer.putUint8(0) // flags
            buffer.putUint32(floatsCount * 4) // size
            arr.forEach((x, index) => {
                x.forEach(val => buffer.putFloat32(val))
                indices[index * attributesCount + indicesOffset] = index
            })
            indicesOffset++
        }

        putAttribute(ATTR_POSITION, coords.length * 3, coords)
        putAttribute(ATTR_UV, uvs.length * 2, uvs)

        if(normals != null)
            putAttribute(ATTR_NORMAL, normals.length * 3, normals)

        if(!u16Indices)
            indices.forEach(val => buffer.putUint8(val))
        else
            indices.forEach(val => buffer.putUint16(val))

        meshBuffers.push(buffer)
    }

    return [meshBuffers, textureNames]
}

export default function doExport(options) {
    let buffer = new DataBuffer()

    /* header */

    buffer.putUtf(MAGIC)
    buffer.putUint16(VERSION)
    buffer.putUint16(0) // reserved

    const [meshBuffers, textureNames] = exportMeshes({
        scale: 1/16, // from blockbench pixels to meters,
        texturesPrefix: options.texturesPrefix,
        exportNormals: options.exportNormals
    })

    /* body */

    buffer.putUint16(textureNames.length) // materials count
    buffer.putUint16(1) // models count

    // materials
    for(let textureName of textureNames) {
        textureName = textureName.length !== 0 ? options.texturesPrefix + textureName : ''

        buffer.putUint16(0) // flags
        buffer.putUint16(buffer.getBytesCountInUtf(textureName))
        buffer.putUtf(textureName)
    }

    // models

    const modelName = options.modelName

    buffer.putUint16(buffer.getBytesCountInUtf(modelName))

    // offset for center model for blocks or entities
    let origin = options.centerForEntity ? [ 0, 0.5, 0 ] : [ -0.5, 0, -0.5 ]

    // origin
    buffer.putFloat32(origin[0])
    buffer.putFloat32(origin[1])
    buffer.putFloat32(origin[2])

    buffer.putUint32(meshBuffers.length)

    // meshes
    for(const meshBuffer of meshBuffers)
        buffer.putBuffer(meshBuffer)

    buffer.putUtf(modelName)

    return buffer.getArrayBuffer()
}