function loadLocationsOn3D (data, imgWidth, imgHeight) {

    let entries = [];
    let finalLocationsWithDataPointsAndSize = [];
    for (let i = 0; i < imgWidth * imgHeight; i++) {
        if (data[i] > 0.01) {
            let indexedData = [i, data[i]]
            entries.push(indexedData)
        }
    }
    for (let i = 0; i < entries.length; i++) {
        let index = entries[i][0]
        let size = entries[i][1]
        let u = (index % imgWidth) / imgWidth
        let v = 1 - Math.floor(index / imgWidth) / imgHeight
        let lat = -90 + (v * 180)
        let lon = -180 + (u * 360)
        //let location = horizontalToCartesian(lat, lon, r)
        finalLocationsWithDataPointsAndSize.push({
            lat: lat,
            lon: lon,
            size: size
        });
    }
    return finalLocationsWithDataPointsAndSize;
}

class GeoTiffany {
    async load (filePath) {
        console.log("start loading");
        // todo: geotiff sources need to be check to see what bands have the correct data, currently just using 1st band
        let response = await fetch(filePath)
        let arrayBuffer = await response.arrayBuffer().catch((err) => { console.error(err) })
        let tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer).catch((err) => { console.error(err) })
        let image = await tiff.getImage().catch((err) => { console.error(err) })
        // let samplesPerPixel = image.getBytesPerPixel()
        return new Promise((resolve, reject) => {
            image.readRasters()
                .then((response) => resolve({
                    data: response[0], width: response.width, height: response.height
                }))
                .catch((err) => { reject(err) })
        });
    }
}


