import { getThreeMeshParts } from "./mesh";

export default function getCubeParts(cube, parent, options) {
    return getThreeMeshParts(cube.mesh, parent, options)
}