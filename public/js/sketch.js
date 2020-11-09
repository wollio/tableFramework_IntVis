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
let theta = 0.001 
let r = 400 
let easycam 
let pOI = [] 
let pOI2 = []

let socket = io() 

let tPS, tPE // testPointStart , testPointEnd of Spike 
let canvas 
let testTrackDevices = []
let threeDviewFlag = true
let vectorMapFlag = true
let pOIFlag = true
let flatMapFlag = false
let myFont
let tableControl
let bckColor = [0,0,0]

let zurich
let cdmx
// apply rotations of the textured sphere for accurate UV projection of the earth map
let rMX =  -90/* -90 */
let rMY =  90/* 90 */
let rMZ =  0

let easycamIntialized=false
let touchX =0, touchY = 0

let earthMap
let screenPointsEarth = []
let pointsEarth = []

/*  full screen */
let elem = document.documentElement
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


function init(){

}
let touchCount = 0
let ongoingTouches = []
let isTouch = false
function handleTouch(evt){
	isTouch=true
	touchCount++
	let touches = evt.changedTouches;
	// console.log("touch started at : " + evt.touches[0].clientX + " , " + evt.touches[0].clientY)
	touchX = evt.touches[0].clientX
	touchY = evt.touches[0].clientY
	
}

function handleEnd(evt) {
	isTouch=false
	// console.log("touch ended at : " + evt.changedTouches[0].pageX + " , " + evt.changedTouches[0].pageY )
	touchX = evt.changedTouches[0].pageX
	touchY = evt.changedTouches[0].pageY
}

function handleMove(evt) {
	 // console.log("touch moved at : " + evt.changedTouches[0].pageX + " , " + evt.changedTouches[0].pageY )
	touchX = evt.changedTouches[0].pageX
	touchY = evt.changedTouches[0].pageY
}






function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier
    
    if (id == idToFind) {
      return i
    }
  }
  return -1    // not found
}

function resize(){
	init()

}

function getRandomColor(){
    var rgb1 = Math.floor((Math.random() * 255) + 200)
    var rgb2 = Math.floor((Math.random() * 255) + 200)
    var rgb3 = Math.floor((Math.random() * 255) + 200)
    return "rgb("+rgb1 +","+rgb2 + ","+rgb3 +")"
}



function preload() {
  	earthImg = loadImage('../imgs/earth_min_black.jpg') 
	sky = loadImage('../imgs/sky.jpg') 
	earthMap = loadTable('assets/maps/earth.csv','','')

	socket.on('connected',function(data){
		// console.log('new client connected id:' + data.id) 
	}) 
	
	myFont = loadFont('assets/Futura-Lig.otf')
	openFullscreen()
	init()

}


function setup() {
	canvas = createCanvas(windowWidth, windowHeight, WEBGL) 
	noStroke()
	textFont(myFont)
	
	if(!easycamIntialized){
		easycam = new Dw.EasyCam(this._renderer, {distance:1500, center:[0,0,0]}) 
		easycam.setDistanceMin(100)
		easycam.setDistanceMax(r*60)
		easycamIntialized=true
	}
	// Attaching  Touch Listeners to body and P5 JS Canvas 
	document.body.addEventListener('touchstart',handleTouch,false)
	document.getElementById('defaultCanvas0').addEventListener('touchstart',handleTouch,false)
	document.getElementById('defaultCanvas0').addEventListener('touchend',handleEnd,false)
	document.getElementById('defaultCanvas0').addEventListener('touchmove',handleMove,false)

	let fov = PI/3 
	let near = 200 
	let far = 80000 

	addScreenPositionFunction(this)
	setMap(earthMap,pointsEarth,screenPointsEarth)
	// console.log(this._renderer)

	// CREATING A RANDOM ARRAY OF POINTS AROUND THE GLOBE
	//  replace with csv real points or Points of Interest
	for(let i = 0 ; i <400; i++){
		// geo coordinates
		// replace the random locations with the projects 
		let lat = radians(random(-90,90)) 
		let lon = radians(random(-180,180)) 
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


	zurich = createVector(0,0,0)
	zurich.x = r * Math.cos(latZ) * Math.cos(lonZ )
	zurich.y =  r * Math.cos(latZ) * Math.sin(lonZ )
	zurich.z = r * Math.sin(latZ)

	cdmx = createVector(0,0,0)
	cdmx.x = r * Math.cos(latMX) * Math.cos(lonMX )
	cdmx.y =  r * Math.cos(latMX) * Math.sin(lonMX )
	cdmx.z = r * Math.sin(latMX)

	tPS.x = r * Math.cos(lat) * Math.cos(lon)
	tPS.y = r * Math.cos(lat) * Math.sin(lon)
	tPS.z = r * Math.sin(lat)

	tPE.x = (r+50) * Math.cos(lat) * Math.cos(lon)	
	tPE.y = (r+50) * Math.cos(lat) * Math.sin(lon)
	tPE.z = (r+50) * Math.sin(lat)

	let testPoint = screenPosition(-tPS.x, tPS.y, tPS.z)
	listenMessages()

	// tableControl = new CenterControl(320,475)
	
}

function draw() {
  	background(bckColor) 
	let user = createVector(mouseX,mouseY)
	show3D()
	show2d() 
	showPointsOfInterest(50)
	showFlatMap(pointsEarth, color(0,255,0))
	showVectorMap(pointsEarth,screenPointsEarth,color(255,255,255))
	easycam.setCenter([0,0,0],0.0)

}

function showFlatPointsOfInterest(){
 		for(let i = 0; i <400; i++){
			let lR = 400 
			let lLat = asin(pOI[i].z/lR) 
			let lLong = atan2(pOI[i].y, -pOI[i].x ) 
			lLat = lLat *  90/PI * 10 // scaling
			lLong = lLong * 180/PI * 10 // scaling 
			drawLine(lLong, lLat, 0, lLong, lLat, 50 ,0,255,0) 
		}
}

// function touchMoved() {
//   return false;
// }

function show3D(){
	if(threeDviewFlag){
		ambientLight(60, 60, 60) 
 		let v1 = easycam.getPosition(500) 
	 	pointLight(255,255, 255, v1[0], v1[1]+300, v1[2]) 
	 	pointLight(255, 255, 255, v1[0], v1[1]+300, v1[2]) 
	  	texture(earthImg)
	  	noStroke()
	  	// rotating earth in order to match coordinate system location
	  	push()
	  	rotateX(radians(rMX)) 
	  	rotateY(radians(rMY))
	  	rotateZ(radians(rMZ))
	  	// fill(0,0,100)
	  	// drawing EARTH Polygon
	  	sphere(r,20,20)
	  	pop()
		noLights() 
	 	ambientLight(255, 255, 255) 
	  	// texture(sky) 
	  	noStroke() 
	  	fill(50,50,50)
		sphere(r*5,6,6)


		// drawing the spikes from the Points Of Interest
		for(let i = 0; i <400; i++){

			// rename to : pOIx, pOIy, pOIz
			// drawLine(-pOI[i].x,pOI[i].y,pOI[i].z,-pOI2[i].x,pOI2[i].y,pOI2[i].z,0,0,255) 
		}
		drawLine(-tPS.x,tPS.y,tPS.z,-tPE.x,tPE.y,tPE.z,0,255,0)

		// showFlatPointsOfInterest();
	}
}
function keyTyped(){
	if( key ==='m' || key ==='m'){
		threeDviewFlag=!threeDviewFlag
	}
	if(key ==='f' || key ==='F'){
		openFullscreen()
	}
	if(key === 'v' || key === 'V'){
		vectorMapFlag =!vectorMapFlag
	}
	if(key === 'p' || key === 'P'){
		pOIFlag = !pOIFlag
	}
	if(key === 'n' || key === 'N'){
		flatMapFlag = !flatMapFlag
	}
}
function windowResized() {
  	resizeCanvas(windowWidth, windowHeight,true)
  	if(easycamIntialized){
  		easycam.setViewport([0,0,windowWidth, windowHeight])
	}
  	resize()
}

// LISTEN FOR NEW TRACKED DEVICES AND UPDATES
function listenMessages(){

	socket.on('addDevice', function(data){
		let thisDevice = new TrackedDevice()
		thisDevice.uniqueId = data.id
		thisDevice.x = data.x * windowWidth
		thisDevice.y = data.y * windowHeight
		thisDevice.rotation = data.rot
		testTrackDevices.push(thisDevice)
	}) 
	socket.on('updateDevice', function(data){
		let id = data.id 
		testTrackDevices.forEach( element => {
			if(element.uniqueId === id){
				element.x = data.x * windowWidth
				element.y = data.y * windowHeight
				element.rotation = data.rot
			}
		})
	})
	socket.on('removeDevice', function(data){
		let id = data.id 
		testTrackDevices.forEach( function(element,index) {
			if(element.uniqueId == id ){
				testTrackDevices.splice(index,1)
			}
		})
	}) 
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
	strokeWeight(1)
	line(testPoint.x + windowWidth/2, testPoint.y +windowHeight/2,testPoint2.x + windowWidth/2, testPoint2.y + windowHeight/2 )
	if(testTrackDevices.length>0){
		testTrackDevices.forEach( element => {
			element.calculateRange()
			// uncomment this if the tableControl object is available
			// tableControl.interact(element.smoothPosition.x,element.smoothPosition.y,element.smoothRotation,element.uniqueId)
		})
		testTrackDevices.forEach(element =>{
			if(element.inRange){
				element.show()				
			}
		})
	}
	easycam.endHUD()
}

// function calculateMaps

// let logDeltaOnce = false
function setMap(map, mapPoints, screenMapPoints){

	let mapLong = map.getColumn(0)
	let mapLat = map.getColumn(1)

	let countTest=0
	console.log("total points : " + mapLong.length)
	for(let i = 0; i < mapLong.length; i ++){

		let latAt = radians(mapLat[i])
		let longAt = radians(mapLong[i])
		let point = createVector(0,0,0)
		point.x = r * Math.cos(latAt) * Math.cos(longAt )
		point.y = r * Math.cos(latAt) * Math.sin(longAt )
		point.z = r * Math.sin(latAt)
		mapPoints.push(point)
		// * note for some reason, the x-projection needs to be negative (-) otherwise the maps are mirrored
		// * it applies to all other points as well
		let screenPoint = screenPosition(-point.x,point.y,point.z)
		let screen2DVector = createVector(screenPoint.x,screenPoint.y)
		screenMapPoints.push(screen2DVector)
				

	}

	

}

let deltas = []
let calcDeltasOnce = false

function showVectorMap(mapPoints, screenMapPoints, farbe){
	if(vectorMapFlag){
		let step = 12
		for( let i = 0 ; i < screenMapPoints.length -step ; i = i +step){
					let screenPoint = screenPosition(-mapPoints[i].x,mapPoints[i].y,mapPoints[i].z)
					let screen2DVector = createVector(screenPoint.x,screenPoint.y)
					screenMapPoints[i] = screen2DVector
		}	
		// strokeWeight(1)
		easycam.beginHUD()
			// beginShape()
			stroke(farbe)
			// fill(255,10)
			strokeWeight(0.5)
			noFill()
			let shaped = false
			let indexError =0
			let indexR = 0
			let indexG = 0
			let indexB = 0
			for( let i = 0; i < screenMapPoints.length-step ; i = i +step ){
				if(i>step){
					let fixI = i
					if(!calcDeltasOnce){
						deltas[i] = dist(mapPoints[i].x,mapPoints[i].y,mapPoints[i].z,mapPoints[i-step].x,mapPoints[i-step].y,mapPoints[i-step].z)
					}
					if(deltas[i]< 10.25+step && !shaped){
						beginShape()
						shaped=true
						vertex(screenMapPoints[i].x + windowWidth/2, screenMapPoints[i].y + windowHeight/2)
					}else{
						if(shaped && deltas[fixI] <10.25+step){
							vertex(screenMapPoints[i].x + windowWidth/2, screenMapPoints[i].y + windowHeight/2)
						}else{
							if(deltas[fixI]>10.25+step){
								endShape()
								shaped=false
								indexError++
							}
						}
					}
				}
			}
			calcDeltasOnce =true
		easycam.endHUD()
	}
}

function showFlatMap(mapPoints,farbe){
	if(flatMapFlag){
		let step = 15
		let lastLat
		let lastLong
		let scaleX = 5 
		let scaleY = 10
		for ( let i = 0 ; i < mapPoints.length-step; i = i + step){
				let lR = 400 
				let lLat = asin(mapPoints[i].z/lR) 
				let lLong = atan2(mapPoints[i].y, -mapPoints[i].x )			
				lLat = lLat *  90/PI * scaleY // scaling
				lLong = lLong * 180/PI * scaleX // scaling 
				// mapping longitude from -180 - 180º to the other way around 
				if(lLong<=-55){
					lLong = map(lLong,-(180*scaleX),0,0,(180*scaleX))
				}else{
					lLong = map(lLong,0,(180*scaleX),-(180*scaleX),0)
				}
				if(i> 0){
					let delta = fastDist(lLong,lLat,0,lastLong,lastLat,0)
					if(delta<(4000)){
						drawLine(lLong, lLat, 0, lastLong, lastLat, 0 ,255,255,255)
					}
				}
				lastLat		=	lLat
				lastLong	=	lLong
	
		}
		drawLine((180*scaleX),-400,0,-(180*scaleX),400,0,255,0,0)
		// meridian or longitude 0
		drawLine(-110,-400,0,-110,400,0,255,0,100)
		// equator or latitude 0
		drawLine(-(180*scaleX),0,0,(180*scaleX),0,0,255,100,0)
	}
}

function fastDist(  ax, ay,  az, bx, by, bz )
{
  let fdist = (bx - ax) * (bx - ax) + (by - ay) * (by - ay) + (bz - az) * (bz - az)
  // fdist = fdist
  return fdist
}
// rename this function - show Points Of Interest
function showPointsOfInterest(amount){
	if(pOIFlag){
		let testPoints = []
		// the screenPoisition() function projects coordinates from 3D space into the 2D projections of the Screen
		let tZurich = screenPosition(-zurich.x,zurich.y,zurich.z)
		let tCDMX = screenPosition(-cdmx.x,cdmx.y,cdmx.z)
		for(let i = 0 ; i <amount; i++){
			testPoints[i] = screenPosition(-pOI[i].x, pOI[i].y, pOI[i].z)
		}
		let user = createVector(mouseX - windowWidth/2,mouseY - windowHeight/2)
		// in case the touch display or device is available use the touchX instead
		if(isTouch ){
			user = createVector (touchX - windowWidth/2 , touchY - windowHeight/2 )
		}
		// similar to pushMatrix()
		easycam.beginHUD()
			for(let i = 0; i < amount;i++){
				if(user.dist(testPoints[i])<10){
					fill(255,255,255)
					noStroke()
					circle(testPoints[i].x + windowWidth/2, testPoints[i].y + windowHeight/2, 15)
					let lat = Math.asin(pOI[i].z / r )
					let lon = Math.atan2(pOI[i].y, pOI[i].x)
					lat = lat * 180 / Math.PI
					lon = lon * 180 / Math.PI
					textSize(12)
					let latLon = 'lat : ' + lat.toFixed(3) + ' , lon : '+ lon.toFixed(3);
					text( latLon ,testPoints[i].x + windowWidth/2 + 10, testPoints[i].y + windowHeight/2 + 5 )
				}else{
					fill(200,200,200)
					noStroke()
					circle(testPoints[i].x + windowWidth/2, testPoints[i].y + windowHeight/2, 2)
				}
			}
			fill(255,100,100)
			if(user.dist(tZurich)<25){
				let lat = Math.asin(zurich.z / r)
				let lon = Math.atan2(zurich.y,zurich.x)
				lat = lat * 180 / PI
				lon = lon * 180 / PI
				textSize(16)
				let latLon = 'ZURICH, LAT : ' + lat.toFixed(3) + ' , LON : '+ lon.toFixed(3) + ' , Z pos : ' + tZurich.z
				if(mouseX>windowWidth/2){
					text( latLon ,tZurich.x + windowWidth/2 - 240, tZurich.y + windowHeight/2 + 25 )
				}else{
					text( latLon ,tZurich.x + windowWidth/2 + 20, tZurich.y + windowHeight/2 + 25 )
				}
				circle(tZurich.x + windowWidth/2,tZurich.y + windowHeight/2,25)
			}else{
				circle(tZurich.x + windowWidth/2,tZurich.y + windowHeight/2,15)
			}
			fill(100,100,255)
			circle(tCDMX.x + windowWidth/2,tCDMX.y + windowHeight/2,5)
		// popMatrix()
		easycam.endHUD()
	}
}
function mouseClicked() {

}
function drawLine(x1, y1, z1, x2, y2, z2, r,g,b){
	fill(r,g,b) 
	stroke(r,g,b) 
	strokeWeight(0.5) 
  	beginShape() 
  	vertex(x1,y1,z1) 
  	vertex(x2,y2,z2) 
  	endShape() 
	noStroke() 
}



//  ****** Classes ******

// *** CLASS FOR THE TRACKED DEVICE *** //
class TrackedDevice{
	constructor(){
		this.uniqueId = -1
		this.identifier = -1
		this.x = 0.0
		this.y = 0.0
		this.rotation =0.0
		this.intensity = 0.0
		this.dead = false
		this.smoothPosition  = createVector(0.0,0.0)
		this.smoothRotation = 0.0
		this.inRange = false
		this.angle = 0
		this.sizeL = 180
		this.thisLabel = new Label()
		this.oldPos = createVector(0,0)
		
	}
	update(){
		let currPos = createVector ( this.x,this.y )
		let delta = currPos.dist(this.oldPos)
		let alpha = 0.1
		this.smoothRotation = this.easeFloat2((360 - this.rotation), this.smoothRotation, 0.85)
		this.smoothPosition.x = this.easeFloat2(this.x, this.smoothPosition.x, alpha)
   		this.smoothPosition.y = this.easeFloat2(this.y, this.smoothPosition.y, alpha)
		this.angle = Math.atan2(this.smoothPosition.y - windowHeight/2, this.smoothPosition.x - windowWidth/2) * 180 / Math.PI
		this.oldPos.x = this.smoothPosition.x
		this.oldPos.y = this.smoothPosition.y
	}
	show(){
		let radius = 45
		let lSize = map(this.smoothRotation,0,360,10,75)
		let rotX = (0 + radius) * Math.cos(radians(this.smoothRotation))
		let rotY = (0+ radius) * Math.sin(radians(this.smoothRotation))

		fill(255,255,100, 25+map(this.smoothRotation,0,360,0,150))
		noStroke()
		ellipse(this.smoothPosition.x,this.smoothPosition.y,radius*2 + lSize,radius*2 + lSize)
		fill(255,255,100)
		stroke(0)
		strokeWeight(10)
		circle(this.smoothPosition.x ,this.smoothPosition.y , radius*2)
		stroke(0)
		strokeWeight(10)
		line(this.smoothPosition.x , this.smoothPosition.y  , this.smoothPosition.x + rotX, this.smoothPosition.y + rotY)

		// DISPLAY DEGREES OF ROTATION
		push()
			translate(this.smoothPosition.x+rotX, this.smoothPosition.y+rotY)
			rotate(radians(this.smoothRotation))
			fill(255,255,100)
			textSize(30)
			// text(Math.round(this.smoothRotation,3) + " , " + Math.round(this.smoothPosition.x) + " , " + Math.round(this.smoothPosition.y), 30,10)
			text(Math.round(this.smoothRotation,3), 30,10)
		pop()

		// DISPLAY LABEL
		this.thisLabel.update(this.smoothPosition.x,this.smoothPosition.y,this.sizeL, this.smoothRotation + 120)		
		noStroke()
	}
	calculateRange(){
		this.update()
		
		// CONDITION DEVICE OUT OF DRAWING RANGE
		if(this.smoothPosition.x > windowWidth || this.smoothPosition.x < 0 || this.smoothPosition.y>windowHeight || this.smoothPosition.y<0){
			// uncomment this to draw a line between the center of the drawing area and the center of the tracked device
			// strokeWeight(2)
			// stroke(0,255,0)
			// line(windowWidth/4,windowHeight/2, this.smoothPosition.x,this.smoothPosition.y)	
			push()
			translate(windowWidth/2,height/2)
			rotate(radians(this.angle))
			let sizeT = 30
			let thisTriangle = new Triangle(windowWidth/2 - sizeT,-sizeT,sizeT)
			thisTriangle.show()
			pop()

			this.inRange = false
		}else{
			this.inRange = true
		}
	}
	easeFloat (target, value, alpha = 0.1) {
    	const d = target - value
    	return value + (d * alpha)
  	}
	easeFloat2 (target, value, alpha ){
	value = value * alpha + target *(1-alpha)
	return value
	}
  	easeFloatCircular (target, value, maxValue, alpha = 0.1) {
    	let delta = target - value
    	const altDelta = maxValue - Math.abs(delta)

    	if (Math.abs(altDelta) < Math.abs(delta)) {
      		delta = altDelta * (delta < 0 ? 1 : -1)
    	}
		return value + (delta * alpha)
	}
	radians (degrees) {
		let radians = degrees * (Math.PI / 180)
		return radians
	}
}
// CLASS TO DRAW THE TRIANGLE
class Triangle{
	constructor(x, y, size){
		this.x = x
		this.y = y
		this.size = size
	}
	update(){

	}
	show(){
		noStroke()
		fill(255,255,100)
		beginShape()
		vertex(this.x,this.y)
		vertex(this.x,this.y+this.size*2)
		vertex(this.x+this.size, this.y+this.size)
		endShape(CLOSE)
		textSize(16)
		text('OBJECT OUT OF RANGE', this.x-200,this.y+this.size+4)
	}
}

// CLASS TO DRAW THE LABEL
class Label{
	constructor(x,y,size, rotation){
		this.x =0
		this.y = 0
		this.size = 0
		this.rotation = 0
		this.count = 0
		this.oldRotation = 0
		this.oldY = 0
		this.labelOff=false
		this.opacity = 0
	}
	update(x,y,size,rotation){

		this.x = x
		this.y = y
		this.size = size
		this.rotation = Math.round(rotation)

		if(this.rotation!=this.oldRotation){
			this.count=30
			this.labelOff = false

		}else{
			if(this.count>0){
				this.count --
			}else{
				this.labelOff = true
			}
		}
		this.opacity = map(this.count,0,30,0,255)
		if(!this.labelOff){
			this.show()
		}
		
		this.oldRotation = this.rotation

	}

	show(){
		
		let txtContent =[
			"I'M A PROTOTYPE FOR TANGIBLE INTERACTION AND DATA VISUALIZATION",
			"MOVE ME AROUND TO EXPLORE MY AFFORDANCES!",
			"STUDENTS FROM INTERACTION DESIGN USE ME TO EXPLORE THEIR CONCEPTS",
			"DESIGN ... TECHNOLOGY ... THINKING ... CONCEIVING ...  DOING ...  ",
			"PROTOTYPING"
		]
		let peak = 10
		
		
		let offX=120
		let offY=0
		push()
		strokeWeight(5)
		stroke(255,255,100,this.opacity)
		// fill(100,0,0,this.opacity)
		noFill()
		translate(this.x,this.y)
		rotate(radians(this.rotation))
		beginShape()
		vertex(offX,offY)
		vertex(offX+peak, offY-peak)
		vertex(offX+peak,offY-this.size/3)
		vertex(offX+peak+this.size, offY-this.size/3)
		vertex(offX+peak+this.size,offY+this.size/3)
		vertex(offX+peak, offY+this.size/3)
		vertex(offX+peak,offY+peak)
		endShape(CLOSE)
		textSize(16)
		fill(255,255,100,this.opacity)
		textAlign(CENTER,CENTER)
		text(txtContent[int(map(this.rotation,1,360,-1,4))],offX +30 , offY - this.size/4, this.size-25, this.size/2 )
		pop()

	}
}





