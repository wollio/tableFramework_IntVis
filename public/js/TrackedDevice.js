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

        if (this.action === 'sectorSelect') {
            if (activeSector === 'industry') {

                //display industry
            } else if (activeSector === 'electricity') {

            }
        } else if (this.action === 'amountSelect') {
            //display amount select
        }

        let radius = 45
        let lSize = map(this.smoothRotation,0,360,10,75)
        let rotX = (radius) * Math.cos(radians(this.smoothRotation))
        let rotY = (radius) * Math.sin(radians(this.smoothRotation))

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
        if(this.smoothPosition.x > windowWidth/2 || this.smoothPosition.x < 0 || this.smoothPosition.y>windowHeight/2 || this.smoothPosition.y<0){
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
