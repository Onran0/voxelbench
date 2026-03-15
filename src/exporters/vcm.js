import exportCube from './vcm/cube.js'
import exportGroup from './vcm/group.js'

export const Indent = `    `

let ElementsExporters = { }

ElementsExporters[Cube] = exportCube
ElementsExporters[Group] = exportGroup

export function exportElement(element, builder, parentOrigin, indent) {
    if(!element.export)
        return

    const elementExporter = ElementsExporters[element.constructor]

    if(elementExporter != null) {
        elementExporter(element, builder, parentOrigin, indent, Indent, exportElement)
    } else {
        console.warn(
            `failed to export element "${element}" with type "${element.constructor}" because no exporter is defined for it`
        )
    }
}

export default function doExport() {
    let builder = [ ]

    for (const element of Outliner.root) {
        exportElement(element, builder, [0, 0, 0], '');
    }

    return builder.join('')
}