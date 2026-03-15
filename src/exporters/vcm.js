const ElementsExportersPaths = [
    "./cube.js",
    "./group.js"
]

export const Indent = `    `

let ElementsExporters = {}

async function completeExporters() {
    const modules = await Promise.all(
        ElementsExportersPaths.map(path => import(path))
    )

    modules.forEach(module => ElementsExporters[module.TargetType] = module.default)
}

export function exportElement(element, builder, parentOrigin, indent) {
    if(!element.export)
        return

    const elementExporter = ElementsExporters[element.constructor]

    if(elementExporter != null) {
        elementExporter(element, builder, parentOrigin, indent)
    } else {
        console.warn(
            `failed to export element "${element}" with type "${element.constructor}" because no exporter is defined for it`
        )
    }
}

export default function doExport() {
    let builder = [ ]

    Outliner.root.forEach(element => exportElement(element, builder, [ 0, 0, 0 ], Indent))

    return builder.join('')
}