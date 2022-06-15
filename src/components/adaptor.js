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



const frameAdaptorImage = new FrameAdaptor('imageTransfer')
const frameAdaptorLidar = new FrameAdaptor('lidarTransfer')
const frameAdaptorReady = new FrameAdaptor('readyTransfer')
const frameAdaptorFRange = new FrameAdaptor('fRangeTransfer')


export {
    frameAdaptorImage,
    frameAdaptorLidar,
    frameAdaptorReady,
    frameAdaptorFRange,
}