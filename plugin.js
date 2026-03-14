import getVcm from "./modules/exporter.js"

Plugin.register('voxelbench', {
    title: 'VoxelBench',
    author: 'Onran',
    version: '1.0.0',
    variant: "both"
});

const VCMCodec = new Codec('vcm', {
    name: 'VCM',
    extension: 'vcm',
    export_options: {},

    compile() {
        return getVcm()
    }
});

MenuBar.addAction(new Action('export_vcm', {
    name: 'Export .VCM',
    click() {
        VCMCodec.export();
    }
}));