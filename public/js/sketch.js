// written by Andrés Villa Torres + Florian Bruggisser + Luke Franzke
// tracking IR Technology by Florian Bruggisser and Luke Franzke
// Interaction Design Group ZHdK
// updated 26 oct 2020 

// references
// reference https://github.com/bohnacker/p5js-screenPosition
// https://github.com/processing/p5.js/issues/1553 -> solving the 2d Projection of 3d points
// https://www.keene.edu/campus/maps/tool/ -> drawing earth maps and converting them into latitude longitude

let cache = {

};

let earthImg, sky, cloudImg;
let cloudEnabled = true;

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
let pOIFlag = false
let flatMapFlag = false
let myFont
let tableControl
let bckColor = [10, 10, 10, 255]
let seaColor = [100, 120, 255, 255];

let zurich
let cdmx
// apply rotations of the textured sphere for accurate UV projection of the earth map
let rMX = -90 /* -90 */
let rMY = 90 /* 90 */
let rMZ = 0

let easycamIntialized = false
let touchX = 0,
    touchY = 0

let earthMap
let screenPointsEarth = []
let pointsEarth = []

let futureCitiesTable
let futureCitiesData
let cities

// setting variables for loading geoTIFF data
let co2
let refrst

let colorBlue

// these variables are the array lists of objects containing data points extracted form the
// simplified geoTIFF image(s)
// remember always to declare arrays as empty using square brackets: "let yourArrayName = []"
let pntsFromTIFF_co2 = []
let pntsFromTIFF_refrst = []

let flagCO2Data = true
let flagRfrsData = false

let flagDataVisStyleCO2 = true
let flagDataVisStyleRfrst = true

/*  full screen */
let elem = document.documentElement

let textureGuiTriangleAmountDisplay;

function init() {

}

function resize() {
    init();
}

function preload() {
    earthImg = loadImage('../imgs/earth_3d_noclouds_mono5-hires.jpg')
    cloudImg = loadImage('../imgs/clouds_min.png');
    earthMap = loadTable('assets/maps/earth.csv', '', '')
    loadData('assets/data/future_cities.csv')
    
    co2 = loadImage('assets/data/co2_emissions.png')
    refrst = loadImage('assets/data/geodata_ref_potential.png')
    // futureCitiesTable = loadTable('assets/data/future_cities.csv','','')

    textureGuiTriangleAmountDisplay = loadImage('../imgs/guiElements/trianlge_amount_display.png');
    food = loadImage('../icons/food.svg');
    energy = loadImage('../icons/energy.svg');
    buildings = loadImage('../icons/buildings.svg');
    industry = loadImage('../icons/industry.svg');
    landsinks = loadImage('../icons/landsinks.svg');
    transportation = loadImage('../icons/transportation.svg');

    socket.on('connected', function (data) {
        console.log('new client connected id:' + data.id)
    })

    myFont = loadFont('assets/SUIGBI__.ttf')

    //openFullscreen()
    init()
}

function resize() {
    init()
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight, WEBGL)
    noStroke()
    textFont(myFont)
    imageMode(CENTER);
    document.getElementById("restart").addEventListener("click", () => {
        resetProjectDrawdown()
    });

    document.getElementById('allTo100').addEventListener("click", () => {
        setAllProjectDrawdown();
    });

    colorBlue = color(0, 0, 255);

    // resizing / downscaling the resolution of the image-data
    co2.resize(windowWidth / 12, windowHeight / 12)
    refrst.resize(windowWidth / 8, windowHeight / 8)

    if (!easycamIntialized) {
        easycam = new Dw.EasyCam(this._renderer, {
            distance: 1500,
            center: [0, 0, 0]
        })
        easycam.setDistanceMin(100)
        easycam.setDistanceMax(r * 60)
        easycamIntialized = true
    }
    // Attaching  Touch Listeners to body and P5 JS Canvas
    document.body.addEventListener('touchstart', handleTouch, false)
    document.getElementById('defaultCanvas0').addEventListener('touchstart', handleTouch, false)
    document.getElementById('defaultCanvas0').addEventListener('touchend', handleEnd, false)
    document.getElementById('defaultCanvas0').addEventListener('touchmove', handleMove, false)

    updateCummulativePercentage();

    let fov = PI / 3
    let near = 200
    let far = 80000

    addScreenPositionFunction(this)

    // CREATING A RANDOM ARRAY OF POINTS AROUND THE GLOBE
    //  replace with csv real points or Points of Interest

    cities = futureCitiesData.getColumn(0)
    let futCities = futureCitiesData.getColumn(2)
    let curr_lat = futureCitiesData.getColumn(27)
    let curr_lon = futureCitiesData.getColumn(28)
    let fut_lat = futureCitiesData.getColumn(29)
    let fut_lon = futureCitiesData.getColumn(30)

    console.log(cities.length + " total rows in table")

    for (let i = 0; i < cities.length; i++) {
        // geo coordinates
        // replace the random locations with the projects
        if (i > 0) {
            pOI.push(toCartesian(curr_lat[i], curr_lon[i], r));
            pOI2.push(toCartesian(curr_lat[i], curr_lon[i], r + 25));
        }
    }
    tPS = createVector()
    tPE = createVector()

    // SETTING RANDOM LOCATION FOR INTERACTIVE 3D POINT(S) EXAMPLE
    let lat = 47.3769;
    let lon = 8.5417;

    let latZ = 47.3769;
    let lonZ = 8.5417;

    let latMX = 19.4969
    let lonMX = -99.7233

    zurich = toCartesian(lat, lon, r);
    cdmx = toCartesian(latMX, lonMX, r);
    tPS = toCartesian(lat, lon, r);
    tPE = toCartesian(lat, lon, r + 50);

    //let testPoint = screenPosition(-tPS.x, tPS.y, tPS.z)
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
    dataFromTIFFtoArray(co2, pntsFromTIFF_co2, 5.0)
    // from rfrst
    dataFromTIFFtoArray(refrst, pntsFromTIFF_refrst, 1.0)

    // tableControl = new CenterControl(320,475)
    updatePercentage();
}

function draw() {
    background(bckColor)

    document.getElementById("frameRateDisplay").innerText = frameRate();

    let user = createVector(mouseX, mouseY)
    show3D()
    if(flagCO2Data){
        visualizeDataFromTIFF(pntsFromTIFF_co2,flagDataVisStyleCO2, color(50,140, 255, 100), 'co2')
    }
    if(flagRfrsData){
        visualizeDataFromTIFF(pntsFromTIFF_refrst,flagDataVisStyleRfrst, color(0,255,100), 'reforestation')
    }

    show2d()
    showPointsOfInterest(cities.length - 2)
    showCityCylinders();

    showFlatMap(pointsEarth, color(0, 255, 0))
    showVectorMap(pointsEarth, screenPointsEarth, color(255, 255, 255))
    easycam.setCenter([0, 0, 0], 0.0);

}

/**
 * Displays cylinder for each pointOfInterest
 */
function showCityCylinders() {
    if (pOIFlag) {
        for (let i = 0; i < cities.length - 1; i++) {
            drawCylinder(pOI[i], pOI2[i], color(0, 255, 0));
        }
    }
}

/*function showFlatPointsOfInterest() {
    for (let i = 0; i < cities.length; i++) {
        let lR = 400
        let lLat = asin(pOI[i].z / lR)
        let lLong = atan2(pOI[i].y, -pOI[i].x)
        lLat = lLat * 90 / PI * 10 // scaling
        lLong = lLong * 180 / PI * 10 // scaling
        //drawLine(lLong, lLat, 0, lLong, lLat, 50, colorBlue)
    }
}*/

// function touchMoved() {
//   return false;
// }

function show3D() {
    if (threeDviewFlag) {
        ambientLight(60, 60, 60)
        let v1 = easycam.getPosition(500)
        pointLight(255, 255, 255, v1[0], v1[1] + 300, v1[2])
        pointLight(250, 250, 250, v1[0], v1[1] + 1000, v1[2])
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

        if (cloudEnabled) {
            push();
            rotateX(millis() * 0.00002);
            texture(cloudImg);
            sphere(r + 5, 20, 20);
            pop();
        }
    }
}

function show2d() {
    let testPoint = screenPosition(tPS.x, tPS.y, tPS.z)
    let testPoint2 = screenPosition(tPE.x, tPE.y, tPE.z)
    let user = createVector(mouseX - windowWidth / 2, mouseY - windowHeight / 2)
    // in case the touch display or device is available use the touchX instead
    if (isTouch) {
        user = createVector(touchX - windowWidth / 2, touchY - windowHeight / 2)
    }
    // console.log(user.x , user.y)
    let testPoint2Ref = createVector(testPoint2.x, testPoint2.y)
    easycam.beginHUD()

    drawEvents();

    if (isTouch) {
        fill(0, 0, 255, 100)
        circle(touchX, touchY, 50)
    }
    fill(255, 0, 0)
    stroke(255, 0, 0)
    strokeWeight(0.5)
    //line(-testPoint.x + windowWidth / 2, testPoint.y + windowHeight / 2, -testPoint2.x + windowWidth / 2, testPoint2.y + windowHeight / 2)

	if(trackedDevices.length>0){
		trackedDevices.forEach( element => {
			element.calculateRange()
		})
		trackedDevices.forEach(element =>{
			if(element.inRange){
				element.show()
			}
		})
	}
	easycam.endHUD()
}

// this function creates an HTML div element assigns the class trackedDivs to it, passes the uniqueId as id and adds some text inside
function createHTML(id) {
    let testDiv = document.createElement("div") // creating a new div
    testDiv.className = "trackedDivs"
    testDiv.innerHTML = "I'm a new div"
    testDiv.id = id
    document.body.appendChild(testDiv)
}
// this function update the position and labesl of the tracked devices
function updateHTML(x_pos, y_pos, tracked_id) {
    let trackedDivs = document.getElementsByClassName("trackedDivs")
    Array.prototype.forEach.call(trackedDivs, function (element) {
        if (element.id == tracked_id) {
            element.style.left = x_pos + 'px';
            element.style.top = y_pos + 'px';
        }
    })
}
// this function destroys the html elements which are not used anymore, to avoid accumulating appended children
function destroyHTML(tracked_id) {
    // should remove the HTML elements from past tracked devices that are not in use any more
    let trackedDivs = document.getElementsByClassName("trackedDivs")
    Array.prototype.forEach.call(trackedDivs, function (element) {
        if (element.id == tracked_id) {
            // search for a function to actually remove an element from HTML
            element.remove()
        }
    })
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true)
    if (easycamIntialized) {
        easycam.setViewport([0, 0, windowWidth, windowHeight])
    }
    resize()
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
                    drawLine(lLong, lLat, 0, lastLong, lastLat, 0, colorBlue)
                }
            }
            lastLat = lLat
            lastLong = lLong

        }
        drawLine((180 * scaleX), -400, 0, -(180 * scaleX), 400, 0, colorBlue)
        // meridian or longitude 0
        drawLine(-110, -400, 0, -110, 400, 0, colorBlue)
        // equator or latitude 0
        drawLine(-(180 * scaleX), 0, 0, (180 * scaleX), 0, 0, colorBlue)
    }
}

function fastDist(ax, ay, az, bx, by, bz) {
    return (bx - ax) * (bx - ax) + (by - ay) * (by - ay) + (bz - az) * (bz - az);
}

// rename this function - show Points Of Interest
function showPointsOfInterest(amount) {
    if (pOIFlag) {
        let testPoints = []
        // the screenPoisition() function projects coordinates from 3D space into the 2D projections of the Screen
        let tZurich = screenPosition(zurich.x, zurich.y, zurich.z)
        let tCDMX = screenPosition(cdmx.x, cdmx.y, cdmx.z)
        for (let i = 0; i < amount; i++) {
            testPoints[i] = screenPosition(pOI[i].x, pOI[i].y, pOI[i].z)
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
                let lon = Math.atan2(pOI[i].y, -pOI[i].x)
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
