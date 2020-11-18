function spike(lat, lon, size, earthRadius) {
    return {
        start: horizontalToCartesian(lat, lon, earthRadius),
        end: horizontalToCartesian(lat, lon, earthRadius + size)
    }
}
