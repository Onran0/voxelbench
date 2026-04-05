const version = '0.3.0'

import registerTranslations from './translations.js'
registerTranslations()

import pluginIcon from '../assets/icon.png'

import exportVcm from './exporters/vcm.js'

function registerFormat(
    name,
    extension, exportOptions, compileFunction,
    exportButtonId, exportButtonLabel,
    exportButtonIcon = 'icon-format_block', exportButtonCategory = 'file'
) {
    const codec = new Codec('vcm', {
        name: name,
        extension: extension,
        export_options: exportOptions,

        compile: compileFunction,

        async export() {
            let options = await codec.promptExportOptions()
            if (options === null) return

            let content = codec.compile(options)

            Blockbench.export({
                resource_id: extension,
                type: name,
                extensions: [extension],
                name: codec.fileName(),
                startpath: codec.startPath(),
                content: content
            })
        }
    })

    const action = new Action(exportButtonId, {
        name: exportButtonLabel,
        icon: exportButtonIcon,
        category: exportButtonCategory,
        click: codec.export
    })

    MenuBar.addAction(action, "file.export.0")

    actions.push(action)
}

let actions = [ ]

Plugin.register('voxelbench', {
    title: 'VoxelBench',
    author: 'Onran',
    icon: pluginIcon,
    version: version,
    variant: 'both',

    onload() {
        registerFormat(
            'Voxel Core Model', 'vcm',
            {
                texturesPrefix: {
                    type: 'text',
                    label: 'vcm.export.textures_prefix',
                    value: ''
                },
                centerForEntity: {
                    type: 'checkbox',
                    label: 'vcm.export.center_for_entity',
                    value: false
                }
            }, exportVcm,
            'export_vcm', 'vcm.export'
        )
    },

    onunload() {
        actions.forEach(action => action.delete())
    }
})

console.log(`voxelbench: successfully loaded! version: ${version}`)