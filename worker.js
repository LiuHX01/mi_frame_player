/*
const getAllImageName = () => {
    const timeRange = []
    for (let i = 0; i <= 107; i++) {
        timeRange.push(('0000000000' + i).slice(-10))
    }
    return timeRange
}
const timeRange = getAllImageName()
*/
/*
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

const fetchSingleLidar = (timestamp) => {
    var ajax = new XMLHttpRequest()
    ajax.open('GET', `/data/velodyne_points/data/${timestamp}.bin`, true)
    ajax.responseType = 'arraybuffer'
    ajax.send()

    ajax.onload = function () {
        self.postMessage([timestamp, ajax.response, '2'])
    }
}

*/
// for(let i = 0; i < timeRange.length; i++) {
//     fetchSingleImage(timeRange[i])
// }
// let i = 1

// self.addEventListener('message', async function (e) {
//     const bitmapImage = await this.createImageBitmap(e.data[0])    // self.postMessage(bitImg)
//     self.postMessage([bitmapImage, i, e.data[1]])
//     i++
// })


self.addEventListener('message', async (e) => {
    const timestamp = e.data[0]
    const imgData = e.data[1]
    const bitmapImage = await createImageBitmap(imgData)
    self.postMessage([timestamp, bitmapImage])
})


// close()