// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

export function getFileStem(path) {
    return path.split(/[\\/]/).pop().replace(/\.[^.]*$/, '')
}