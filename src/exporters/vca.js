// Copyright (C) 2026 Onran
// SPDX-License-Identifier: GPL-3.0-only

const AXES = [ 'x', 'y', 'z' ]

const CHANNEL_POSITION = 'position'
const CHANNEL_ROTATION = 'rotation'
const CHANNEL_SCALE = 'scale'
const CHANNELS = [ CHANNEL_POSITION, CHANNEL_ROTATION, CHANNEL_SCALE ]

import { prettify } from "../util/floats_prettifier"

const VCA_CHANNELS_MAP = {
    position: 'move',
    rotation: 'rotate',
    scale: 'scale'
}

const VCA_INTERPS_MAP = {
    step: 'const',
    linear: 'linear',
    bezier: 'bezier',
    catmullrom: 'bezier'
}

function catmullromToRelativeBezierControlPoints(sortedKeyframes, keyframeIndex, axis) {
    const len = sortedKeyframes.length

    function getKeyframeVector(index) {
        const clampedIndex = Math.max(0, Math.min(len - 1, index))

        const kf = sortedKeyframes[clampedIndex]
        return new THREE.Vector2(kf.time, kf.calc(axis))
    }

    const previous = getKeyframeVector(keyframeIndex - 1)
    const next = getKeyframeVector(keyframeIndex + 1)

    const tangent = next
        .clone()
        .sub(previous)
        .divideScalar(6)

    return [
        -tangent.x,
        -tangent.y,
        tangent.x,
        tangent.y
    ]
}

function exportAxisKeyframes(builder, bone, channel, axis, keyframes, animator, fps, options) {
    const axisIndex = AXES.indexOf(axis)

    const vcaChannel = VCA_CHANNELS_MAP[channel]

    let interpType
    let bake = options.bake

    if(!bake) {
        keyframes.some(keyframe => {
            let kfInterpType = keyframe.interpolation

            if(interpType != null) {
                if(kfInterpType !== interpType) {
                    // baking if animation have multiple interpolation types
                    // TODO: instead of baking convert step|linear|catmullrom interpolations to bezier
                    bake = true
                    return true
                }
            } else interpType = kfInterpType
        })
    }

    let boneBuilder = [ ]

    boneBuilder.push(`@${vcaChannel} bone `)

    if(bone.includes(" ")) {
        boneBuilder.push(`"${bone}"`)
    } else {
        boneBuilder.push(bone)
    }

    boneBuilder.push(` by ${axis} curve ${bake ? 'linear' : VCA_INTERPS_MAP[interpType]} {\n`)

    let prevValue = null
    let fullyValuesEqual = true

    let kfsBuilder = [ ]

    if(bake) {
        let prevKfFrame = 0

        for(const keyframe of keyframes) {
            let kfLastFrame = Math.floor(keyframe.time * fps)

            for (let frame = prevKfFrame; frame <= kfLastFrame; frame++) {
                Timeline.setTime(frame / fps)

                const vector = animator.interpolate(channel, false)

                let value = vector[axisIndex]

                if(channel === CHANNEL_POSITION) {
                    value -= options.worldCenter[axisIndex]
                }

                if(prevValue != null) {
                    if(prevValue !== value)
                        fullyValuesEqual = false
                }

                prevValue = value

                kfsBuilder.push(`\t@key frame ${frame} value ${prettify(value)}\n`)
            }

            Timeline.setTime(0)

            prevKfFrame = kfLastFrame
        }
    } else {
        let kfIndex = 0

        for(const keyframe of keyframes) {
            const frame = Math.floor(keyframe.time * fps)

            let value = keyframe.calc(axis)

            if(prevValue != null) {
                if(prevValue !== value)
                    fullyValuesEqual = false
            }

            prevValue = value

            if(channel === CHANNEL_POSITION) {
                value -= options.worldCenter[axisIndex]
            }

            kfsBuilder.push(`\t@key frame ${frame} value ${prettify(value)}`)

            let lx, ly, rx, ry

            if(interpType === 'bezier') {
                lx = keyframe.bezier_left_time[axisIndex] || 0
                ly = keyframe.bezier_left_value[axisIndex] || 0
                rx = keyframe.bezier_right_time[axisIndex] || 0
                ry = keyframe.bezier_right_value[axisIndex] || 0
            } else if(interpType === 'catmullrom') {
                [ lx, ly, rx, ry ] = catmullromToRelativeBezierControlPoints(keyframes, kfIndex, axis)
            }

            if(interpType === 'bezier' || interpType === 'catmullrom') {
                kfsBuilder.push(` lx ${prettify(Math.floor(lx * fps))}`)
                kfsBuilder.push(` ly ${prettify(ly)}`)
                kfsBuilder.push(` rx ${prettify(Math.floor(rx * fps))}`)
                kfsBuilder.push(` ry ${prettify(ry)}`)
            }

            kfsBuilder.push('\n')

            kfIndex++
        }
    }

    if(fullyValuesEqual) {
        if(prevValue === 0 && channel !== CHANNEL_SCALE) { // cuz scale is absolute
            return
        } else if(prevValue === 1 && channel === CHANNEL_SCALE) {
            return
        }

        boneBuilder.push(`\t@key frame 0 value ${prettify(prevValue)}\n`)
    } else {
        boneBuilder.push(...kfsBuilder)
    }

    boneBuilder.push('}')
    boneBuilder.push('\n\n')

    builder.push(...boneBuilder)
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
                    const keyframes = animator[channel].slice().sort((a, b) => (a.time - b.time))

                    const axesToExport = []

                    for(const keyframe of keyframes) {
                        for(const axis of AXES) {
                            if(keyframe.calc(axis) != null) {
                                axesToExport.safePush(...axis)
                            }
                        }
                    }

                    for(const axis of axesToExport) {
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