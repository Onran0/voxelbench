// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

import { getThreeMeshSubmeshes } from "./mesh";

export default function getCubeSubmeshes(cube, parent, options) {
    return getThreeMeshSubmeshes(
        cube.mesh,
        cube.origin,
        parent,
        options
    )
}