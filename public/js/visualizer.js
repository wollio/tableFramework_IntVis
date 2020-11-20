// render cylinder
let heading = createVector(v2.x-v1.x, v2.y-v1.y);
let midpoint =
push();
translate(midpoint);
rotate(heading.heading() + PI/2.0);
cylinder(20, heading.mag());
pop();

function drawCylinder(startPoint, endPoint, c) {
    push();
    fill(c);

    let v1 = copyVector(startPoint).sub(copyVector(endPoint));
    let dist = startPoint.dist(endPoint);

    let rho = sqrt(pow(v1.x, 2)+pow(v1.y, 2)+pow(v1.z, 2));
    let phi = acos(v1.z/rho);
    let the = atan2(v1.y, v1.x);

    v1.mult(-0.5);
    let v2 = copyVector(startPoint);

    translate(v2.x, v2.y, v2.z);
    translate(v1.x, v1.y, v1.z);
    rotateZ(the);
    rotateY(phi);
    rotateX(PI / 2.0);

    cylinder(5, dist, 7, 1);
    //cone(4, 70);
    pop();
}

function copyVector(vec) {
    return createVector(vec.x, vec.y, vec.z);
}

function drawCoordinates() {
    push();
    let size = 20;
    stroke(color(255, 0, 0));
    line(0, size, 0, 0, 0, 0);
    stroke(color(0, 255, 0));
    line(0, 0, 0, size, 0, 0);
    stroke(color(0, 0, 255));
    line(0, 0, 0, 0, 0, size);

    pop();
}
