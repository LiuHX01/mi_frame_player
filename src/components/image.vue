<script>
import { defineComponent, onMounted, ref, reactive } from "vue";
import { frameAdaptorImage, frameAdaptorReadyImage } from './adaptor.js'


export default defineComponent({
    name: 'FrameImage',
    setup() {
        const image = reactive(new Image())
        const containerImage = ref(null)


        onMounted(() => {
            const canvas = document.getElementById('canvas')
            const ctx = canvas.getContext('2d')

            // 收到 app 传来的 图片数据
            frameAdaptorImage.FramePlayerListener((data) => {
                image.src = URL.createObjectURL(data[0])
      
                // 画上bitmap 并通知 control
                image.onload = () => {
                    canvas.width = containerImage.value.clientWidth
                    canvas.height = containerImage.value.clientHeight
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    ctx.drawImage(data[1], 0, 0, canvas.width, canvas.height)
                    frameAdaptorReadyImage.FramePlayerEmitter()
                }
            })
        })

        return {
            containerImage,
        }

    }
})
</script>

<template>
    <div ref="containerImage" class="container-image">
        <canvas id="canvas"></canvas>
    </div>
</template>

<style>
.container-image {
    flex-grow: 1;
    height: 600px;
    margin-left: 10px;
}

.container-image canvas {
    border-radius: 20px;

}
</style>