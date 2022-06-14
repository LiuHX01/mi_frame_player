<script>
import { defineComponent, ref, reactive, toRefs, onMounted } from "vue";
import framePlayerControl from './components/index.vue';
import Axios from 'axios';
import { frameAdaptorImage, frameAdaptorLidar, frameAdaptorReady } from './components/adaptor.js';
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



    const fetchSingleData = async (timestamp) => {
      console.log('fetchSingleData', timestamp)
      const imageResponse = await Axios.get(`/data/image_00/data/${timestamp}.png`, {
        responseType: 'arraybuffer',
      })

      const lidarResponse = await Axios.get(`/data/velodyne_points/data/${timestamp}.bin`, {
        responseType: 'arraybuffer'
      })

      frameAdaptorImage.FramePlayerEmitter(imageResponse.data)
      frameAdaptorLidar.FramePlayerEmitter(lidarResponse.data)
    }




    // 当帧变化时，更新数据
    const frameChangeHandler = (frame) => {
      console.log('frameChangeHandler', frame)
      // TODO:
      // state.frameReady = true

      // watch([...state, frameReady], () => {
      //   state = false
      //   fetchSingleData()
      // })

      fetchSingleData(timeRange[frame])
    }





    // 挂载时，初始化数据
    onMounted(() => {
      console.log('onMounted');

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
      fetchSingleData(timeRange[0])
    });

    return {
      timeRange,
      frameChangeHandler,
      fetchSingleData,

    }
  },
});
</script>


<template>
  <div class="main-page">
    <div class="container">
      <div class="container-lidar">
        <frame-lidar></frame-lidar>
      </div>
      <div class="container-image">
        <frame-image></frame-image>
      </div>
    </div>
    <div>
      <frame-player-control class="player-control" :timeRange="timeRange" @frame-change="frameChangeHandler">
      </frame-player-control>
    </div>
  </div>
</template>


<style>
.main-page {
  min-width: 1200px;
  width: 100%;
  height: auto;
  background-color: #030303;
}

.container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  /* border: 1px solid rgb(255, 0, 0); */
}

.container-lidar {
  flex: 0 0 400px;
  margin-right: 17px;
  height: 400px;
  border: 2px solid rgb(41, 39, 39);
}

.container-lidar .canvas {
  width: 0%;
  height: 0%;

}

.container-image {
  flex: 1 1 auto;
  height: 630px;
  border: 2px solid rgb(41, 39, 39);
  /* background-color: #ff6700; */
}
</style>
