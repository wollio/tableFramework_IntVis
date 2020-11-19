// written by Andrés Villa Torres + Florian Bruggisser + Luke Franzke
// tracking IR Technology by Florian Bruggisser and Luke Franzke
// Interaction Design Group ZHdK
// updated 26 oct 2020 

// references
// reference https://github.com/bohnacker/p5js-screenPosition
// https://github.com/processing/p5.js/issues/1553 -> solving the 2d Projection of 3d points
// https://www.keene.edu/campus/maps/tool/ -> drawing earth maps and converting them into latitude longitude

let earthImg
let sky
let cloudImg;

let theta = 0.001
let r = 400
let easycam
let pOI = []
let pOI2 = []

let socket = io()

let tPS, tPE // testPointStart , testPointEnd of Spike 
let canvas 
let trackedDevices = []
let threeDviewFlag = true
let vectorMapFlag = false
let pOIFlag = true
let flatMapFlag = false
let myFont
let tableControl
let bckColor = [0, 0, 0, 0]
let seaColor = [100, 120, 255, 255];

let zurich
let cdmx
// apply rotations of the textured sphere for accurate UV projection of the earth map
let rMX = -90/* -90 */
let rMY = 90/* 90 */
let rMZ = 0

let easycamIntialized = false
let touchX = 0, touchY = 0

let earthMap
let screenPointsEarth = []
let pointsEarth = []

let futureCitiesTable
let futureCitiesData
let cities


// setting variables for loading geoTIFF data
let co2
let refrst

// these variables are the array lists of objects containing data points extracted form the
// simplified geoTIFF image(s)
// remember always to declare arrays as empty using square brackets: "let yourArrayName = []"
let pntsFromTIFF_co2  = []
let pntsFromTIFF_refrst = []

let flagCO2Data = true
let flagRfrsData = true

let flagDataVisStyleCO2 = false
let flagDataVisStyleRfrst = true

/*  full screen */
let elem = document.documentElement

let co2Bubbles = [];

function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen()
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen()
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen()
    }
}

/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen()
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen()
    }
}


function init() {

}


function resize() {
    init();
}


function preload() {

    //earthImg = loadImage('../imgs/earth_min_black_blue_sea.png');
    //earthImg = loadImage('../imgs/earth_3d_noclouds_min.jpg')
    //earthImg = loadImage('../imgs/earth_min_black_trans_sea.png');
    //earthImg = loadImage('../imgs/earth_1.png');
    earthImg = loadImage('../imgs/earth_bw_noise.jpg');
    //earthImg = loadImage('../imgs/world_map.svg');
    cloudImg = loadImage('../imgs/clouds_min.png');
    //sky = loadImage('../imgs/sky5.jpg')
    earthMap = loadTable('assets/maps/earth.csv', '', '')
    loadData('assets/data/future_cities.csv')

    co2 = loadImage('assets/data/co2_emissions.png')
	  refrst = loadImage('assets/data/geodata_ref_potential.png')
    // futureCitiesTable = loadTable('assets/data/future_cities.csv','','')

    socket.on('connected', function (data) {
        // console.log('new client connected id:' + data.id)
    })

    myFont = loadFont('assets/Futura-Lig.otf')

    let g = new GeoTiffany();
    g.load('../data/odiac2019_jan.tif').then((res) => {
        co2Bubbles = loadLocationsOn3D(res.data, res.width, res.height);
    });

    openFullscreen()
    init()
}

function resize(){
	init()
}


function setup() {
    canvas = createCanvas(windowWidth, windowHeight, WEBGL)
    noStroke()
    textFont(myFont)

    gl = this._renderer.GL;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //gl.colorMask(true, true, true, false);

    // resizing / downscaling the resolution of the image-data
    co2.resize(windowWidth/8, windowHeight/8)
    refrst.resize(windowWidth/8, windowHeight/8)

    if (!easycamIntialized) {
        easycam = new Dw.EasyCam(this._renderer, {distance: 1500, center: [0, 0, 0]})
        easycam.setDistanceMin(100)
        easycam.setDistanceMax(r * 60)
        easycamIntialized = true
    }
    // Attaching  Touch Listeners to body and P5 JS Canvas
    document.body.addEventListener('touchstart', handleTouch, false)
    document.getElementById('defaultCanvas0').addEventListener('touchstart', handleTouch, false)
    document.getElementById('defaultCanvas0').addEventListener('touchend', handleEnd, false)
    document.getElementById('defaultCanvas0').addEventListener('touchmove', handleMove, false)

    let fov = PI / 3
    let near = 200
    let far = 80000

    addScreenPositionFunction(this)
    //setMap(earthMap, pointsEarth, screenPointsEarth)
    // console.log(this._renderer)

    // CREATING A RANDOM ARRAY OF POINTS AROUND THE GLOBE
    //  replace with csv real points or Points of Interest

    cities = futureCitiesData.getColumn(0)
    let futCities = futureCitiesData.getColumn(2)
    let curr_lat = futureCitiesData.getColumn(27)
    let curr_lon = futureCitiesData.getColumn(28)
    let fut_lat = futureCitiesData.getColumn(29)
    let fut_lon = futureCitiesData.getColumn(30)

    console.log(cities.length + " total rows in table")
    // for(let i = 0 ; i < cities.length; i ++ ){
    // 	if(i>0){
    // 		// console.log(cities[i] , curr_lat[i], curr_lon[i])
    // 	}
    // }
    for (let i = 0; i < cities.length; i++) {
        // geo coordinates
        // replace the random locations with the projects
        if (i > 0) {
            let lat = radians(curr_lat[i])
            let lon = radians(curr_lon[i])

            // console.log(i , cities[i], lat , lon )
            // cartesian coordinates
            let x = r * Math.cos(lat) * Math.cos(lon)
            let y = r * Math.cos(lat) * Math.sin(lon)
            let z = r * Math.sin(lat)
            pOI.push(createVector(x,y,z))
            let x2 = (r+25) * Math.cos(lat) * Math.cos(lon)
            let y2 = (r+25) * Math.cos(lat) * Math.sin(lon)
            let z2 = (r+25) * Math.sin(lat)
            // 25 is the distance or length of the spikes
            pOI2.push(createVector(x2,y2,z2))

            //pOI.push(spike(lat, lon, 25, r).start);
            //pOI2.push(spike(lat, lon, 25, r).end);
        }
    }
    tPS = createVector()
    tPE = createVector()

    // SETTING RANDOM LOCATION FOR INTERACTIVE 3D POINT(S) EXAMPLE
    let lat = radians(47.3769)
    let lon = radians(8.5417)


    let latZ = radians(47.3769)
    let lonZ = radians(8.5417)

    let latMX = radians(19.4969)
    let lonMX = radians(-99.7233)

    // from geographic coordinate system to cartesian system
    // R is radius, lat = latitude , lon = longitude
    // x = R * cos(lat) * cos(lon)
    // y = R * cos(lat) * sin(lon)
    // z = R *sin(lat)


    zurich = createVector(0, 0, 0)
    zurich.x = r * Math.cos(latZ) * Math.cos(lonZ)
    zurich.y = r * Math.cos(latZ) * Math.sin(lonZ)
    zurich.z = r * Math.sin(latZ)

    cdmx = createVector(0, 0, 0)
    cdmx.x = r * Math.cos(latMX) * Math.cos(lonMX)
    cdmx.y = r * Math.cos(latMX) * Math.sin(lonMX)
    cdmx.z = r * Math.sin(latMX)

    tPS.x = r * Math.cos(lat) * Math.cos(lon)
    tPS.y = r * Math.cos(lat) * Math.sin(lon)
    tPS.z = r * Math.sin(lat)

    tPE.x = (r + 50) * Math.cos(lat) * Math.cos(lon)
    tPE.y = (r + 50) * Math.cos(lat) * Math.sin(lon)
    tPE.z = (r + 50) * Math.sin(lat)

    let testPoint = screenPosition(-tPS.x, tPS.y, tPS.z)
    listenMessages()

    // here we are calling the function dataFromTIFFtoArray
 	// which you can find on the file sketch_extend.js inside the same js folder
 	// this function reads each pixel and passes its x y location to a custom
 	// data point object, which converts the x y to 3D point in an spheric system
 	// the points contain x y location in 2D geo system(lon lat) as well as 3D xyz
 	// as well as a value, which is just the brightness of each pixel
 	// once the pixel is handeld an object is created and pushed into the list in the draw we access
 	// this list and iterate through each of the data points in order to visualize them or interact
 	// from co2
 	dataFromTIFFtoArray(co2,pntsFromTIFF_co2,5.0)
 	// from rfrst
 	dataFromTIFFtoArray(refrst,pntsFromTIFF_refrst,1.0)

    // tableControl = new CenterControl(320,475)
}

function draw() {
    background(bckColor)
    let user = createVector(mouseX, mouseY)
    show3D()
    show2d()
    showPointsOfInterest(cities.length - 2)
    showFlatMap(pointsEarth, color(0, 255, 0))
    showVectorMap(pointsEarth, screenPointsEarth, color(255, 255, 255))
    easycam.setCenter([0, 0, 0], 0.0);

    // here we call the function visualize and pass the desired arraylist
 	// which will iterate through each data point and visualize it
 	// the flag is a boolean to display or hide the visualization
 	if(flagCO2Data){
    visualizeDataFromTIFF(pntsFromTIFF_co2,flagDataVisStyleCO2, color(255,0,0))
  }
  if(flagRfrsData){
    visualizeDataFromTIFF(pntsFromTIFF_refrst,flagDataVisStyleRfrst, color(0,255,100))
  }
}

function showFlatPointsOfInterest() {
    for (let i = 0; i < cities.length; i++) {
        let lR = 400
        let lLat = asin(pOI[i].z / lR)
        let lLong = atan2(pOI[i].y, -pOI[i].x)
        lLat = lLat * 90 / PI * 10 // scaling
        lLong = lLong * 180 / PI * 10 // scaling
        drawLine(lLong, lLat, 0, lLong, lLat, 50, 0, 255, 0)
    }
}

// function touchMoved() {
//   return false;
// }

function show3D() {
    if (threeDviewFlag) {

        noLights()
        //ambientLight(255, 255, 255)
        //texture(sky)
        //noStroke()
        fill(255, 255, 255);
        //sphere(r * 5, 6, 6);

        //fill(seaColor);
        //sphere(r - 5, 20, 20);

        ambientLight(60, 60, 60)
        let v1 = easycam.getPosition(500)
        pointLight(255, 255, 255, v1[0], v1[1] + 300, v1[2])
        pointLight(255, 255, 255, v1[0], v1[1] + 300, v1[2])
        texture(earthImg)
        noStroke()
        // rotating earth in order to match coordinate system location
        push()
        rotateX(radians(rMX))
        rotateY(radians(rMY))
        rotateZ(radians(rMZ))
        // fill(0,0,100)
        // drawing EARTH Polygon
        sphere(r, 20, 20)
        pop()

        push();
        rotateX(millis() * 0.00002);
        texture(cloudImg);
        sphere(r + 5, 20, 20);
        pop();

    }
}

function show2d() {
	let testPoint = screenPosition(-tPS.x, tPS.y, tPS.z)
	let testPoint2 = screenPosition(-tPE.x, tPE.y, tPE.z)
	let user = createVector(mouseX - windowWidth/2,mouseY - windowHeight/2)
	// in case the touch display or device is available use the touchX instead
	if(isTouch ){
		user = createVector (touchX - windowWidth/2 , touchY - windowHeight/2 )
	}
	// console.log(user.x , user.y)
	let testPoint2Ref = createVector(testPoint2.x,testPoint2.y)
	easycam.beginHUD()
	if(isTouch){
		fill(0,0,255,100)
		circle(touchX,touchY,50)
	}
	fill(255,0,0)
	noStroke()
	if(user.dist(testPoint)<55){
		circle(testPoint.x + windowWidth/2, testPoint.y + windowHeight/2, 10)
	}else{	
		circle(testPoint.x + windowWidth/2, testPoint.y + windowHeight/2, 1)
	}
	if(user.dist(testPoint2)<55){
		circle(testPoint2.x + windowWidth/2, testPoint2.y + windowHeight/2, 10)
	}else{	
		circle(testPoint2.x + windowWidth/2, testPoint2.y + windowHeight/2, 1)
	}
	stroke(255,0,0)
	strokeWeight(0.5)
	line(testPoint.x + windowWidth/2, testPoint.y +windowHeight/2,testPoint2.x + windowWidth/2, testPoint2.y + windowHeight/2 )
	if(trackedDevices.length>0){

		trackedDevices.forEach( element => {
			element.calculateRange()
			// uncomment this if the tableControl object is available
			// tableControl.interact(element.smoothPosition.x,element.smoothPosition.y,element.smoothRotation,element.uniqueId)
		})

		// you can rename this trackedDevices - call them tokens for instance
		trackedDevices.forEach(element =>{
			if(element.inRange){
				element.show()	
				fill(200,0,0)
				ellipse(element.smoothPosition.x + 100, element.smoothPosition.y+100, 20,20)
				// if(elemnt.uniqueId == 52){ /* example of a loop accessing an specific uniqueId  to do something specific */}
				// access the identifier : element.identifier // changes everytime you add or create a new object on screen
				// access the uniqueId : element.uniqueId // stays the same always for each tracked object
				text(element.uniqueId, element.smoothPosition.x + 120, element.smoothPosition.y + 120)
			}
			updateHTML(element.smoothPosition.x, element.smoothPosition.x,element.uniqueId)
		})
	}
	easycam.endHUD()
}

// this function creates an HTML div element assigns the class trackedDivs to it, passes the uniqueId as id and adds some text inside
function createHTML(id){
	let testDiv = document.createElement("div")   // creating a new div
	testDiv.className = "trackedDivs"
	testDiv.innerHTML = "I'm a new div"
	testDiv.id = id           
	document.body.appendChild(testDiv)
}
// this function update the position and labesl of the tracked devices
function updateHTML(x_pos, y_pos,tracked_id){
	let trackedDivs = document.getElementsByClassName("trackedDivs")
	Array.prototype.forEach.call(trackedDivs, function(element) {
		if(element.id == tracked_id){
			element.style.left = x_pos+'px';
			element.style.top = y_pos+'px';
		}
	})
}
// this function destroys the html elements which are not used anymore, to avoid accumulating appended children
function destroyHTML(tracked_id){

	// should remove the HTML elements from past tracked devices that are not in use any more
	let trackedDivs = document.getElementsByClassName("trackedDivs")
	Array.prototype.forEach.call(trackedDivs, function(element) {
		if(element.id == tracked_id){
			// search for a function to actually remove an element from HTML
			element.remove()
		}
	})
}


function setMap(map, mapPoints, screenMapPoints) {

        // drawing the spikes from the Points Of Interest
        for (let i = 0; i < 400; i++) {

            // rename to : pOIx, pOIy, pOIz
            drawLine(-pOI[i].x,pOI[i].y,pOI[i].z,-pOI2[i].x,pOI2[i].y,pOI2[i].z,0,0,255)
        }

        for (let i = 0; i < co2Bubbles.length; i++) {
            let vector = horizontalToCartesian(co2Bubbles[i].lat, co2Bubbles[i].lon, r + 20);
            //drawSphere(vector.x, vector.y, vector.z, co2Bubbles[i].size);
        }

        drawLine(-tPS.x, tPS.y, tPS.z, -tPE.x, tPE.y, tPE.z, 0, 255, 0)

        // showFlatPointsOfInterest();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true)
    if (easycamIntialized) {
        easycam.setViewport([0, 0, windowWidth, windowHeight])
    }
    resize()
}

function show2d() {
    let testPoint = screenPosition(-tPS.x, tPS.y, tPS.z)
    let testPoint2 = screenPosition(-tPE.x, tPE.y, tPE.z)
    let user = createVector(mouseX - windowWidth / 2, mouseY - windowHeight / 2)
    // in case the touch display or device is available use the touchX instead
    if (isTouch) {
        user = createVector(touchX - windowWidth / 2, touchY - windowHeight / 2)
    }
    // console.log(user.x , user.y)
    let testPoint2Ref = createVector(testPoint2.x, testPoint2.y)
    easycam.beginHUD()
    if (isTouch) {
        fill(0, 0, 255, 100)
        circle(touchX, touchY, 50)
    }
    fill(255, 0, 0)
    noStroke()
    if (user.dist(testPoint) < 55) {
        circle(testPoint.x + windowWidth / 2, testPoint.y + windowHeight / 2, 10)
    } else {
        circle(testPoint.x + windowWidth / 2, testPoint.y + windowHeight / 2, 1)
    }
    if (user.dist(testPoint2) < 55) {
        circle(testPoint2.x + windowWidth / 2, testPoint2.y + windowHeight / 2, 10)
    } else {
        circle(testPoint2.x + windowWidth / 2, testPoint2.y + windowHeight / 2, 1)
    }
    stroke(255, 0, 0)
    strokeWeight(0.5)
    line(testPoint.x + windowWidth / 2, testPoint.y + windowHeight / 2, testPoint2.x + windowWidth / 2, testPoint2.y + windowHeight / 2)
    if (trackedDevices.length > 0) {
        trackedDevices.forEach(element => {
            element.calculateRange()
            // uncomment this if the tableControl object is available
            // tableControl.interact(element.smoothPosition.x,element.smoothPosition.y,element.smoothRotation,element.uniqueId)
        })
        trackedDevices.forEach(element => {
            if (element.inRange) {
                element.show()
            }
        })
    }
    easycam.endHUD()
}

// function calculateMaps

// let logDeltaOnce = false
function setMap(map, mapPoints, screenMapPoints) {

    let mapLong = map.getColumn(0)
    let mapLat = map.getColumn(1)
    let countTest = 0
    console.log("total points : " + mapLong.length)
    for (let i = 0; i < mapLong.length; i++) {
        let latAt = radians(mapLat[i])
        let longAt = radians(mapLong[i])
        let point = createVector(0, 0, 0)
        point.x = r * Math.cos(latAt) * Math.cos(longAt)
        point.y = r * Math.cos(latAt) * Math.sin(longAt)
        point.z = r * Math.sin(latAt)
        mapPoints.push(point)
        // * note for some reason, the x-projection needs to be negative (-) otherwise the maps are mirrored
        // * it applies to all other points as well
        let screenPoint = screenPosition(-point.x, point.y, point.z)
        let screen2DVector = createVector(screenPoint.x, screenPoint.y)
        screenMapPoints.push(screen2DVector)
    }
}

let deltas = []
let calcDeltasOnce = false

function showVectorMap(mapPoints, screenMapPoints, farbe) {
    if (vectorMapFlag) {
        let step = 12
        for (let i = 0; i < screenMapPoints.length - step; i = i + step) {
            let screenPoint = screenPosition(-mapPoints[i].x, mapPoints[i].y, mapPoints[i].z)
            let screen2DVector = createVector(screenPoint.x, screenPoint.y)
            screenMapPoints[i] = screen2DVector
        }
        // strokeWeight(1)
        easycam.beginHUD()
        // beginShape()
        stroke(farbe)
        // fill(255,10)
        strokeWeight(1.0)
        noFill()
        let shaped = false
        let indexError = 0
        let indexR = 0
        let indexG = 0
        let indexB = 0
        for (let i = 0; i < screenMapPoints.length - step; i = i + step) {
            if (i > step) {
                let fixI = i
                if (!calcDeltasOnce) {
                    deltas[i] = dist(mapPoints[i].x, mapPoints[i].y, mapPoints[i].z, mapPoints[i - step].x, mapPoints[i - step].y, mapPoints[i - step].z)
                }
                if (deltas[i] < 10.25 + step && !shaped) {
                    beginShape()
                    shaped = true
                    vertex(screenMapPoints[i].x + windowWidth / 2, screenMapPoints[i].y + windowHeight / 2)
                } else {
                    if (shaped && deltas[fixI] < 10.25 + step) {
                        vertex(screenMapPoints[i].x + windowWidth / 2, screenMapPoints[i].y + windowHeight / 2)
                    } else {
                        if (deltas[fixI] > 10.25 + step) {
                            endShape()
                            shaped = false
                            indexError++
                        }
                    }
                }
            }
        }
        calcDeltasOnce = true
        easycam.endHUD()
    }
}

function showFlatMap(mapPoints, farbe) {
    if (flatMapFlag) {
        let step = 15
        let lastLat
        let lastLong
        let scaleX = 5
        let scaleY = 10
        for (let i = 0; i < mapPoints.length - step; i = i + step) {
            let lR = 400
            let lLat = asin(mapPoints[i].z / lR)
            let lLong = atan2(mapPoints[i].y, -mapPoints[i].x)
            lLat = lLat * 90 / PI * scaleY // scaling
            lLong = lLong * 180 / PI * scaleX // scaling
            // mapping longitude from -180 - 180º to the other way around
            if (lLong <= -55) {
                lLong = map(lLong, -(180 * scaleX), 0, 0, (180 * scaleX))
            } else {
                lLong = map(lLong, 0, (180 * scaleX), -(180 * scaleX), 0)
            }
            if (i > 0) {
                let delta = fastDist(lLong, lLat, 0, lastLong, lastLat, 0)
                if (delta < (4000)) {
                    drawLine(lLong, lLat, 0, lastLong, lastLat, 0, 255, 255, 255)
                }
            }
            lastLat = lLat
            lastLong = lLong

        }
        drawLine((180 * scaleX), -400, 0, -(180 * scaleX), 400, 0, 255, 0, 0)
        // meridian or longitude 0
        drawLine(-110, -400, 0, -110, 400, 0, 255, 0, 100)
        // equator or latitude 0
        drawLine(-(180 * scaleX), 0, 0, (180 * scaleX), 0, 0, 255, 100, 0)
    }
}

function fastDist(ax, ay, az, bx, by, bz) {
    let fdist = (bx - ax) * (bx - ax) + (by - ay) * (by - ay) + (bz - az) * (bz - az)
    // fdist = fdist
    return fdist
}

// rename this function - show Points Of Interest
function showPointsOfInterest(amount) {
    if (pOIFlag) {
        let testPoints = []
        // the screenPoisition() function projects coordinates from 3D space into the 2D projections of the Screen
        let tZurich = screenPosition(-zurich.x, zurich.y, zurich.z)
        let tCDMX = screenPosition(-cdmx.x, cdmx.y, cdmx.z)
        for (let i = 0; i < amount; i++) {
            testPoints[i] = screenPosition(-pOI[i].x, pOI[i].y, pOI[i].z)
        }
        let user = createVector(mouseX - windowWidth / 2, mouseY - windowHeight / 2)
        // in case the touch display or device is available use the touchX instead
        if (isTouch) {
            user = createVector(touchX - windowWidth / 2, touchY - windowHeight / 2)
        }
        // similar to pushMatrix()
        easycam.beginHUD()
        for (let i = 0; i < amount; i++) {
            if (user.dist(testPoints[i]) < 10) {
                fill(255, 180, 255)
                noStroke()
                circle(testPoints[i].x + windowWidth / 2, testPoints[i].y + windowHeight / 2, 15)
                let lat = Math.asin(pOI[i].z / r)
                let lon = Math.atan2(pOI[i].y, pOI[i].x)
                lat = lat * 180 / Math.PI
                lon = lon * 180 / Math.PI
                textSize(12)
                let latLon = 'lat : ' + lat.toFixed(3) + ' , lon : ' + lon.toFixed(3);
                text(cities[i + 1] + " , " + latLon, testPoints[i].x + windowWidth / 2 + 10, testPoints[i].y + windowHeight / 2 + 5)
            } else {
                fill(200, 180, 200)
                noStroke()
                circle(testPoints[i].x + windowWidth / 2, testPoints[i].y + windowHeight / 2, 2)
            }
        }
        fill(255, 100, 100)
        if (user.dist(tZurich) < 25) {
            let lat = Math.asin(zurich.z / r)
            let lon = Math.atan2(zurich.y, zurich.x)
            lat = lat * 180 / PI
            lon = lon * 180 / PI
            textSize(16)
            let latLon = 'ZURICH, LAT : ' + lat.toFixed(3) + ' , LON : ' + lon.toFixed(3) + ' , Z pos : ' + tZurich.z
            if (mouseX > windowWidth / 2) {
                text(latLon, tZurich.x + windowWidth / 2 - 240, tZurich.y + windowHeight / 2 + 25)
            } else {
                text(latLon, tZurich.x + windowWidth / 2 + 20, tZurich.y + windowHeight / 2 + 25)
            }
            circle(tZurich.x + windowWidth / 2, tZurich.y + windowHeight / 2, 25)
        } else {
            circle(tZurich.x + windowWidth / 2, tZurich.y + windowHeight / 2, 15)
        }
        fill(100, 100, 255)
        circle(tCDMX.x + windowWidth / 2, tCDMX.y + windowHeight / 2, 5)
        // popMatrix()
        easycam.endHUD()
    }
}

function drawCylinder(x, y, z, size) {
    push();
    translate(x, y, z);
    cylinder(5, size);
    pop();
}

function drawLine(x1, y1, z1, x2, y2, z2, r, g, b) {
    fill(r, g, b)
    stroke(r, g, b)
    strokeWeight(0.5)
    beginShape()
    vertex(x1, y1, z1)
    vertex(x2, y2, z2)
    endShape()
    noStroke()
}

function drawSphere(x, y, z, size) {
    push();
    translate(x, y, z);
    sphere(size, 3, 3);
    pop();
}

function loadData(path) {
    futureCitiesData = loadTable(path, '', '')

    // int entriesCount =0;
    // for (TableRow row : futureCities.rows()) {
    //   String city = row.getString("current_city");
    //   float longitude = row.getFloat("Longitude");
    //   float latitude = row.getFloat("Latitude");

    //   String futureCity = row.getString("future_city_1_source");

    //   float longFut = row.getFloat("future_long");
    //   float latFut = row.getFloat("future_lat");

    //   if (city.length()>0) {
    //     // println(city, longitude, latitude );
    //     cities.add(city);
    //     geoCoords.add(new PVector(longitude, latitude));

    //     futCities.add(futureCity);
    //     futGeoCoords.add(new PVector(longFut, latFut));
    //   }
    // }
    // pOIs = new PointOfInterest[cities.size()];
    // multiplePOI();
}