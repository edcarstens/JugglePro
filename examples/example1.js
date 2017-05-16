// Example1
// The simplest example starts a JugglePro viewer
// with defaults for everything.

// Initialize viewer
var viewer = new JPRO.Viewer();
viewer.basePeriod = 40;
viewer.dwellRatio = 0.5;
viewer.setDefaults();
//viewer.zoomDistance = 5000;
//viewer.viewWidth = 800;
//viewer.viewHeight = 600;
viewer.routine.patterns[0].mhn = [[ [[0,3]], [[0,3]], [[0,3]] ]];
viewer.routine.patterns[0].period = 3;
viewer.routine.patterns[0].props = 3;
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
