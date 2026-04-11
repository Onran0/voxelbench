import exportCube from './vcm/cube.js'
import exportGroup from './vcm/group.js'
import exportMesh from './vcm/mesh.js'

export const INDENT = `    `

let elementsExporters = { }

elementsExporters[Cube] = exportCube
elementsExporters[Group] = exportGroup
elementsExporters[Mesh] = exportMesh

export function exportElement(element, builder, parentInfo, indent, options) {
    if(!element.export || (element.visibility != null && !element.visibility))
        return

    const elementExporter = elementsExporters[element.constructor]

    if(elementExporter != null) {
        elementExporter(element, builder, parentInfo, indent, options, INDENT, exportElement)
    } else {
        console.warn(
            `failed to export element "${element}" with type "${element.constructor}" because no exporter is defined for it`
        )
    }
}

export default function doExport(options) {
    let initialOrigin = [ -0.5*16, 0, -0.5*16 ] // offset for center model on blocks

    if(options.centerForEntity)
        initialOrigin = [ 0, 0.5*16, 0 ] // offset for center model on entities

    let builder = [ ]

    for (const element of Outliner.root) {
        exportElement(element, builder, {
            origin: initialOrigin,
            rotation: [ 0, 0, 0 ],
            parent: null
        }, '', {
            scale: 1/16, // from blockbench pixels to meters,
            texturesPrefix: options.texturesPrefix
        })
    }

    return builder.join('')
}