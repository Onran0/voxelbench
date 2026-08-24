// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

import DataBuffer from '../util/DataBuffer'
import { getFileStem } from '../util/path'

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

function exportMeshes(nodes, textureNames, options) {
    let meshBuffers = [ ]

    let meshesMap = { }

    for (const element of nodes) {
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
        if(!textureNames.includes(textureName))
            textureNames.push(textureName)

        const { coords, uvs, normals } = meshesMap[textureName]

        // mesh writing

        const buffer = new DataBuffer()

        const trianglesCount = coords.length / 3
        const attributesCount = normals != null ? 3 : 2
        const u16Indices = trianglesCount > 256

        buffer.putUint32(trianglesCount)
        buffer.putUint16(textureNames.indexOf(textureName)) // material id
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

    return meshBuffers
}

export default function doExport(options) {
    const scale = 1/16 // from blockbench pixels to meters

    const texturesPrefix = (options.targetUsage === 'block' ? 'blocks:' : '' ) + options.texturesPrefix
    const rootModelName = getFileStem(options.filePath)

    options = Object.assign(structuredClone(options), {
            scale: scale,
            texturesPrefix: texturesPrefix
        }
    )

    let models = [ ]
    let textureNames = [ ]

    if(!options.singleModel) {
        function exportGroup(group, isRoot) {
            const children = isRoot ? Outliner.root : group.children

            let needToExport = false

            for(const child of children) {
                if(child instanceof Group) {
                    exportGroup(child)
                } else if(child instanceof Cube || child instanceof Mesh) {
                    needToExport = true
                }
            }

            if(needToExport) {
                models.push({
                    name: isRoot ? rootModelName : group.name,
                    meshBuffers: exportMeshes(
                        isRoot ? Outliner.root : [ group ],
                        textureNames, options
                    )
                })
            }
        }

        exportGroup(null, true)
    } else {
        models.push({
            name: rootModelName,
            meshBuffers: exportMeshes(Outliner.root, textureNames, options),
        })
    }

    let buffer = new DataBuffer()

    /* header */

    buffer.putUtf(MAGIC)
    buffer.putUint16(VERSION)
    buffer.putUint16(0) // reserved

    /* body */

    buffer.putUint16(textureNames.length) // materials count
    buffer.putUint16(models.length)

    // materials
    for(let textureName of textureNames) {
        textureName = textureName.length !== 0 ? texturesPrefix + textureName : ''

        buffer.putUint16(0) // flags
        buffer.putUint16(buffer.getBytesCountInUtf(textureName))
        buffer.putUtf(textureName)
    }

    // offset for center model for blocks or entities
    const origin = options.targetUsage === 'entity'
        ? (options.singleModel ? [ 0, 0.5, 0 ] : [ 0, 0, 0 ])
        : [ -0.5, 0, -0.5 ]

    // models

    for(const model of models) {
        buffer.putUint16(buffer.getBytesCountInUtf(model.name))

        // origin
        buffer.putFloat32(origin[0])
        buffer.putFloat32(origin[1])
        buffer.putFloat32(origin[2])

        buffer.putUint32(model.meshBuffers.length)

        // meshes
        for(const meshBuffer of model.meshBuffers)
            buffer.putBuffer(meshBuffer)

        buffer.putUtf(model.name)
    }

    return buffer.getArrayBuffer()
}