<script>
import { defineComponent, ref, reactive, onMounted, watch } from "vue";
import framePlayerControl from './components/index.vue';
import Axios from 'axios';
import { frameAdaptorImage, frameAdaptorLidar, frameAdaptorFRange } from './components/adaptor.js';
import FrameImage from './components/image.vue';
import FrameLidar from './components/lidar.vue';


export default defineComponent({
  // 使用以下组件
  components: {
    'frame-player-control': framePlayerControl,
    'frame-image': FrameImage,
    'frame-lidar': FrameLidar,
  },


  setup() {
    // 文件名集合
    const getAllImageName = () => {
      const timeRange = []
      for (let i = 0; i <= 107; i++) {
        timeRange.push(('0000000000' + i).slice(-10))
      }
      return timeRange
    }
    const timeRange = getAllImageName()


    // 预加载帧数 及 存放位置
    let frameLoaded = ref(1)
    const imageMap = reactive(new Map())
    const lidarMap = reactive(new Map())
    const bitmapMap = reactive(new Map())


    // blob 转化 bitmap 用
    const worker = new Worker('/worker.js')


    // 从已有内容中发送
    const fetchSingleData = (timestamp) => {
      frameAdaptorImage.FramePlayerEmitter([imageMap.get(timestamp), bitmapMap.get(timestamp)])
      frameAdaptorLidar.FramePlayerEmitter(lidarMap.get(timestamp))
    }


    // 帧变化时触发
    const frameChangeHandler = (frame) => {
      fetchSingleData(timeRange[frame])
    }


    // 三者最小值 即image，lidar，bitmap均已加载的帧数
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


    // 预加载
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
        lidarMap.set(timestamp, lidarResponse.data)

        // 第0帧特殊处理 若给worker可能等不及回传
        if (timestamp === timeRange[0]) {
          const frameZeroBitmap = await createImageBitmap(imageResponse.data)
          bitmapMap.set(timestamp, frameZeroBitmap)
          fetchSingleData(timeRange[0])
        }
      }
    }


    // 挂载时触发
    onMounted(() => {
      worker.addEventListener('message', (e) => {
        bitmapMap.set(e.data[0], e.data[1])
      })

      preLoadData()
    });



    return {
      timeRange,
      frameChangeHandler,
    }
  },
});
</script>


<template>
  <div class="main-page">
    <div class="container">
      <frame-lidar></frame-lidar>
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
