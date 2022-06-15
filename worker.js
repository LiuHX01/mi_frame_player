const getAllImageName = () => {
    const timeRange = []
    for (let i = 0; i <= 107; i++) {
        timeRange.push(('0000000000' + i).slice(-10))
    }
    return timeRange
}
const timeRange = getAllImageName()


const fetchSingleImage = (timestamp) => {
    var ajax = new XMLHttpRequest()
    ajax.open('GET', `/data/image_00/data/${timestamp}.png`, true)
    ajax.responseType = 'blob'
    ajax.send()

    ajax.onload = function () {
        console.log(i)

        self.postMessage([timestamp, ajax.response, '1'])
    }
}


// 为啥- -
const fetchSingleLidar = (timestamp) => {
    var ajax = new XMLHttpRequest()
    ajax.open('GET', `/data/velodyne_points/data/${timestamp}.bin`, true)
    ajax.responseType = 'arraybuffer'
    ajax.send()

    ajax.onload = function () {
        self.postMessage([timestamp, ajax.response, '2'])
    }
}



// for(let i = 0; i < timeRange.length; i++) {
//     fetchSingleImage(timeRange[i])
// }

self.addEventListener('message', function (e) {
    const bitImg = this.createImageBitmap
    // console.log(e.data, 'world')
})

// close()