<script>
import { defineComponent, computed, watch, ref, reactive, toRefs } from 'vue';


export default defineComponent({
    name: 'framePlayerControl',

    // 父组件传递过来的数据
    props: {
        timeRange: {
            type: Array,
            default: () => []
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


        // const colors = [
        //     { color: '#f56c6c', percentage: 0 },
        //     { color: '#e6a23c', percentage: 20 },
        //     { color: '#5cb87a', percentage: 40 },
        //     { color: '#1989fa', percentage: 60 },
        //     { color: '#6f7ad3', percentage: 80 },
        // ]


        const sliderControl = ref(null)
        const sliderRef = ref(null)
        // const format = (state.percent) => (state.percent === 100 ? 'Done' : `${state.percent}%`)

        const start = () => {
            state.isPlaying = true

            let f = 0

            console.log('start')

            const run = () => {
                let playPerFrame = 1000
                if (state.speed === 1) {
                    playPerFrame = 1000 / 10
                } else if (state.speed === 2) {
                    playPerFrame = 1000 / 20
                } else if (state.speed === 4) {
                    playPerFrame = 1000 / 40
                } else if (state.speed === 6) {
                    playPerFrame = 1000 / 60
                }

                if (state.timer) {
                    clearTimeout(state.timer)
                }

                if (state.frame < props.timeRange.length - 1) {
                    state.frame += 1
                } else {
                    // state.frame = 0
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

            console.log('stop')

            if (state.timer) {
                clearTimeout(state.timer)
            }
        }


        const reset = () => {
            stop()

            console.log('reset')

            state.frame = 0
        }


        const prevOneFrame = () => {
            stop()

            console.log('prevOneFrame')

            if (state.frame > 0) {
                state.frame -= 1
            } else {
                state.frame = props.timeRange.length - 1
            }
        }


        const nextOneFrame = () => {
            stop()

            console.log('nextOneFrame')

            if (state.frame < props.timeRange.length - 1) {
                state.frame += 1
            } else {
                state.frame = 0
            }
        }


        const speedChange = (speed) => {
            state.speed = speed
        }


        const upSpeed = () => {
            if (state.speed < 4) {
                state.speed += 2
            }
        }


        const downSpeed = () => {
            if (state.speed > 1) {
                state.speed -= 2
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
            console.log('offsetX:', offsetX, 'target:', target)
            if (target <= 2) {
                target = 0
            } else if (target >= props.timeRange.length - 2) {
                target = props.timeRange.length - 1
            }

            jumpFrame(target)
        }


        const changeColor = (percentage) => {
            if (percentage <= 20) {
                return colors[0].color
            } else if (percentage <= 40) {
                return colors[1].color
            } else if (percentage <= 60) {
                return colors[2].color
            } else if (percentage <= 80) {
                return colors[3].color
            } else {
                return colors[4].color
            }
        }


        const calcLoadedFrame = computed(() => {
            const r = `${((state.frame * 100) / (props.timeRange.length - 1)).toFixed(2)}%`
            return r
        })


        const calcNowFrame = computed(() => {
            const r = Number(((state.frame * 100) / (props.timeRange.length - 1)).toFixed(2))
            // console.log('calcNowFrame', r)
            return r
        })


        watch(() => state.frame, () => {
            calcPercent(),
                emit('frame-change', state.frame)
        })


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
            changeColor,

            calcLoadedFrame,
            calcNowFrame,
            sliderRef,

        }
    },
})
</script>

<template>
    <div>
        <div class="control-panel">
            <el-container>
                <el-aside width="350px">
                    <div class="control-panel-main">
                        <div class="speed-control">
                            <el-dropdown trigger="hover">
                                <el-button type="primary">{{ state.speed }} x</el-button>
                                <template #dropdown>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item @click="speedChange(1)">1x</el-dropdown-item>
                                        <el-dropdown-item @click="speedChange(2)">2x</el-dropdown-item>
                                        <el-dropdown-item @click="speedChange(4)">4x</el-dropdown-item>
                                        <el-dropdown-item @click="speedChange(6)">6x</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>


                        <div class="play-control">
                            <el-button-group>
                                <el-button @click="start">
                                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                                        <path fill="currentColor"
                                            d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 832a384 384 0 0 0 0-768 384 384 0 0 0 0 768zm-48-247.616L668.608 512 464 375.616v272.768zm10.624-342.656 249.472 166.336a48 48 0 0 1 0 79.872L474.624 718.272A48 48 0 0 1 400 678.336V345.6a48 48 0 0 1 74.624-39.936z">
                                        </path>
                                    </svg>
                                </el-button>
                                <el-button type="primary" @click="stop">
                                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                                        <path fill="currentColor"
                                            d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 832a384 384 0 0 0 0-768 384 384 0 0 0 0 768zm-96-544q32 0 32 32v256q0 32-32 32t-32-32V384q0-32 32-32zm192 0q32 0 32 32v256q0 32-32 32t-32-32V384q0-32 32-32z">
                                        </path>
                                    </svg>
                                </el-button>
                                <el-button type="primary" @click="reset">
                                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                                        <path fill="currentColor"
                                            d="M771.776 794.88A384 384 0 0 1 128 512h64a320 320 0 0 0 555.712 216.448H654.72a32 32 0 1 1 0-64h149.056a32 32 0 0 1 32 32v148.928a32 32 0 1 1-64 0v-50.56zM276.288 295.616h92.992a32 32 0 0 1 0 64H220.16a32 32 0 0 1-32-32V178.56a32 32 0 0 1 64 0v50.56A384 384 0 0 1 896.128 512h-64a320 320 0 0 0-555.776-216.384z">
                                        </path>
                                    </svg>
                                </el-button>
                            </el-button-group>
                        </div>

                        <div class="frame-control">
                            <el-button type="primary" @click="prevOneFrame">
                                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                                    <path fill="currentColor"
                                        d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.592 30.592 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.592 30.592 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0z">
                                    </path>
                                </svg>
                            </el-button>
                            <el-button type="primary" @click="nextOneFrame">
                                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-78e17ca8="">
                                    <path fill="currentColor"
                                        d="M340.864 149.312a30.592 30.592 0 0 0 0 42.752L652.736 512 340.864 831.872a30.592 30.592 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z">
                                    </path>
                                </svg>
                            </el-button>
                        </div>
                    </div>
                </el-aside>
                <!-- <div ref="sliderControl" class="slider-control" style="width: 50%;">
                <el-progress :percentage="Number(state.percent.toFixed(1))" :text-inside="true" :stroke-width="26"
                    :color="changeColor(state.percent)" :show-text="true" :duration="0" @click="clickFrame">
                </el-progress>
            </div> -->
                <el-main>
                    <div ref="sliderRef" class="my-slider-control" @click="clickFrame"
                        style="width: 800px; height: 20px; background-color: aquamarine; position: relative; display:block">
                        <div class="loaded-frame"
                            :style="{ 'display': 'inline-block', width: calcLoadedFrame, 'background-color': 'red', height: '20px' }">
                        </div>
                        <!-- TODO:进度条末端 -->
                        <div class="now-frame"
                            :style="{ position: 'absolute',  'display': 'inline-block', 'left': calcNowFrame+'%', height: '20px', width: '2px', 'background-color': 'green' }">
                        </div>
                    </div>
                </el-main>
            </el-container>
        </div>
    </div>
</template>

<style>
/*
.control-panel {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background-color: antiquewhite;
}

.speed-control {
    display: inline-block;
    height: 100%;
}

.play-control {
    display: inline-block;
    float: right;
}

.slider-control {
    display: inline-block;
    float: right;
}

.frame-control {
    display: inline-block;
    float: right;
}

.el-button {
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;
    padding-right: 10px;
}
*/

.speed-control,
.frame-control,
.play-control {
    display: inline-block;
    /* line-height: 60px; */
}


.el-aside {
    width: 100%;
    height: 60px;
    line-height: 60px;
    background-color: #f5f5f5;
    border-right: 2px solid #ebeef5;
}

.el-main {
    width: 100%;
    height: 60px;
    background-color: #f5f5f5;
}

svg {
    width: 1.2em;
    height: 1.2em;
}
</style>