<script>
import { defineComponent, ref, reactive, toRefs, onMounted, onUnmounted, watch, onBeforeMount } from "vue";
import framePlayerControl from './components/index.vue';
import Axios from 'axios';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import elementResizeDetectorMaker from 'element-resize-detector';



export default defineComponent({
  // 使用该组件
  components: {
    'frame-player-control': framePlayerControl
  },


  setup() {
    const containerLidar = ref(null)
    const containerImage = ref(null)

    const state = reactive({
      lidar: [],
      image: new Image,
    })

    const canvasObj = reactive({
      canvas: null,
      ctx: null,
    })


    // 获得图片名集合
    const getAllImageName = () => {
      const timeRange = []
      for (let i = 0; i <= 107; i++) {
        timeRange.push(('0000000000' + i).slice(-10))
      }
      return timeRange
    }
    const timeRange = getAllImageName()


    // 获得一帧数据
    const fetchSingleData = async (timestamp) => {
      const imageResponse = await Axios.get(`/data/image_00/data/${timestamp}.png`, {
        responseType: 'blob'
      })

      const lidarResponse = await Axios.get(`/data/velodyne_points/data/${timestamp}.bin`, {
        responseType: 'arraybuffer'
      })

      state.image.src = blobToCanvasImg(imageResponse.data)
      state.image.onload = function () {
        canvasObj.ctx.clearRect(0, 0, canvasObj.canvas.width, canvasObj.canvas.height)
        console.log(canvasObj.canvas.width, canvasObj.canvas.height)
        canvasObj.ctx.drawImage(state.image, 0, 0, canvasObj.canvas.width, canvasObj.canvas.height)
      }

      const { position } = await parsePointCloud(lidarResponse.data)
      pointCloud.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(position, 3)
      )
    }

    // 得到的数据转换为canvas图
    const blobToCanvasImg = (blob) => {
      const url = URL.createObjectURL(blob)
      return url
    }


    const pointCloudGeometry = new THREE.BufferGeometry()
    pointCloudGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3)
    )
    const pointCloudMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      sizeAttenuation: false,
    })
    const pointCloud = new THREE.Points(pointCloudGeometry, pointCloudMaterial)
    pointCloud.geometry.attributes.position.needsUpdate = true

    async function parsePointCloud(data) {
      const dataArray = new Float32Array(data)
      const position = new Float32Array(dataArray.length / 4 * 3)

      for (let i = 0, n = 0; i < dataArray.length - 1; i += 4, n++) {
        position[i - n] = dataArray[i]
        position[i - n + 1] = dataArray[i + 1]
        position[i - n + 2] = dataArray[i + 2]
      }

      return {
        position,
      }
    }

    // 当帧变化时，更新数据
    const frameChangeHandler = (frame) => {
      fetchSingleData(timeRange[frame])
    }





    // 挂载时，初始化数据
    onMounted(() => {
      console.log('onMounted');

      canvasObj.canvas = document.getElementById('canvas');
      canvasObj.ctx = canvas.getContext('2d');


      const erd = elementResizeDetectorMaker()
      erd.listenTo(containerImage.value, () => {
        console.log('resize', containerImage.value.clientWidth, containerImage.value.clientHeight)
        canvasObj.canvas.width = containerImage.value.clientWidth
        canvasObj.canvas.height = containerImage.value.clientHeight
        canvasObj.ctx.drawImage(state.image, 0, 0, canvasObj.canvas.width, canvasObj.canvas.height)
      })


      const stats = new Stats();
      stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(stats.dom);



      console.log(containerLidar.value.clientHeight);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(containerLidar.value.clientWidth, containerLidar.value.clientHeight);
      containerLidar.value.appendChild(renderer.domElement);

      const controls = new TrackballControls(camera, renderer.domElement);
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
      scene.add(pointCloud);

      camera.position.z = 5;

      function animate() {
        requestAnimationFrame(animate);
        controls.update();

        stats.update();

        renderer.render(scene, camera);
      }
      animate();


      fetchSingleData(timeRange[0])

    });

    return {
      ...toRefs(state),
      timeRange,
      canvasObj,
      frameChangeHandler,
      containerLidar,
      containerImage,
    }
  },
});
</script>


<template>
  <div class="main-page">
    <div class="container">
      <div ref="containerLidar" class="container-lidar"></div>
      <div ref="containerImage" class="container-image">
        <canvas id="canvas"></canvas>
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
  /* display: flex; */
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  flex: 0 0 480px;
  margin-right: 17px;
  height: 480px;
}

.container-lidar .canvas {
  width: 100%;
  height: 100%;
}

.container-image {
  flex: 1;
  height: 480px;
}
</style>
