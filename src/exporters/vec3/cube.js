import { getThreeMeshSubmeshes } from "./mesh";

export default function getCubeSubmeshes(cube, parent, options) {
    return getThreeMeshSubmeshes(cube.mesh, parent, options)
}