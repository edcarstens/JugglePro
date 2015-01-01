// Example2
// This example shows how to use a configuration object
// which is passed to a JugglePro viewer.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();
viewer.basePeriod = 14;
var rhythm = new JPRO.Rhythm([3,1,2,2,
			      3,1,1,1,2 ]);
viewer.clock = new JPRO.Clock(viewer.basePeriod, rhythm);

// Initialize viewer
viewer.setDefaults();

// Modifications
viewer.view.g.z = -16;
viewer.routine.patterns[0].mhn = [[ [[0,3]],[[0,3]],[[0,3]] ]];
viewer.routine.patterns[0].props = 3;
viewer.routine.patterns[0].period = 3;

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
