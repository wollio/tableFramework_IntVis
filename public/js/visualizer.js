// render cylinder
let heading = createVector(v2.x-v1.x, v2.y-v1.y);
let midpoint =
push();
translate(midpoint);
rotate(heading.heading() + PI/2.0);
cylinder(20, heading.mag());
pop();

function getMidPoint(startPoint, endPoint) {
    return p5.Vector.lerp(startPoint, endPoint, 0.5);
}

function rotateToDirection(point) {
    let upVec = createVector(0, 1, 0);
    let axisOfRotation = point.cross( upVec );

    let angleOfRotation = upVec.angleBetween( axisOfRotation );
    axisOfRotation.normalize();
    rotate( -angleOfRotation, axisOfRotation );
}

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
    pop();
}

function fastDistVector(vec1, vec2) {
    return fastDist(vec1.x, vec1.y, vec1.z, vec2.x, vec2.y, vec2.z);
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
