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

        // const format = (state.percent) => (state.percent === 100 ? 'Done' : `${state.percent}%`)

        const start = () => {
            state.isPlaying = true

            console.log('start')

            const run = () => {
                let playPerFrame = 100
                if (state.speed === 1) {
                    playPerFrame = 100
                } else if (state.speed === 2) {
                    playPerFrame = 50
                } else if (state.speed === 4) {
                    playPerFrame = 10
                }

                if (state.timer) {
                    clearTimeout(state.timer)
                }

                if (state.frame < props.timeRange.length - 1) {
                    state.frame += 1
                } else {
                    state.frame = 0
                }

                state.timer = setTimeout(() => {
                    run()
                }, playPerFrame)

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


        const speedChange = (speed) => {
            state.speed = speed
        }


        const calcPercent = () => {
            state.percent = (state.frame / props.timeRange.length) * 100
        }


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
        }
    },
})
</script>

<template>
    <div>
        <div class="control-panel">
            <el-container>
                <el-header>
                    <div class="slider-control" style="width: 100%;">
                        <el-progress :percentage="Number(state.percent.toFixed(1))"></el-progress>
                    </div>
                </el-header>

                <el-main>
                    <div class="play-control">
                        <el-button-group>
                            <el-button type="primary" @click="start">
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

                    <div class="speed-control">
                        <el-dropdown trigger="hover">
                            <el-button type="primary">{{ state.speed }} x</el-button>
                            <template #dropdown>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item @click="speedChange(1)">1x</el-dropdown-item>
                                    <el-dropdown-item @click="speedChange(2)">2x</el-dropdown-item>
                                    <el-dropdown-item @click="speedChange(4)">4x</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </el-main>
            </el-container>
        </div>
    </div>
</template>

<style>
.control-panel {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background-color: antiquewhite;
}

.play-control .el-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;
    padding-right: 10px;
}

.play-control .el-button svg {
    width: 1.2em;
    height: 1.2em;
}
</style>