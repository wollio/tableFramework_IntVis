/**
 little helper functions
 */
function getRandomColor(){
    let rgb1 = Math.floor((Math.random() * 255) + 200)
    let rgb2 = Math.floor((Math.random() * 255) + 200)
    let rgb3 = Math.floor((Math.random() * 255) + 200)
    return "rgb("+rgb1 +","+rgb2 + ","+rgb3 +")"
}

function horizontalToCartesian (lat, lon, radius) {
    // returns cartesian coordinates (relative of earth center) based of longitude and latitude
    let phi = radians(90 - lat)
    let theta = radians(lon + 180)
    let x = -((radius) * Math.sin(phi) * Math.cos(theta))
    let z = ((radius) * Math.sin(phi) * Math.sin(theta))
    let y = ((radius) * Math.cos(phi))
    return createVector(x, y, z);
}

//Number utils
function radians (degrees) {
    let radians = degrees * (Math.PI / 180)
    return radians
}
