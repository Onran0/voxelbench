// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

const version = '0.5.0'

import pluginIcon from '../assets/plugin/icon.png'

import exportVcm from './exporters/vcm.js'
import exportVec3 from './exporters/vec3.js'
import exportVca from './exporters/vca.js'

import translations from '../assets/plugin/translations.json'

for(let lang in translations)
    Language.addTranslations(lang, translations[lang])

function registerFormat(
    name,
    extension, exportOptions, compileFunction,
    exportButtonId, exportButtonLabel, preExportCallback = null,
    exportButtonIcon = 'icon-format_block', exportButtonCategory = 'file'
) {
    const codec = new Codec(extension, {
        name: name,
        extension: extension,
        export_options: typeof exportOptions === 'object' ? exportOptions : { },

        compile: compileFunction,

        async export() {
            if(typeof exportOptions === 'function') {
                codec.export_options = exportOptions()
            }

            let options = await codec.promptExportOptions()
            if (options === null) return

            Blockbench.export({
                resource_id: extension,
                type: name,
                extensions: [extension],
                name: codec.fileName(),
                startpath: codec.startPath(),
                content: '',

                custom_writer(_, path) {
                    const oldTimelineTime = Timeline.time

                    let content

                    try {
                        Timeline.setTime(0)

                        content = codec.compile(Object.assign(
                            {
                                filePath: path
                            }, options
                        ))
                    } finally {
                        Timeline.setTime(oldTimelineTime)
                    }

                    Blockbench.writeFile(path, {
                        content: content
                    })
                }
            })
        }
    })

    const action = new Action(exportButtonId, {
        name: exportButtonLabel,
        icon: exportButtonIcon,
        category: exportButtonCategory,
        click: () => {
            if(preExportCallback == null || !preExportCallback()) {
                codec.export()
            }
        }
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
        const modelBaseOptions = {
            texturesPrefix: {
                type: 'text',
                label: 'voxelbench.export.textures_prefix',
                value: ''
            },
            targetUsage: {
                type: 'select',
                label: 'voxelbench.export.target_usage',
                options: {
                    entity: 'voxelbench.export.target_usage.entity',
                    block: 'voxelbench.export.target_usage.block'
                },
                default: 'block'
            },
            applyBonesRotation: {
                type: 'checkbox',
                label: 'voxelbench.export.apply_bones_rotation',
                value: true
            }
        }

        registerFormat(
            'VEC3 (Voxel Core)', 'vec3',
            Object.assign(structuredClone(modelBaseOptions),{
                    exportSkeleton: {
                        type: 'checkbox',
                        label: 'voxelbench.export.vec3.export_skeleton',
                        value: false
                    },
                    exportNormals: {
                        type: 'checkbox',
                        label: 'voxelbench.export.vec3.export_normals',
                        value: true
                    }
                }
            ), exportVec3,
            'export_vec3', 'voxelbench.vec3.export'
        )

        registerFormat(
            'VCA (Voxel Core Animation)', 'vca',
            () => {
                return {
                    targetAnimation: {
                        type: 'select',
                        label: 'voxelbench.export.vca.target_animation',
                        options: Object.fromEntries(
                            Animator.animations.map(animation => [
                                animation.uuid,
                                animation.name
                            ])
                        ),
                        default: Animator.animations[0].uuid
                    }
                }
            }, exportVca,
            'export_vca', 'voxelbench.vca.export',
            () => {
                if(Animator.animations.length === 0) {
                    Blockbench.showMessageBox({
                        title: 'voxelbench.export.vca.unable_to_export',
                        message: 'voxelbench.export.vca.unable_to_export.reason'
                    })
                    return true
                } else return false
            }
        )

        registerFormat(
            'VCM (Voxel Core Model)', 'vcm',
            Object.assign(structuredClone(modelBaseOptions), {

                }
            ), exportVcm,
            'export_vcm', 'voxelbench.vcm.export'
        )
    },

    onunload() {
        actions.forEach(action => action.delete())
    }
})

console.log(`voxelbench: successfully loaded! version: ${version}`)