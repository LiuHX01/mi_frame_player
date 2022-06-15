<script>
import { defineComponent, computed, watch, ref, reactive, toRefs, onMounted } from 'vue';
import { frameAdaptorFRange } from './adaptor.js';
import hotkeys from 'hotkeys-js'

export default defineComponent({
    name: 'framePlayerControl',

    // 父组件传递过来的数据
    props: {
        timeRange: {
            type: Array,
            default: () => [],
        },

        locked: {
            type: Boolean,
            default: () => false,
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
            percent: 0.0,
        })


        let frameLoadedRange = ref(0)


        const sliderControl = ref(null)
        const sliderRef = ref(null)

        const { disabled } = toRefs(props)

        const start = () => {
            state.isPlaying = true

            let f = 0

            // console.log('start')

            const run = () => {
                // console.log(props.frameLoadedRange)
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

                if (state.frame < props.timeRange.length - 1) {
                    if (frameLoadedRange.value < state.frame + 1) {
                        f = 1
                        stop()
                    } else {
                        state.frame += 1
                    }
                } else {
                    state.frame = 0
                    f = 1
                }

                if (f === 0) {
                    state.timer = setTimeout(() => {
                        run()
                    }, playPerFrame)
                } else {
                    stop()
                }

                return ''
            }
            run()
        }


        const stop = () => {
            state.isPlaying = false

            // console.log('stop')

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


        const reset = () => {
            stop()

            // console.log('reset')

            state.frame = 0
        }


        const prevOneFrame = () => {
            stop()

            if (state.frame > 0) {
                state.frame -= 1
            } else {
                if (props.timeRange.length - 1 === frameLoadedRange.value) {
                    state.frame = props.timeRange.length - 1
                }
            }
        }


        const nextOneFrame = () => {
            stop()

            if (state.frame < props.timeRange.length - 1) {
                if (frameLoadedRange.value >= state.frame + 1) {
                    state.frame += 1
                }
            } else {
                state.frame = 0
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


        const calcPercent = () => {
            state.percent = (state.frame / (props.timeRange.length - 1)) * 100
        }


        const jumpFrame = (frame) => {
            stop()
            state.frame = frame
        }


        const clickFrame = ($event) => {
            const { offsetX } = $event

            let target = Math.ceil((offsetX / sliderRef.value.clientWidth) * (props.timeRange.length))
            // console.log('offsetX:', offsetX, 'target:', target)

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


        const calcNowFrame = computed(() => {
            let r = Number(((state.frame * 100) / (props.timeRange.length - 1)).toFixed(2))
            return r
        })


        watch(() => state.frame, () => {
            // calcPercent(),
            emit('frame-change', state.frame)
        })


        onMounted(() => {
            frameAdaptorFRange.FramePlayerListener((data) => {
                frameLoadedRange.value = data
            })
        })


        hotkeys('space', clickToStartStop)
        hotkeys('left', prevOneFrame)
        hotkeys('right', nextOneFrame)
        hotkeys('up', upSpeed)
        hotkeys('down', downSpeed)

        return {
            state,
            start,
            stop,
            speedChange,
            reset,
            jumpFrame,
            clickFrame,
            sliderControl,
            prevOneFrame,
            nextOneFrame,

            calcLoadedFrame,
            calcNowFrame,
            sliderRef,
            upSpeed,
            downSpeed,

            clickToStartStop,
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
                </el-button-group>
            </div>
        </div>

        <div class="info">
            Speed: x{{ state.speed }}
            <br>
            Frame: {{ state.frame }}/{{ timeRange.length - 1 }}
        </div>

        <div class="control-slider">
            <div ref="sliderRef" class="my-slider-control" @click="clickFrame">
                <div class="loaded-frame"
                    :style="{ 'display': 'inline-block', width: calcLoadedFrame, 'background-color': '#B39DDB', height: '20px', 'border-radius': '10px' }">
                </div>
                <!-- TODO:进度条末端 -->
                <!-- <div class="now-frame"
                    :style="{ position: 'absolute', 'display': 'inline-block', 'left': calcNowFrame + '%', height: '20px', width: '5px', 'background-color': '#fff'}">
                </div> -->
            </div>
        </div>
    </div>
</template>

<style>
.control-frame {
    height: 58px;
    display: flex;
    margin-top: 10px;
    background-color: #f5f5f5;
    border-radius: 10px;
}

.control-slider {
    flex-grow: 1;
    height: 20px;
    margin-top: 18px;
    margin-right: 20px;
    background-color: #e0e0e0;
    position: relative;
    border-radius: 10px;
}

.control-panel {
    flex-grow: 0;
    width: 310px;
}

.speed-control {
    margin-left: 20px;
    padding-top: 10px;
    padding-bottom: 12.7px;
    display: inline-block;
}

.play-control {
    padding-top: 13px;
    display: inline-block;
}

.info {
    width: 90px;
    font-size: 8px;
    margin-left: 15px;
    margin-right: 20px;
    padding-top: 5px;
    line-height: 23px;
    display: inline-block;
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