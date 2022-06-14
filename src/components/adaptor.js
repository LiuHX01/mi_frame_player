import mitt from 'mitt'



const emitter = mitt()



class FrameAdaptor {
    constructor(namespace) {
        this.namespace = namespace
    }


    FramePlayerEmitter(data) {
        emitter.emit(this.namespace + 'FramePlayer', data)
        // console.log(this.namespace + 'FramePlayer', data)
    }
5

    FramePlayerListener(callback) {
        emitter.on(this.namespace + 'FramePlayer', (data) => callback(data))
        // console.log(this.namespace + 'FramePlayerListener')
    }
}



const frameAdaptorImage = new FrameAdaptor('imageTransfer')
const frameAdaptorLidar = new FrameAdaptor('lidarTransfer')
const frameAdaptorReady = new FrameAdaptor('readyTransfer')



export {
    frameAdaptorImage,
    frameAdaptorLidar,
    frameAdaptorReady,
}