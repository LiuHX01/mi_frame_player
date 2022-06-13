import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

/**
 * TODO:
 * 1. Canvas 适应窗口大小只能放大，不能缩小
 * 2. Canvas 图片性能？
 */

createApp(App)
    .use(ElementPlus)
    .mount('#app')
