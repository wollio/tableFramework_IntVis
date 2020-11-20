function spike(lat, lon, size, earthRadius, c = [0, 0, 255]) {
    let coords = {
        start: horizontalToCartesian(lat, lon, earthRadius),
        end: horizontalToCartesian(lat, lon, earthRadius + size)
    }

    drawLine(coords.start.x, coords.start.y, coords.start.z, coords.end.x, coords.end.y, coords.end.z, c);
}

function spike2(lat, lon, size, earthRadius, c) {
    let coords = {
        start: calcTo3DVector2(lat, lon, earthRadius),
        end: calcTo3DVector2(lat, lon, earthRadius + size)
    }

    drawLine(coords.start.x, coords.start.y, coords.start.z, coords.end.x, coords.end.y, coords.end.z, c);
}
