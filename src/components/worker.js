self.addEventListener('message', async (e) => {
    const timestamp = e.data[0]
    const imgData = e.data[1]
    const bitmapImage = await createImageBitmap(imgData)
    self.postMessage([timestamp, bitmapImage])
})