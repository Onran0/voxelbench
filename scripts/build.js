const esbuild = require('esbuild')
const fs = require('fs')
const archiver = require('archiver')

console.log("wrapping via ESBuild...")

function failedHandler(reason) {
    console.error(`build failed: ${reason}`)
    process.exit(1)
}

esbuild.build({
    entryPoints: ['src/plugin.js'],
    bundle: true,
    outfile: 'dist/voxelbench/voxelbench.js',
    minify: true,
    loader: { '.png': 'file', '.svg': 'file' },
    assetNames: '[name]',
}).then(() => {
    console.log(`archiving to "voxelbench.zip"`)

    const output = fs.createWriteStream('dist/voxelbench.zip')

    const archive = archiver('zip', undefined)

    archive.pipe(output)

    archive.directory('dist/voxelbench/', "voxelbench/", undefined)

    archive.finalize().then(() => {
        console.log('build finished!')
    }).catch(failedHandler)
}).catch(failedHandler)