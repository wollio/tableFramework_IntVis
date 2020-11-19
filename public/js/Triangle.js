// CLASS TO DRAW THE TRIANGLE
class Triangle {
    constructor(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
    }

    update() {

    }

    show() {
        noStroke()
        fill(255, 255, 100)
        beginShape()
        vertex(this.x, this.y)
        vertex(this.x, this.y + this.size * 2)
        vertex(this.x + this.size, this.y + this.size)
        endShape(CLOSE)
        textSize(16)
        text('OBJECT OUT OF RANGE', this.x - 200, this.y + this.size + 4)
    }
}
