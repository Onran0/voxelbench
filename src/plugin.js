import pluginIcon from '../assets/icon.png'

import vcmExport from "./exporters/vcm.js"

const version = "0.3.0"

let actions = [ ]

Plugin.register('voxelbench', {
    title: 'VoxelBench',
    author: 'Onran',
    icon: pluginIcon,
    version: version,
    variant: "both",

    onload() {
        const VCMCodec = new Codec('vcm', {
            name: 'VCM',
            extension: 'vcm',
            export_options: {},

            compile: vcmExport
        });

        const action = new Action('export_vcm', {
            name: 'Export VCM Model',
            icon: `icon-format_block`,
            category: "file",
            click() {
                VCMCodec.export()
            }
        })

        MenuBar.addAction(action, "file.export.0")

        actions.push(action)
    },

    onunload() {
        actions.forEach(action => action.delete())
    }
})

console.log(`voxelbench: successfully loaded! version: ${version}`)