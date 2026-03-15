const ElementsExportersPaths = [
    "./cube.js",
    "./group.js"
]

export const Indent = `    `

let ElementsExporters = {}
let ElementsExportersCompleted = false

async function completeElementsExporters() {
    const modules = await Promise.all(
        ElementsExportersPaths.map(path => import(path))
    )

    modules.forEach(module => ElementsExporters[module.TargetType] = module.default)

    ElementsExportersCompleted = true
}

export async function exportElement(element, builder, parentOrigin, indent) {
    if(!ElementsExportersCompleted)
        await completeElementsExporters()

    if(!element.export)
        return

    const elementExporter = ElementsExporters[element.constructor]

    if(elementExporter != null) {
        await elementExporter(element, builder, parentOrigin, indent)
    } else {
        console.warn(
            `failed to export element "${element}" with type "${element.constructor}" because no exporter is defined for it`
        )
    }
}

export default async function doExport() {
    let builder = [ ]

    for (const element of Outliner.root) {
        await exportElement(element, builder, [0, 0, 0], Indent);
    }

    return builder.join('')
}