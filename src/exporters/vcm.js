import exportCube from './vcm/cube.js'
import exportGroup from './vcm/group.js'
import exportMesh from './vcm/mesh.js'

export const Indent = `    `

let ElementsExporters = { }

ElementsExporters[Cube] = exportCube
ElementsExporters[Group] = exportGroup
ElementsExporters[Mesh] = exportMesh

export function exportElement(element, builder, parentInfo, indent) {
    if(!element.export)
        return

    const elementExporter = ElementsExporters[element.constructor]

    if(elementExporter != null) {
        elementExporter(element, builder, parentInfo, indent, Indent, exportElement)
    } else {
        console.warn(
            `failed to export element "${element}" with type "${element.constructor}" because no exporter is defined for it`
        )
    }
}

export default function doExport() {
    let builder = [ ]

    for (const element of Outliner.root) {
        exportElement(element, builder, {
            origin: [ 0, 0.5*16, 0 ],
            rotation: [ 0, 0, 0 ],
            scale: 1/16, // from pixels to meters
            parent: null
        }, '');
    }

    return builder.join('')
}