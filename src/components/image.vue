<script>
import { defineComponent, nextTick, onMounted, ref, reactive } from "vue";
import { frameAdaptorImage, frameAdaptorReadyImage } from './adaptor.js'

export default defineComponent({
    name: 'FrameImage',
    setup() {
        const image = reactive(new Image())
        const containerImage = ref(null)

        // const worker = new Worker('/worker.js')


        onMounted(() => {
            const canvas = document.getElementById('canvas')
            const ctx = canvas.getContext('2d')

            frameAdaptorImage.FramePlayerListener((data) => {
                image.src = URL.createObjectURL(data[0])
                // const bitmapImage = data[1]
                // worker.postMessage(data)
                // worker.addEventListener('message', (e) => {
                //     bm = e.data  
                // })                
                image.onload = () => {
                    canvas.width = containerImage.value.clientWidth
                    canvas.height = containerImage.value.clientHeight
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    // console.log(typeof data[1])
                    ctx.drawImage(data[1], 0, 0, canvas.width, canvas.height)
                    frameAdaptorReadyImage.FramePlayerEmitter(1)
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