// Example1
// The simplest example starts a JugglePro viewer
// with defaults for everything.

// Initialize viewer
var viewer = new JPRO.Viewer();
viewer.basePeriod = 14;
viewer.dwellRatio = 0.5;
viewer.setDefaults();
viewer.routine.patterns[0].mhn = [[ [[0,5]], [[0,5]], [[0,5]] ]];
viewer.routine.patterns[0].period = 3;
viewer.routine.patterns[0].props = 6;
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
