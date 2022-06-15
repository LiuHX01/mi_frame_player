<script>
import { defineComponent, nextTick, onMounted, ref, reactive } from "vue";
import { frameAdaptorImage } from './adaptor.js'

export default defineComponent({
    name: 'FrameImage',
    setup() {
        const image = reactive(new Image())
        const containerImage = ref(null)



        const bitmapWorker = new Worker('../../../worker.js')
        console.log(bitmapWorker)


        onMounted(() => {
            const canvas = document.getElementById('canvas')
            const ctx = canvas.getContext('2d')

            bitmapWorker.postMessage('hello')

            frameAdaptorImage.FramePlayerListener((data) => {
                image.src = URL.createObjectURL(data)
                // const imageBitmap = createImageBitmap(image)
                // image.src = data
                image.onload = () => {
                    canvas.width = containerImage.value.clientWidth
                    canvas.height = containerImage.value.clientHeight
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    // ctx.drawImage(imageBitmap, 0, 0)
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
                }
            })
        })

        return {
            image,
            containerImage,
        }

    }
})
</script>

<template>
    <div ref="containerImage" class="container-image">
        <canvas id="canvas"></canvas>
        <!-- <img :src="image" alt=""> -->
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