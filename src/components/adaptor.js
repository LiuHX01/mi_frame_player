import mitt from 'mitt'

const emitter = mitt()

class FrameAdaptor {
    constructor(namespace) {
        this.namespace = namespace
    }


    FramePlayerEmitter(data) {
        emitter.emit(this.namespace + 'FramePlayer', data)
    }


    FramePlayerListener(callback) {
        emitter.on(this.namespace + 'FramePlayer', (data) => callback(data))
    }
}


// App to Image : blob+bitmap
const frameAdaptorImage = new FrameAdaptor('imageTransfer')
// App to Lidar : arraybuffer
const frameAdaptorLidar = new FrameAdaptor('lidarTransfer')
// Image to Index : ready
const frameAdaptorReadyImage = new FrameAdaptor('readyImageTransfer')
// Lidar to Index : ready
const frameAdaptorReadyLidar = new FrameAdaptor('readyLidarTransfer')
// App to Index : loaded range
const frameAdaptorFRange = new FrameAdaptor('fRangeTransfer')


export {
    frameAdaptorImage,
    frameAdaptorLidar,
    frameAdaptorReadyImage,
    frameAdaptorReadyLidar,
    frameAdaptorFRange,
}