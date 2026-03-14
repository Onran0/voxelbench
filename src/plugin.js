import getVcm from "./exporter.js"

let exportAction

Plugin.register('voxelbench', {
    title: 'VoxelBench',
    author: 'Onran',
    version: '1.0.0',
    variant: "both",

    onload() {
        const VCMCodec = new Codec('vcm', {
            name: 'VCM',
            extension: 'vcm',
            export_options: {},

            compile() {
                return getVcm()
            }
        });

        MenuBar.addAction(exportAction = new Action('export_vcm', {
            name: 'Export VCM Model',
            icon: `save`,
            category: "file",
            click() {
                VCMCodec.export();
            }
        }), "file.export");
    },

    onunload() {
        exportAction.delete()
    }
});