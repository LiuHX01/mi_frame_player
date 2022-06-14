import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

/**
 * TODO:
 * 1. Canvas 适应窗口大小只能放大，不能缩小
 * 2. Canvas 图片性能？
 */


/**
 * 用 mitt
 * 点云 组件 观察者
 * 图片 组件 观察者
 * 控制条 传出数据
 * 
 * 开始播放
 * 数据请求
 * 请求到之后 触发 emitter
 * image lidar 各自处理 listen到的数据
 * load好之后回传给控制条？
 */

createApp(App)
    .use(ElementPlus)
    .mount('#app')
