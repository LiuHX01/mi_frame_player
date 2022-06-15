import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

/**
 * TODO:
 * 1. 自适应窗口大小
 * 2. Canvas 图片性能
 * 3. 太多emitter
 * 
 */

createApp(App)
    .use(ElementPlus)
    .mount('#app')
