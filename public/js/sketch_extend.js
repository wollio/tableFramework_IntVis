
// check image, iterate through pixels, extract data (brightness) from each pixel and 
// construct the object from the DataPointGeoTIFF class and push(add) it the corresponding array

function dataFromTIFFtoArray(_img,  _pntsFromTIFF, _scale) {
  _img.loadPixels()
  let step = 2;
  console.log(_img.width , _img.height)
  for(let x = 0; x < _img.width; x+=step) {
    for(let y = 0; y < _img.height; y+=step) {
      let [r, g, b] = _img.get(x, y)
  //     // let c = _img.pixels[i*4]
    
      let brghtnss = ( r + g + b ) / 3 
  //     // let x = i % _img.width
  //     // let y = (i-x)/_img.width

      //     // mapping values from x y - longitude and latitude
      let lon = map(x,0, _img.width,-180,180);
      let lat = map(y,0, _img.height,90,-90);

      //console.log(`${lat}:${lon}`);

      // log data on the console
      // console.log(lon , lat , r , g , b, brghtnss)
      // creating datapoint object and pushing it to the arraylist in case
      _pntsFromTIFF.push(new DataPointGeoTIFF(lat, lon, brghtnss, _scale ))
    }
  }
  _img.updatePixels()

}
// function iterates through the objects inside the corresponding array 
// and calls the function display(...) from each object
function visualizeDataFromTIFF(_pntsFromTIFF, _visFlag, _c){
  _pntsFromTIFF.forEach(element => {
      element.display(_visFlag,_c)
  })
}
// a class to store each Pixel as data point
class DataPointGeoTIFF {

  // parameters: lon lat are location values in degrees,  _value corresponds to brightness, and scale the factor affecting the size in the visualization
  constructor(_lat, _lon,  _value,  _scale){
      this.lon = _lon
      this.lat = _lat
      // value stands for the actual color of the pixel, the function brightness() extracts
      // the 'whiteness' of the pixel
      this.value = _value
      this.loc3D = createVector(0,0,0)
      this.scale = _scale
      this.radius = 400 + 5

      //this.pointWeight = map(this.value,0,255,1.2,8) *map(this.value,0,255,1.2,8) * this.scale;


      this.loc3D = toCartesian(this.lat, this.lon, this.radius);
      this.updateValue();
  }

  updateValue() {
      this.pointWeight = map(this.value, 0, 255, 0, 30) * 5 * cummulativePercentage / 100;
      this.loc3Dend = toCartesian(this.lat, this.lon, this.radius + this.pointWeight);
  }

  // first parameter is a boolean for the visualization style and second one is the display color
  display(visStyle,c){
    if(this.value>0){
        this.updateValue();
      if(visStyle){
          //drawLineFromVector(this.loc3D, this.loc3Dend, c, 1);
          drawCylinder(this.loc3D, this.loc3Dend, c, map(this.value, 0, 255, 2, 5));
          //drawLine(this.loc3D.x, this.loc3D.y, this.loc3D.z, this.loc3Dend.x, this.loc3Dend.y, this.loc3Dend.z, c);
      }else{
        strokeWeight(pointWeight)
        stroke(c)
        point(-this.loc3D.x,this.loc3D.y,this.loc3D.z)
      }
    }else{
      // do something else  when the value (brightness is 0 or black or no information)
    }
  }

} 
