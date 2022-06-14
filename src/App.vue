<script>
import { defineComponent, ref, reactive, toRefs, onMounted } from "vue";
import framePlayerControl from './components/index.vue';
import Axios from 'axios';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import gsap from 'gsap';
// import elementResizeDetectorMaker from 'element-resize-detector';

// TODO:
// import FrameAdaptor from './components/adaptor';
// import FrameImage from './components/image';


export default defineComponent({
  // 使用该组件
  components: {
    'frame-player-control': framePlayerControl,
    // 'frame-image': FrameImage,
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


    // const position = new Float32Array

    // 获得一帧数据
    const fetchSingleData = async (timestamp) => {
      const imageResponse = await Axios.get(`/data/image_00/data/${timestamp}.png`, {
        responseType: 'blob'
      })

      const lidarResponse = await Axios.get(`/data/velodyne_points/data/${timestamp}.bin`, {
        responseType: 'arraybuffer'
      })

      // TODO:
      // FrameAdaptor.FramePlayerEmitter(URL.createObjectURL(imageResponse.data))

      state.image.src = URL.createObjectURL(imageResponse.data)
      state.image.onload = (async () => {
        canvasObj.ctx.clearRect(0, 0, canvasObj.canvas.width, canvasObj.canvas.height)
        // canvasObj.ctx.drawImage(state.image, 0, 0, canvasObj.canvas.width, canvasObj.canvas.height)
        const imageBitmap = await createImageBitmap(state.image)
        canvasObj.ctx.drawImage(imageBitmap, 0, 0, canvasObj.canvas.width, canvasObj.canvas.height)
      })

      const { position } = await parsePointCloud(lidarResponse.data)
      pointCloud.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(position, 3)
      )
      // pointCloud.geometry.setAttribute(
      //   'color',
      //   new THREE.Float32BufferAttribute(color, 3)
      // )
    }



    const pointCloudGeometry = new THREE.BufferGeometry()
    pointCloudGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3)
    )
    // const pointCloudMaterial = new THREE.PointsMaterial({
    //   // vertexColors: true,
    //   color: 0xffffff,
    //   size: 1,
    //   sizeAttenuation: false,
    // })

    const pointCloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
      },
      vertexShader: `
        varying vec3 vColor;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vColor = position;
          gl_PointSize = 1.0;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(1.0 - vColor.z / 7.0, 1.0 - sqrt(pow(vColor.x, 2.0) + pow(abs(vColor.y), 3.0)) / 60.0, 1.0, 1.0);
        }
      `
    })


    const pointCloud = new THREE.Points(pointCloudGeometry, pointCloudMaterial)
    pointCloud.geometry.attributes.position.needsUpdate = true


    // 解析点云数据 三个值一个点
    async function parsePointCloud(data) {
      const dataArray = new Float32Array(data)
      const position = new Float32Array(dataArray.length / 4 * 3)
      const color = new Float32Array(dataArray.length / 4 * 3)

      for (let i = 0, n = 0; i < dataArray.length - 1; i += 4, n++) {
        position[i - n] = dataArray[i]
        position[i - n + 1] = dataArray[i + 1]
        position[i - n + 2] = dataArray[i + 2] + 2.0
        // RGB 0到1
        // color[i - n] = 1.0 - position[i - n + 2] / 2.0
        // 另一种方案
        // color[i - n + 1] = 1.0 - Math.abs(position[i - n] / 35.0) / 2.0 - Math.abs(position[i - n + 1] / 35.0) / 2.0 - Math.abs(position[i - n + 2] / 20.0)
        // color[i - n + 1] = 1.0 - Math.sqrt(Math.abs(position[i - n]) ** 2 + Math.abs(position[i - n + 1]) ** 2) / 40.0
        // color[i - n + 2] = 0.0
      }

      return {
        position,
        // color,
      }
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





    // 挂载时，初始化数据
    onMounted(() => {
      console.log('onMounted');

      // console.log(requestAnimationFrame())

      canvasObj.canvas = document.getElementById('canvas');
      canvasObj.ctx = canvas.getContext('2d');


      // const erd = elementResizeDetectorMaker()
      // erd.listenTo(containerImage.value, () => {
      //   console.log('resize', containerImage.value.clientWidth, containerImage.value.clientHeight)
      //   canvasObj.canvas.width = containerImage.value.clientWidth
      //   canvasObj.canvas.height = containerImage.value.clientHeight
      //   canvasObj.ctx.drawImage(state.image, 0, 0, canvasObj.canvas.width, canvasObj.canvas.height)
      // })


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


      // window.onresize = () => {
      //   containerImage.value.style.width = '100%'
      //   containerImage.value.style.height = '100%'
      //   console.log('resize window', containerImage.value.clientWidth, containerImage.value.clientHeight)
      //   canvasObj.ctx.clearRect(0, 0, canvasObj.canvas.width, canvasObj.canvas.height)
      //   canvasObj.canvas.width = containerImage.value.clientWidth
      //   canvasObj.canvas.height = containerImage.value.clientHeight
      //   console.log('canvas', canvasObj.canvas.width, canvasObj.canvas.height)
      //   canvasObj.ctx.drawImage(state.image, 0, 0, canvasObj.canvas.width, canvasObj.canvas.height)
      // }


      // 性能监视
      const stats = new Stats();
      stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(stats.dom);



      



      // 初始化点云及控制器
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(containerLidar.value.clientWidth, containerLidar.value.clientHeight);
      containerLidar.value.appendChild(renderer.domElement);

      const controls = new TrackballControls(camera, renderer.domElement);
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
      scene.add(pointCloud);

      camera.position.z = 60;

      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        stats.update();
        renderer.render(scene, camera);
      }
      animate();



      // GUI
      const EView = {
        viewA: 'viewA',
        viewB: 'viewB',
      }
      const gui = new GUI();
      const settings = {
        visual: EView.viewA,
      }
      gui.add(settings, 'visual', [EView.viewA, EView.viewB]).listen().onChange((view) => {
        if (view === EView.viewA) {
          // camera.position.set(0, 0, 60);
          // controls.target.set(0, 0, 0);
          // camera.up.set(0, 1, 0);
          gsap.to(camera.position, {x: 0, y: 0, z: 60, duration: 1})
          gsap.to(controls.target, {x: 0, y: 0, z: 0, duration: 1})
          gsap.to(camera.up, {x: 0, y: 1, z: 0, duration: 1})
        } else {
          // camera.position.set(-5, 0, 5);
          // controls.target.set(20, 0, 0);
          // camera.up.set(0, 0, 1);
          gsap.to(camera.position, {x: -5, y: 0, z: 5, duration: 1})
          gsap.to(controls.target, {x: 5, y: 0, z: 0, duration: 1})
          gsap.to(camera.up, {x: 0, y: 0, z: 1, duration: 1})
        }
      })



      // 开始获取数据
      fetchSingleData(timeRange[0])
    });

    return {
      ...toRefs(state),
      timeRange,
      canvasObj,
      frameChangeHandler,
      containerLidar,
      containerImage,
      // position,
    }
  },
});
</script>


<template>
  <div class="main-page">
    <div class="container">
      <div ref="containerLidar" class="container-lidar"></div>
      <div ref="containerImage" class="container-image">
        <canvas id="canvas" @onload="successOnloadHandler"></canvas>
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
  flex: 0 0 630px;
  margin-right: 17px;
  height: 630px;
}

.container-lidar .canvas {
  width: 100%;
  height: 100%;
}

.container-image {
  flex: 1 1 auto;
  height: 480px;

  /* background-color: #ff6700; */
}
</style>
