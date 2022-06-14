<script>
import { defineComponent, onMounted, ref } from "vue";
import FrameAdaptor from './adaptor'
import emit from 'emit'

export default defineComponent({
    name: 'frame-image',
    setup() {
        const image = ref('')

        const frameAdaptor = new FrameAdaptor()

        
        // <frame-image @image-success></frame-image>
        // const successOnloadHandler = () => {
        //     emit('image-success')
        // }

        const successOnloadHandler = () => {
            console.log('image-success')
            frameAdaptor.FramePlayerListener((data) => {
                image.value = data
            })
        }

        onMounted(() => {
            frameAdaptor.FrameOnloadEmitter((data) => {
                image.value = data
            })
        })

        return {
            image
        }

    }
})
</script>

<template>
    <img :src="image" alt="" @onload="successOnloadHandler">
</template>

<style>
</style>