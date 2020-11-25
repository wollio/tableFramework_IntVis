
let firstDiv
let secondDiv
let thirdDiv
let fourthDiv
let fifthDiv
let sixthDiv


function displayHexPlusLabels(posX,posY,rotation){
 	firstDiv = document.getElementById('first')
    secondDiv = document.getElementById('second')
    thirdDiv = document.getElementById('third')
    fourthDiv = document.getElementById('fourth')
    fifthDiv = document.getElementById('fifth')
    sixthDiv = document.getElementById('sixth')
    let left = posX
    let top = posY

    firstDiv.style.zIndex = 100003
    secondDiv.style.zIndex = 100003
    thirdDiv.style.zIndex = 100003
    fourthDiv.style.zIndex = 100003
    fifthDiv.style.zIndex = 100003
    sixthDiv.style.zIndex = 100003

    firstDiv.style.left = (left - 300) + 'px'
    firstDiv.style.top = (top - 70) + 'px'
    secondDiv.style.left = (left - 134) + 'px'
    secondDiv.style.top = (top + 66) + 'px'
    thirdDiv.style.left = (left - 134) + 'px'
    thirdDiv.style.top = (top + 66) + 'px'
    fourthDiv.style.left = (left - 134) + 'px'
    fourthDiv.style.top = (top + 66) + 'px'
    fifthDiv.style.left = (left - 134) + 'px'
    fifthDiv.style.top = (top + 116) + 'px'
    sixthDiv.style.left = (left + 134) + 'px'
    sixthDiv.style.top = (top + 166) + 'px'

    hexagonShape(posX,posY)
	hexagonLabel(rotation)
}

function hexagonShape(posX, posY){
    let size = 220
    beginShape()
    noFill()
    stroke(255)
    strokeWeight(5)
    for (let side = 0 ; side < 7; side++) {
        vertex(posX + size * Math.cos(side * 2 * Math.PI / 6), posY+ size * Math.sin(side * 2 * Math.PI / 6))
    }
    endShape(CLOSE)
}

function hexagonLabel(rotation){

	if(activeSector == 'food') {
		firstDiv.style.visibility = "visible";
		secondDiv.style.visibility = "";
		thirdDiv.style.visibility = "";
		fourthDiv.style.visibility = "";
		fifthDiv.style.visibility = "";
		sixthDiv.style.visibility = "";
	}
	if(activeSector == 'industry') {
		firstDiv.style.visibility = "";
		secondDiv.style.visibility = "visible";
		thirdDiv.style.visibility = "";
		fourthDiv.style.visibility = "";
		fifthDiv.style.visibility = "";
		sixthDiv.style.visibility = "";
	}
	if(activeSector == 'electricity') {
		firstDiv.style.visibility = "";
		secondDiv.style.visibility = "";
		thirdDiv.style.visibility = "visible";
		fourthDiv.style.visibility = "";
		fifthDiv.style.visibility = "";
		sixthDiv.style.visibility = "";
	}
	if(activeSector == 'landSinks') {
		firstDiv.style.visibility = "";
		secondDiv.style.visibility = "";
		thirdDiv.style.visibility = "";
		fourthDiv.style.visibility = "visible";
		fifthDiv.style.visibility = "";
		sixthDiv.style.visibility = "";
	}
	if(activeSector == 'buildings') {
		firstDiv.style.visibility = "";
		secondDiv.style.visibility = "";
		thirdDiv.style.visibility = "";
		fourthDiv.style.visibility = "";
		fifthDiv.style.visibility = "visible";
		sixthDiv.style.visibility = "";
	}	
    if(activeSector == 'transportation') {
		firstDiv.style.visibility = "";
		secondDiv.style.visibility = "";
		thirdDiv.style.visibility = "";
		fourthDiv.style.visibility = "";
		fifthDiv.style.visibility = "";
		sixthDiv.style.visibility = "visible";
	}
}

