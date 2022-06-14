<script>
import { defineComponent, nextTick, onMounted, ref } from "vue";
import { frameAdaptorImage } from './adaptor.js'

export default defineComponent({
    name: 'FrameImage',
    setup() {
        const image = ref('')


        const arrayBufferToBase64 = (arrayBuffer) => {
            let binary = '';
            let bytes = new Uint8Array(arrayBuffer);
            let len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }


        onMounted(() => {
            frameAdaptorImage.FramePlayerListener((data) => {
                
                image.value = `data:image/png;base64,${arrayBufferToBase64(data)}`
            })
        })

        return {
            image,
        }

    }
})
</script>

<template>
    <img :src="image" alt="">
</template>

<style>
</style>