// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

const AXISES = [ 'x', 'y', 'z' ]
const CHANNELS = [ 'position', 'rotation' ]

import { prettify } from "../util/floats_prettifier"

const VCA_CHANNELS_MAP = {
    position: 'move',
    rotation: 'rotate'
}

const VCA_INTERPS_MAP = {
    step: 'const',
    linear: 'linear',
    bezier: 'bezier',
    catmullrom: 'bezier' // keys auto converts into bezier
}

function exportAxisKeyframes(builder, bone, channel, axis, keyframes, animator, fps, options) {
    const axisIndex = AXISES.indexOf(axis)

    const vcaChannel = VCA_CHANNELS_MAP[channel]

    let interpType
    let bake = false

    keyframes.some(keyframe => {
        let kfInterpType = keyframe.interpolation

        if(interpType != null) {
            if(kfInterpType !== interpType || interpType === 'catmullrom') {
                bake = true
                return true
            }
        } else interpType = kfInterpType
    })

    builder.push(`@${vcaChannel} bone "${bone}" by "${axis}" curve "${bake ? 'linear' : VCA_INTERPS_MAP[interpType]}" {\n`)

    if(bake) {
        let prevKfFrame = 0
        let prevValue = null
        let fullyValuesEqual = true

        let kfsBuilder = [ ]

        for(const keyframe of keyframes) {
            let kfLastFrame = Math.floor(keyframe.time * fps)

            for (let frame = prevKfFrame; frame <= kfLastFrame; frame++) {
                Timeline.setTime(frame / fps)

                const vector = animator.interpolate(channel, false)
                const comp = vector[axisIndex]

                if(prevValue != null) {
                    if(prevValue !== comp)
                        fullyValuesEqual = false
                }

                prevValue = comp

                kfsBuilder.push(`\t@key frame ${frame} value ${prettify(comp)}\n`)
            }

            Timeline.setTime(0)

            prevKfFrame = kfLastFrame
        }

        if(fullyValuesEqual) {
            builder.push(`\t@key frame 0 value ${prettify(prevValue)}\n`)
        } else {
            builder.push(...kfsBuilder)
        }
    } else {
        for(const keyframe of keyframes) {
            const frame = Math.floor(keyframe.time * fps)

            builder.push(`\t@key frame ${frame} value ${prettify(keyframe.data_points[0][axis])}`)

            if(interpType === 'bezier') {
                builder.push(` lx ${prettify(keyframe.bezier_left_time[axisIndex])}`)
                builder.push(` ly ${prettify(keyframe.bezier_left_value[axisIndex])}`)
                builder.push(` rx ${prettify(keyframe.bezier_right_time[axisIndex])}`)
                builder.push(` ry ${prettify(keyframe.bezier_right_value[axisIndex])}`)
            }

            builder.push('\n')
        }
    }

    builder.push('}')
    builder.push('\n\n')
}

export default function doExport(options) {
    const targetAnimation = Animator.animations.find(anim => anim.uuid === options.targetAnimation)
    const fps = targetAnimation.snapping

    let builder = [ ]

    builder.push(`@configure fps ${fps} duration ${targetAnimation.length}`)
    builder.push('\n\n')

    for(const animator of Object.values(targetAnimation.animators)) {
        if (['bone', 'armature_bone'].includes(animator.type) && animator.getGroup()) {
            const group = animator.getGroup()
            const boneName = group.name

            for(const channel of CHANNELS) {
                if(animator[channel] && animator[channel].length > 0) {
                    const keyframes = animator[channel]

                    const axisesToExport = []

                    for(const keyframe of keyframes) {
                        for(const axis of AXISES) {
                            if(keyframe.data_points[0][axis] != null) {
                                axisesToExport.safePush(...axis)
                            }
                        }
                    }

                    for(const axis of axisesToExport) {
                        exportAxisKeyframes(
                            builder,
                            boneName, channel, axis,
                            keyframes,
                            animator, fps, options
                        )
                    }
                }
            }
        }
    }

    builder.pop() // removing last new lines

    return builder.join('')
}