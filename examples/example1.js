// Example1
// The simplest example starts a JugglePro viewer
// with defaults for everything.

// Initialize viewer
var viewer = new JPRO.Viewer();
viewer.setDefaults();
//console.log("viewer.hands=" + viewer.hands);
viewer.init();

// Start animation
requestAnimFrame( animate );

// Animate
function animate() {
    if (viewer.enable) {
	requestAnimFrame( animate );
	viewer.update();
    }
}
