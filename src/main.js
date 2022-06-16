import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

/**
 * TODO:
 * 1. 自适应窗口大小
 * 2. 太多emitter
 * 3. 快捷键异常
 * 4.
 * 5.
 */

createApp(App)
    .use(ElementPlus)
    .mount('#app')
