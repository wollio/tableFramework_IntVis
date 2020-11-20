/**
 little helper functions
 */
function getRandomColor(){
    let rgb1 = Math.floor((Math.random() * 255) + 200)
    let rgb2 = Math.floor((Math.random() * 255) + 200)
    let rgb3 = Math.floor((Math.random() * 255) + 200)
    return "rgb("+rgb1 +","+rgb2 + ","+rgb3 +")"
}

function calcTo3DVector(lat, lon, radius) {
    let x = -((radius) * Math.sin(lat) * Math.cos(lon))
    let z = ((radius) * Math.sin(lat) * Math.sin(lon))
    let y = ((radius) * Math.cos(lat))
    return createVector(x, y, z);
}

function calcTo3DVector2(lat, lon, radius) {
    let x = radius * Math.cos(radians(lat)) * Math.cos(radians(lon))
    let y = radius * Math.cos(radians(lat)) * Math.sin(radians(lon))
    let z = radius * Math.sin(radians(lat))
    return createVector(x,y,z);
}

function horizontalToCartesian (lat, lon, radius) {
    // returns cartesian coordinates (relative of earth center) based of longitude and latitude
    let phi = radians(90 - lat)
    let theta = radians(lon + 180)
    return calcTo3DVector(phi, theta, radius);
}

//Number utils
function radians (degrees) {
    let radians = degrees * (Math.PI / 180)
    return radians
}
