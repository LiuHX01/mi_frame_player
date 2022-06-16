import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

/**
 * TODO:
 * 1. 自适应窗口大小
 * 2. 太多emitter
 * 3. 快捷键异常
 * 4. 点云渲染完成时机
 * 5. 有必要给点云worker吗
 * 6. 预加载时播放 下一个25ms / 暂停
 */

createApp(App)
    .use(ElementPlus)
    .mount('#app')
