<script>
import { defineComponent, onMounted, ref } from "vue";
import { frameAdaptorLidar, frameAdaptorReadyLidar } from './adaptor.js'
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import gsap from 'gsap';


export default defineComponent({
    name: 'FrameLidar',
    setup() {
        const lidar = ref([])
        const containerLidar = ref(null)


        // 物体：点集
        const pointCloudGeometry = new THREE.BufferGeometry()
        pointCloudGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3)
        )

        // 材质：大小 渐变颜色
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
                gl_FragColor = vec4(1.0 - vColor.z / 7.0,
                                    1.0 - sqrt(pow(abs(vColor.x), 2.0) + pow(abs(vColor.y), 3.0)) / 70.0,
                                    1.0,
                                    1.0
                                    );
                }
            `
        })

        const pointCloud = new THREE.Points(pointCloudGeometry, pointCloudMaterial)
        pointCloud.geometry.attributes.position.needsUpdate = true


        // 解析数据
        async function parsePointCloud(data) {
            const dataArray = new Float32Array(data)
            const position = new Float32Array(dataArray.length / 4 * 3)
            for (let i = 0, n = 0; i < dataArray.length - 1; i += 4, n++) {
                position[i - n] = dataArray[i]
                position[i - n + 1] = dataArray[i + 1]
                position[i - n + 2] = dataArray[i + 2] + 2.0
            }
            return {
                position,
            }
        }




        onMounted(() => {
            // 性能监视器
            const stats = new Stats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(stats.dom);


            // THREE.js 三要素
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(containerLidar.value.clientWidth, containerLidar.value.clientHeight);
            containerLidar.value.appendChild(renderer.domElement);


            // 鼠标控制和坐标轴
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
                viewA: 'overlook',
                viewB: 'car roof',
            }
            const gui = new GUI();
            const settings = {
                visual: EView.viewA,
            }
            gui.add(settings, 'visual', [EView.viewA, EView.viewB]).listen().onChange((view) => {
                if (view === EView.viewA) {
                    gsap.to(camera.position, { x: 0, y: 0, z: 60, duration: 1 })
                    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1 })
                    gsap.to(camera.up, { x: 0, y: 1, z: 0, duration: 1 })
                } else {
                    gsap.to(camera.position, { x: -5, y: 0, z: 5, duration: 1 })
                    gsap.to(controls.target, { x: 5, y: 0, z: 0, duration: 1 })
                    gsap.to(camera.up, { x: 0, y: 0, z: 1, duration: 1 })
                }
            })


            // 收到 app 传来的 数据
            frameAdaptorLidar.FramePlayerListener(async (data) => {
                lidar.value = data
                const { position } = await parsePointCloud(lidar.value)
                pointCloud.geometry.setAttribute(
                    'position',
                    new THREE.Float32BufferAttribute(position, 3)
                )
                frameAdaptorReadyLidar.FramePlayerEmitter()
            })
        })

        return {
            containerLidar,
        }
    }
})
</script>

<template>
    <div ref="containerLidar" class="container-lidar"></div>
</template>

<style>
.container-lidar {
    flex-grow: 0;
    width: 600px;
    min-width: 600px;
    height: 600px;
}

.container-lidar canvas {
    border-radius: 20px;

}
</style>