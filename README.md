# Table Framework for Bits & Atoms III (Data Literacy & Visualization) and Interactive Visualization Course

This is a node.js server framework using socket.io and including a P5 JS implementation on the client side

To take off and start your own visualization experiments

# preparations:
download or clone this repository
install node js (if you haven't ) in  your machine or virtual machine
https://nodejs.org/en/download/

# use:
in the command line or terminal run (without the $ ):

$ node index.js
or
$ sudo node index.js

open your browser (preferably Chrome for better performance) and type 'http://localhost:8080/' in the address bar

you should see something like this in your browser and a notification on the terminal ->

"new client connected id:  gbyoWN7CmiO8Qy2bAAAB"

# keyboard shortcuts:

'm' - shows a map of the world in 3D

'f' - toggles to full screen

'v' - toggles the vector map of the world

'p' - toggles the points of interest

'n' - toggles flattened map

# Process

## GEOTIFF Integrations:
1. Add this to index.html under the libraries entries
```html
<script src="https://cdn.jsdelivr.net/npm/geotiff"></script>
```
2. Use this script to read geotiff
```javascript
GeoTIFF.fromUrl('../data/Beck_KG_V1_future_0p0083.tif')
        .then(tiff => {
            console.log(tiff);
        });
```





