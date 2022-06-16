<script>
import { defineComponent, ref, reactive, toRefs, onMounted, watch } from "vue";
import framePlayerControl from './components/index.vue';
import Axios from 'axios';
import { frameAdaptorImage, frameAdaptorLidar, frameAdaptorFRange } from './components/adaptor.js';
import FrameImage from './components/image.vue';
import FrameLidar from './components/lidar.vue';


export default defineComponent({
  // 使用该组件
  components: {
    'frame-player-control': framePlayerControl,
    'frame-image': FrameImage,
    'frame-lidar': FrameLidar,
  },



  setup() {
    // 获得图片名集合
    const getAllImageName = () => {
      const timeRange = []
      for (let i = 0; i <= 107; i++) {
        timeRange.push(('0000000000' + i).slice(-10))
      }
      return timeRange
    }
    const timeRange = getAllImageName()


    let frameLoaded = ref(1)


    const imageMap = reactive(new Map())
    const lidarMap = reactive(new Map())
    const bitmapMap = reactive(new Map())
    // let imLen = ref(0)
    // let lmLen = ref(0)
    // let bmLen = ref(0)


    const worker = new Worker('/worker.js')


    const fetchSingleData = (timestamp) => {
      // console.log('[data]: fetching data', timestamp)
      // const fetchSingleData = async (timestamp) => {
      // const imageResponse = await Axios.get(`/data/image_00/data/${timestamp}.png`, {
      //   responseType: 'blob',
      // })

      // const lidarResponse = await Axios.get(`/data/velodyne_points/data/${timestamp}.bin`, {
      //   responseType: 'arraybuffer'
      // })
      // console.log(imageMap, lidarMap)
      // console.log(imageMap.get(timestamp), bitmapMap.get(timestamp))
      frameAdaptorImage.FramePlayerEmitter([imageMap.get(timestamp), bitmapMap.get(timestamp)])
      frameAdaptorLidar.FramePlayerEmitter(lidarMap.get(timestamp))
    }




    // 当帧变化时，更新数据
    const frameChangeHandler = (frame) => {
      // TODO:
      // state.frameReady = true

      // watch([...state, frameReady], () => {
      //   state = false
      //   fetchSingleData()
      // })

      fetchSingleData(timeRange[frame])
    }



    // watch(() => [imLen.value, bmLen.value, lmLen.value], () => {
    //   if (imLen.value > bmLen.value) {
    //     if (bmLen.value > lmLen.value) {
    //       frameLoaded.value = lmLen.value
    //     } else {
    //       frameLoaded.value = bmLen.value
    //     }
    //   } else { // im <
    //     if (imLen.value > lmLen.value) {
    //       frameLoaded.value = lmLen.value
    //     } else {
    //       frameLoaded.value = imLen.value
    //     }
    //   }

    //   frameLoaded.value--

    //   frameAdaptorFRange.FramePlayerEmitter(frameLoaded.value)
    // })


    watch(() => [imageMap.size, lidarMap.size, bitmapMap.size], () => {
      if (imageMap.size > bitmapMap.size) {
        if (bitmapMap.size > lidarMap.size) {
          frameLoaded.value = lidarMap.size
        } else {
          frameLoaded.value = bitmapMap.size
        }
      } else { // im <
        if (imageMap.size > lidarMap.size) {
          frameLoaded.value = lidarMap.size
        } else {
          frameLoaded.value = imageMap.size
        }
      }
      
      frameLoaded.value--

      frameAdaptorFRange.FramePlayerEmitter(frameLoaded.value)
    })



    const preLoadData = async () => {
      for (let i = 0; i < timeRange.length; i++) {
        const timestamp = timeRange[i]
        const imageResponse = await Axios.get(`/data/image_00/data/${timestamp}.png`, {
          responseType: 'blob',
        })

        worker.postMessage([timestamp, imageResponse.data])

        const lidarResponse = await Axios.get(`/data/velodyne_points/data/${timestamp}.bin`, {
          responseType: 'arraybuffer'
        })

        imageMap.set(timestamp, imageResponse.data)
        // imLen.value = imageMap.size
        lidarMap.set(timestamp, lidarResponse.data)
        // lmLen.value = lidarMap.size





        if (timestamp === timeRange[0]) {
          const frameZeroBitmap = await createImageBitmap(imageResponse.data)
          bitmapMap.set(timestamp, frameZeroBitmap)
          // bmLen.value = bitmapMap.size
          fetchSingleData(timeRange[0])
        }


      }
    }



    // 挂载时，初始化数据
    onMounted(() => {

      // console.log(requestAnimationFrame())


      // TODO:
      // frameAdaptor.FramePlayerListener((data) => {
      //   image.loadStatueImage = true
      // })
      // frameAdaptor.FramePlayerListener((data) => {
      //   image.loadStatueLidar = true
      // })
      // watch([...state], () => {
      //   state = false
      //   fetchSingleData()
      // })
      //
      // nextTick(() => {
      // listener
      // })
      // 开始获取数据

      worker.addEventListener('message', (e) => {
        bitmapMap.set(e.data[0], e.data[1])
        // bmLen.value = bitmapMap.size
      })

      preLoadData()
      // console.log('Done', imageMap, lidarMap, bitmapMap)

    });

    return {
      timeRange,
      frameChangeHandler,
      fetchSingleData,

      frameLoaded,
      imageMap,
      lidarMap,
      bitmapMap,
      // imLen,
      // lmLen,
      // bmLen,
      worker,

    }
  },
});
</script>


<template>
  <div class="main-page">
    <div class="container">
      <frame-lidar></frame-lidar>
      <!-- <frame-lidar></frame-lidar> -->
      <frame-image></frame-image>
    </div>
    <div>
      <frame-player-control class="player-control" :timeRange="timeRange" @frame-change="frameChangeHandler">
      </frame-player-control>
    </div>
  </div>
</template>


<style>
.main-page {
  min-width: 1024px;
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 20px;
}
</style>
