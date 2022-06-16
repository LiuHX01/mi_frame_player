<script>
import { defineComponent, computed, watch, ref, reactive, toRefs, onMounted } from 'vue';
import { frameAdaptorFRange, frameAdaptorReadyImage, frameAdaptorReadyLidar } from './adaptor.js';
import hotkeys from 'hotkeys-js'



export default defineComponent({
    name: 'framePlayerControl',



    props: {
        timeRange: {
            type: Array,
            default: () => [],
        },

        disabled: {
            type: Boolean,
            default: () => false,
        },
    },


    emits: ['frame-change'],



    setup(props, { emit }) {
        const state = reactive({
            timer: null,
            frame: 0,
            speed: 1,
            isPlaying: false,
            maxSpeedPlaying: false,
            needStop: false,
        })


        let frameLoadedRange = ref(0)
        const sliderControl = ref(null)
        const sliderRef = ref(null)
        const frameChangeLock = reactive({
            imageLock: true,
            lidarLock: true,
            playLock: true,
        })


        const start = () => {
            state.isPlaying = true
            state.needStop = false

            let f = 0


            const run = () => {
                let playPerFrame = 1000
                if (state.speed === 1) {
                    playPerFrame = 1000 / 10
                } else if (state.speed === 2) {
                    playPerFrame = 1000 / 20
                } else if (state.speed === 4) {
                    playPerFrame = 1000 / 40
                }

                if (state.timer) {
                    clearTimeout(state.timer)
                }

                if (!frameChangeLock.playLock) {
                    if (state.frame < props.timeRange.length - 1) {
                        if (frameLoadedRange.value < state.frame + 1) {
                            // f = 1
                            // stop()
                        } else {
                            state.frame += 1
                        }
                    } else {
                        state.frame = 0
                        f = 1
                    }
                }
                if (f === 0) {
                    if (state.maxSpeedPlaying || frameChangeLock.playLock) {
                        if (!state.needStop) {
                            window.requestAnimationFrame(run)
                        } else {
                            stop()
                        }
                    } else {
                        state.timer = setTimeout(() => {
                            run()
                        }, playPerFrame)
                    }
                } else {
                    stop()
                }

                return ''
            }
            run()
        }


        const stop = () => {
            state.needStop = true
            state.isPlaying = false
  
            if (state.timer) {
                clearTimeout(state.timer)
            }
        }


        const clickToStartStop = () => {
            if (state.isPlaying) {
                stop()
            } else {
                start()
            }
        }


        const prevOneFrame = () => {
            stop()

            if (!frameChangeLock.playLock) {
                if (state.frame > 0) {
                    state.frame -= 1
                } else {
                    if (props.timeRange.length - 1 === frameLoadedRange.value) {
                        state.frame = props.timeRange.length - 1
                    }
                }
            }
        }


        const nextOneFrame = () => {
            stop()
 
            if (!frameChangeLock.playLock) {
                if (state.frame < props.timeRange.length - 1) {
                    if (frameLoadedRange.value >= state.frame + 1) {
                        state.frame += 1
                    }
                } else {
                    state.frame = 0
                }
            }
        }


        const speedChange = (speed) => {
            state.speed = speed
        }


        const upSpeed = () => {
            switch (state.speed) {
                case 1:
                    state.speed = 2
                    break
                case 2:
                    state.speed = 4
                    break
                case 4:
                    state.speed = 1
                    break
                default:
                    break
            }
        }


        const downSpeed = () => {
            switch (state.speed) {
                case 1:
                    state.speed = 4
                    break
                case 2:
                    state.speed = 1
                    break
                case 4:
                    state.speed = 2
                    break
                default:
                    break
            }
        }


        const jumpFrame = (frame) => {
            stop()

            if (!frameChangeLock.playLock) {
                state.frame = frame
            }
        }


        const clickFrame = ($event) => {
            const { offsetX } = $event

            let target = Math.ceil((offsetX / sliderRef.value.clientWidth) * (props.timeRange.length))

            if (target <= 1) {
                target = 0
            } else if (target >= props.timeRange.length - 2) {
                target = props.timeRange.length - 1
            }


            if (target > frameLoadedRange.value) {
                target = frameLoadedRange.value
            }

            jumpFrame(target)
        }


        const calcLoadedFrame = computed(() => {
            let x = ((state.frame * 100) / (props.timeRange.length - 1)).toFixed(2)
            const r = `${x}%`
            return r
        })


        const maxSpeedSwitch = (() => {
            state.maxSpeedPlaying = !state.maxSpeedPlaying
        })


        watch(() => state.frame, () => {
            frameChangeLock.imageLock = true
            frameChangeLock.lidarLock = true
            frameChangeLock.playLock = true
            emit('frame-change', state.frame)
        })


        watch(() => [frameChangeLock.imageLock, frameChangeLock.lidarLock], () => {
            if (!frameChangeLock.imageLock && !frameChangeLock.lidarLock) {
                frameChangeLock.playLock = false
            } else {
                frameChangeLock.playLock = true
            }
        })


        onMounted(() => {
            frameAdaptorFRange.FramePlayerListener((data) => {
                frameLoadedRange.value = data
            })

            frameAdaptorReadyImage.FramePlayerListener((data) => {
                frameChangeLock.imageLock = false
            })

            frameAdaptorReadyLidar.FramePlayerListener((data) => {
                frameChangeLock.lidarLock = false
            })
        })




        hotkeys('space', clickToStartStop)
        hotkeys('left', prevOneFrame)
        hotkeys('right', nextOneFrame)
        hotkeys('up', upSpeed)
        hotkeys('down', downSpeed)
        hotkeys('q', maxSpeedSwitch)

        return {
            state,
            start,
            stop,
            speedChange,
            jumpFrame,
            clickFrame,
            sliderControl,
            prevOneFrame,
            nextOneFrame,

            calcLoadedFrame,
            sliderRef,
            upSpeed,
            downSpeed,

            clickToStartStop,
            frameChangeLock,
            maxSpeedSwitch,

            frameLoadedRange,

        }
    },
})
</script>

<template>
    <div class="control-frame">
        <div class="control-panel">
            <div class="speed-control">
                <!-- <el-dropdown trigger="hover">
                    <el-button type="primary">{{ state.speed }} x</el-button>
                    <template #dropdown>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click="speedChange(1)">1x</el-dropdown-item>
                            <el-dropdown-item @click="speedChange(2)">2x</el-dropdown-item>
                            <el-dropdown-item @click="speedChange(4)">4x</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown> -->
            </div>


            <div class="play-control">
                <el-button-group>
                    <el-button @click="downSpeed">
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                            <path fill="currentColor"
                                d="M529.408 149.376a29.12 29.12 0 0 1 41.728 0 30.592 30.592 0 0 1 0 42.688L259.264 511.936l311.872 319.936a30.592 30.592 0 0 1-.512 43.264 29.12 29.12 0 0 1-41.216-.512L197.76 534.272a32 32 0 0 1 0-44.672l331.648-340.224zm256 0a29.12 29.12 0 0 1 41.728 0 30.592 30.592 0 0 1 0 42.688L515.264 511.936l311.872 319.936a30.592 30.592 0 0 1-.512 43.264 29.12 29.12 0 0 1-41.216-.512L453.76 534.272a32 32 0 0 1 0-44.672l331.648-340.224z">
                            </path>
                        </svg>
                    </el-button>
                    <el-button @click="prevOneFrame">
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                            <path fill="currentColor"
                                d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.592 30.592 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.592 30.592 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0z">
                            </path>
                        </svg>
                    </el-button>
                    <el-button @click="clickToStartStop">
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                            <path fill="currentColor"
                                d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 832a384 384 0 0 0 0-768 384 384 0 0 0 0 768zm-48-247.616L668.608 512 464 375.616v272.768zm10.624-342.656 249.472 166.336a48 48 0 0 1 0 79.872L474.624 718.272A48 48 0 0 1 400 678.336V345.6a48 48 0 0 1 74.624-39.936z">
                            </path>
                        </svg>
                        <span class="ss">&nbsp;/&nbsp;</span>
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                            <path fill="currentColor"
                                d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 832a384 384 0 0 0 0-768 384 384 0 0 0 0 768zm-96-544q32 0 32 32v256q0 32-32 32t-32-32V384q0-32 32-32zm192 0q32 0 32 32v256q0 32-32 32t-32-32V384q0-32 32-32z">
                            </path>
                        </svg>
                    </el-button>
                    <el-button @click="nextOneFrame">
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                            <path fill="currentColor"
                                d="M340.864 149.312a30.592 30.592 0 0 0 0 42.752L652.736 512 340.864 831.872a30.592 30.592 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z">
                            </path>
                        </svg>
                    </el-button>
                    <el-button @click="upSpeed">
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                            <path fill="currentColor"
                                d="M452.864 149.312a29.12 29.12 0 0 1 41.728.064L826.24 489.664a32 32 0 0 1 0 44.672L494.592 874.624a29.12 29.12 0 0 1-41.728 0 30.592 30.592 0 0 1 0-42.752L764.736 512 452.864 192a30.592 30.592 0 0 1 0-42.688zm-256 0a29.12 29.12 0 0 1 41.728.064L570.24 489.664a32 32 0 0 1 0 44.672L238.592 874.624a29.12 29.12 0 0 1-41.728 0 30.592 30.592 0 0 1 0-42.752L508.736 512 196.864 192a30.592 30.592 0 0 1 0-42.688z">
                            </path>
                        </svg>
                    </el-button>
                    <el-button @click="maxSpeedSwitch">
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                            <path fill="currentColor"
                                d="M118.656 438.656a32 32 0 0 1 0-45.248L416 96l4.48-3.776A32 32 0 0 1 461.248 96l3.712 4.48a32.064 32.064 0 0 1-3.712 40.832L218.56 384H928a32 32 0 1 1 0 64H141.248a32 32 0 0 1-22.592-9.344zM64 608a32 32 0 0 1 32-32h786.752a32 32 0 0 1 22.656 54.592L608 928l-4.48 3.776a32.064 32.064 0 0 1-40.832-49.024L805.632 640H96a32 32 0 0 1-32-32z">
                            </path>
                        </svg>
                    </el-button>
                </el-button-group>
            </div>
        </div>

        <div class="info">
            Speed: x{{ state.speed }}
            <br>
            Frame: {{ state.frame }}/{{ timeRange.length - 1 }}
            <br>
            MaxSpeed: {{ state.maxSpeedPlaying }}
            <br>
            Loaded: {{ (Number(frameLoadedRange) / Number(timeRange.length - 1) * 100).toFixed(1) }}%
        </div>

        <div class="control-slider">
            <div ref="sliderRef" class="my-slider-control" @click="clickFrame">
                <div class="loaded-frame"
                    :style="{ 'display': 'inline-block', width: calcLoadedFrame, 'background-color': '#D1C4E9', height: '20px', 'border-radius': '10px' }">
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.control-frame {
    height: 62px;
    display: flex;
    margin-top: 10px;
    background-color: #f5f5f5;
    border-radius: 10px;
}

.control-slider {
    flex-grow: 1;
    height: 20px;
    margin-top: 21px;
    margin-right: 20px;
    background-color: #e0e0e0;
    position: relative;
    border-radius: 10px;
}

.control-panel {
    flex-grow: 0;
    width: 360px;
}

.speed-control {
    margin-left: 20px;
    padding-top: 10px;
    padding-bottom: 12.7px;
    display: inline-block;
}

.play-control {
    padding-top: 15px;
    display: inline-block;
}

.info {
    width: 100px;
    font-size: 12px;
    margin-left: 15px;
    margin-right: 20px;
    padding-top: 3px;
    line-height: 14px;
    display: inline;
}

.ss {
    font-size: 16px;
    line-height: 16px;
    padding-top: 1px;
    display: block;
}

svg {
    width: 1.2em;
    height: 1.2em;
}
</style>