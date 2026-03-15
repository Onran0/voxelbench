import vcmExport from "./exporters/vcm.js"

const version = "0.1.0"
let exportAction

Plugin.register('voxelbench', {
    title: 'VoxelBench',
    author: 'Onran',
    version: version,
    variant: "both",

    onload() {
        const VCMCodec = new Codec('vcm', {
            name: 'VCM',
            extension: 'vcm',
            export_options: {},

            compile: vcmExport
        });

        MenuBar.addAction(exportAction = new Action('export_vcm', {
            name: 'Export VCM Model',
            icon: `save`,
            category: "file",
            click() {
                VCMCodec.export();
            }
        }), "file.export.0");
    },

    onunload() {
        exportAction.delete()
    }
});

console.log(`voxelbench: successfully loaded! version: ${version}`)