import DataBuffer from '../util/data_buffer'

import getCubeParts from './vec3/cube.js'
import getGroupParts from './vec3/group.js'
import getMeshParts from './vec3/mesh.js'

let PartsSuppliers = { }

PartsSuppliers[Cube] = getCubeParts
PartsSuppliers[Group] = getGroupParts
PartsSuppliers[Mesh] = getMeshParts

/*
part must be an object with following fields:
    string texture
    [ x: number, y: number, z: number ] coords[],
    [ u: number, v: number] uvs[],
    <can be undefined if options.exportNormals == false> [ x: number, y: number, z: number ] normals[]
 */

const Magic = '\0\0VEC3\0\0'
const Version = 1

const U16_INDICES = 0b10

const ATTR_POSITION = 0
const ATTR_UV = 1
const ATTR_NORMAL = 2

function getElementParts(element, parent, options) {
    if(!element.export || (element.visibility != null && !element.visibility))
        return [ ]

    const elementPartsSupplier = PartsSuppliers[element.constructor]

    if(elementPartsSupplier != null) {
        return elementPartsSupplier(element, parent, options, getElementParts)
    } else {
        console.warn(
            `failed to export element "${element}" with type "${element.constructor}" because no exporter is defined for it`
        )
        return [ ]
    }
}

function exportMeshes(options) {
    let meshBuffers = [ ]
    let textureNames = [ ]

    let meshesMap = { }

    for (const element of Outliner.root) {
        for(const part of getElementParts(element, null, options)) {
            if(part.texture != null) {
                if(meshesMap[part.texture] == null) {
                    meshesMap[part.texture] = {
                        coords: part.coords,
                        uvs: part.uvs,
                        normals: part.normals
                    }
                } else {
                    const map = meshesMap[part.texture]

                    map.coords.push(...part.coords)
                    map.uvs.push(...part.uvs)
                    if(map.normals != null)
                        map.normals.push(...part.normals)
                }
            }
        }
    }

    for(const textureName in meshesMap) {
        textureNames.push(textureNames)

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
    let initialOrigin = [ -0.5*16, 0, -0.5*16 ] // offset for center model on blocks

    if(options.centerForEntity)
        initialOrigin = [ 0, 0.5*16, 0 ] // offset for center model on entities

    let buffer = new DataBuffer()

    /* header */

    buffer.putUtf(Magic)
    buffer.putUint16(Version)
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
    for(const textureName of textureNames) {
        buffer.putUint16(0) // flags
        buffer.putUint16(buffer.getBytesCountInUtf(textureName))
        buffer.putUtf(textureName)
    }

    // models

    const modelName = 'root'

    buffer.putUint16(buffer.getBytesCountInUtf(modelName))

    // origin
    buffer.putFloat32(initialOrigin[0])
    buffer.putFloat32(initialOrigin[1])
    buffer.putFloat32(initialOrigin[2])

    buffer.putUint32(meshBuffers.length)

    // meshes
    for(const meshBuffer of meshBuffers)
        buffer.putBytes(meshBuffer.getArrayBuffer())

    buffer.putUtf(modelName)

    return buffer.getArrayBuffer()
}