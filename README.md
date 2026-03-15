# Voxel Bench

<sup>[Russian README](README-ru.md)</sup>

This is a plugin for [**Blockbench**](https://www.blockbench.net),
that allows you to export models to the `.vcm` format
([Voxel Core](https://github.com/MihailRis/voxelcore) Model),
greatly simplifying modeling, rigging, and overall integrating
models into **Voxel Core**.

## How to install?
1) Open the [releases](https://github.com/Onran0/voxelbench/releases) page;
2) Download the `voxelbench.js` file from latest release;
3) In **Blockbench**, click `File -> Plugins -> Import from File`
   and select the downloaded file.

## How to use?

Simply click `File -> Export -> Export VCM Model` and select the file
to which you want to export the `.vcm` model.

## How to build?

### WebStorm Guide

1) Clone the repository through the interface;
2) Open the **VoxelBench** project;
3) Enter `npm run build` in the terminal;
4) Use the plugin build located at `dist/voxelbench.js`.