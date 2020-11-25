// *** CLASS FOR THE TRACKED DEVICE *** //

const RADIUSSHOWAMOUNT = 220; //40
const PIE_WEIGHT = 150; //20
const SIZE_TRIANGLE_AMOUNT_DISPLAY = 30; //10

class TrackedDevice {
    constructor(){
        this.uniqueId = -1
        this.identifier = -1
        this.x = 0.0
        this.y = 0.0
        this.rotation = 0.0
        this.intensity = 0.0
        this.dead = false
        this.smoothPosition = createVector(0.0, 0.0)
        this.smoothRotation = 0.0
        this.inRange = false
        this.angle = 0
        this.sizeL = 180
        this.thisLabel = new Label()
        this.oldPos = createVector(0, 0)
    }

    update() {
        let currPos = createVector(this.x, this.y)
        let delta = currPos.dist(this.oldPos)
        let alpha = 0.1
        this.smoothRotation = this.easeFloat2((360 - this.rotation), this.smoothRotation, 0.85)
        this.smoothPosition.x = this.easeFloat2(this.x, this.smoothPosition.x, alpha)
        this.smoothPosition.y = this.easeFloat2(this.y, this.smoothPosition.y, alpha)
        this.angle = Math.atan2(this.smoothPosition.y - windowHeight / 2, this.smoothPosition.x - windowWidth / 2) * 180 / Math.PI
        this.oldPos.x = this.smoothPosition.x
        this.oldPos.y = this.smoothPosition.y
    }

    show() {
        if (this.action === 'sectorSelect') {
            displayHexPlusLabels(this.smoothPosition.x, this.smoothPosition.y, this.smoothRotation)
        } else if (this.action === 'amountSelect') {
            this.showAmountSelect();
        }
    }
    calculateRange() {
        this.update()
        // CONDITION DEVICE OUT OF DRAWING RANGE
        if (this.smoothPosition.x > windowWidth || this.smoothPosition.x < 0 || this.smoothPosition.y > windowHeight || this.smoothPosition.y < 0) {
            // uncomment this to draw a line between the center of the drawing area and the center of the tracked device
            // strokeWeight(2)
            // stroke(0,255,0)
            // line(windowWidth/4,windowHeight/2, this.smoothPosition.x,this.smoothPosition.y)
            push()
            translate(windowWidth / 2, height / 2)
            rotate(radians(this.angle))
            let sizeT = 30
            let thisTriangle = new Triangle(windowWidth / 2 - sizeT, -sizeT, sizeT)
            thisTriangle.show()
            pop()

            this.inRange = false
        } else {
            this.inRange = true
        }
    }
    easeFloat(target, value, alpha = 0.1) {
        const d = target - value
        return value + (d * alpha)
    }
    easeFloat2(target, value, alpha) {
        value = value * alpha + target * (1 - alpha)
        return value
    }
    easeFloatCircular(target, value, maxValue, alpha = 0.1) {
        let delta = target - value
        const altDelta = maxValue - Math.abs(delta)

        if (Math.abs(altDelta) < Math.abs(delta)) {
            delta = altDelta * (delta < 0 ? 1 : -1)
        }
        return value + (delta * alpha)
    }
    radians(degrees) {
        let radians = degrees * (Math.PI / 180)
        return radians
    }
    showAmountSelect() {
        noFill();
        stroke(255);
        strokeWeight(5);
        circle(this.smoothPosition.x, this.smoothPosition.y, RADIUSSHOWAMOUNT);

        let rotation = map(getActivePercentageOfActiveSector(), 0, 100, 0, TWO_PI);
        let sizePie = RADIUSSHOWAMOUNT + PIE_WEIGHT;

        push()
        translate(this.smoothPosition.x, this.smoothPosition.y)
        arc(0, 0, sizePie,  sizePie, 0, rotation);
        fill(255);
        textSize(30);
        text(getActivePercentageOfActiveSector() + "%", RADIUSSHOWAMOUNT, 10);
        rotate(rotation + PI / 2);
        image(textureGuiTriangleAmountDisplay, 0, - RADIUSSHOWAMOUNT + PIE_WEIGHT / 2 , SIZE_TRIANGLE_AMOUNT_DISPLAY, SIZE_TRIANGLE_AMOUNT_DISPLAY);
        pop()
    }
}
