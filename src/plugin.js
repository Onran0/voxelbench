const version = '0.4.0'

import pluginIcon from '../assets/plugin/icon.png'

import exportVcm from './exporters/vcm.js'
import exportVec3 from './exporters/vec3.js'

import translations from '../assets/plugin/translations.json'

for(let lang in translations)
    Language.addTranslations(lang, translations[lang])

function registerFormat(
    name,
    extension, exportOptions, compileFunction,
    exportButtonId, exportButtonLabel,
    exportButtonIcon = 'icon-format_block', exportButtonCategory = 'file'
) {
    const codec = new Codec(extension, {
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
        const baseOptions = {
            texturesPrefix: {
                type: 'text',
                label: 'voxelbench.export.textures_prefix',
                value: ''
            },
            centerForEntity: {
                type: 'checkbox',
                label: 'voxelbench.export.center_for_entity',
                value: false
            }
        }

        registerFormat(
            'VEC3 (Voxel Core)', 'vec3',
            Object.assign({
                    modelName: {
                        type: 'text',
                        label: 'voxelbench.export.vec3.model_name',
                        value: ''
                    },
                    exportNormals: {
                        type: 'checkbox',
                        label: 'voxelbench.export.vec3.export_normals',
                        value: true
                    }
                }, baseOptions
            ), exportVec3,
            'export_vec3', 'voxelbench.vec3.export'
        )

        registerFormat(
            'VCM (Voxel Core)', 'vcm',
            baseOptions, exportVcm,
            'export_vcm', 'voxelbench.vcm.export'
        )
    },

    onunload() {
        actions.forEach(action => action.delete())
    }
})

console.log(`voxelbench: successfully loaded! version: ${version}`)