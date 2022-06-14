import mitt from 'mitt'

const currentMap = new Map()
currentMap.set('en', 'en')

const emitter = mitt()


export default class Adaptor extends OtherAdaptor {
    constructor (namespace) {
        this.namespace = namespace
    }


    FramePlayerEmitter(data) {
        emitter.emit(this.namespace + 'FramePlayer', data)
    }


    FramePlayerListener(callback) {
        emitter.on('FramePlayer', (data) => callback(data))
    }
}