import { getThreeMeshSubmeshes } from "./mesh";
import * as avec3 from "../../util/array_vec3";

export default function getCubeSubmeshes(cube, parent, options) {
    return getThreeMeshSubmeshes(
        cube.mesh,
        parent != null ? avec3.sub(cube.origin, parent.origin) : cube.origin,
        parent,
        options
    )
}