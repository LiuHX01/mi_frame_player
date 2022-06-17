# 启动、运行、构建
**npm i**

**npm run dev**

**npm run build**


# 项目说明
worker.js只有放在根目录才能跑（不理解）
## 1、页面部分
- 图片容器（每次onload时自适应大小）
- 点云容器（固定大小，页面尺寸变化时由图片改变）
- 播放控制器
    - 按钮分别为：减速，后退一帧，开始/暂停，前进一帧，加速，开启/关闭requestAnimationFrame渲染按钮
    - 进度条，长度自适应页面，支持点击跳转（受到已加载帧数限制）
    - 显示速度，当前帧，是否开启requestAnimationFrame渲染，已加载数据量
## 2、交互部分
- 支持基础交互（播放、前进等），网络下载器，组件化，图片与点云渲染对应等
- setTimeout递归播放
- 使用订阅发布进行通信，将图片和点云当作单独的组件
- 使用Canvas渲染bitmap图片
- 使用数据预加载和内存管理代替逐帧下载，onMount时开始下载数据并存入Map
    - 预加载时，即时刷新已加载帧数值，并传递给控制条部分
    - 高倍速播放时，若下一帧未加载，不做处理并进入下一次递归，直到该帧加载完成并播放（因此打开页面立即4倍速播放/最大刷新率播放可能会不流畅，预加载完成后不会）
    - 进度条点击跳转时，若目标帧未加载，会跳转到已加载的最大帧
    - 前进/后退一帧时，若目标帧未加载，不会前进/后退
    - 加载第一帧后直接渲染，保证初始有图像
- 播放器锁
    - 对于帧改变（和随之而来的fetch数据）进行锁限制
    - frame改变->lock->fetch数据->image和lidar渲染完成->unlock->frame改变
    - 解锁时不会自动改变frame
- 倍速播放，支持requestAnimationFrame渲染
    - 按钮组最后一个按钮为开启/关闭requestAnimationFrame渲染按钮，控制条MaxSpeed显示开关状态
    - 开启时，无视当前1/2/4倍速度和速度改变，关闭后，以1/2/4倍速度进行播放
    - 开启时，开始/暂停，前进/后退，进度条点击功能正常
    - 75Hz显示器运行正常
- 支持快捷键
    - “左”后退一帧，“右”前进一帧，“上”加速，“下”减速，“q”开启/关闭requestAnimationFrame渲染，“e”播放/暂停
## 3、可视化部分
- 点云，相机渲染，连续更新，使用shader
- 控制器，GUI场景交互，FPS监控
- WebGL渲染图片
- worker进行imageBitmap图像转换
    - 预加载时传给worker，转换imageBitmap，再回传给主进程
    - 主进程listen，将得到的bitmap存入Map，等待使用
    - 第一帧在主进程进行图像转换，避免来不及等待传回就已渲染
- 点云颜色
    - 根据中心距离和高度，颜色渐变
    - 高度渐变明显
    - 相同距离，垂直路线方向比路线方向渐变明显
    - 水平面上总体呈类椭圆

## 4、后端服务
- 使用vite devServer配置数据

## 5、改进方向
- 解决不自动失焦
- 修改预加载时播放策略，避免数据量大时迟迟不能播放靠后帧的数据
- 预加载时令worker解析点云数据
- 改善播放器锁的功能和机制
- node做后端服务
- 仅使用一个WebGL渲染
- 更好的点云配色
- 错误处理机制