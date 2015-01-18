// Example2
// This example shows how to customize the viewer
// to add your own juggling routine set to a rhythm.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();

// view
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-24);
viewer.view = new JPRO.View(viewer);

// timing
viewer.basePeriod = 11;
var rhythm = new JPRO.Rhythm([3,1,2,2,
			      3,1,1,1,2 ]);
viewer.clock = new JPRO.Clock(viewer.basePeriod, rhythm);
viewer.dwellRatio = 0.5;

// jugglers
var juggler = new JPRO.Juggler(viewer);
viewer.jugglers = [juggler];

// routine
var rhMap = new JPRO.RowHandMapper('rhm', [[juggler.hands[0],juggler.hands[1]]], [[2,2]]);
var pat = new JPRO.Pattern([[ [[0,3]] ]], rhMap, 1);
viewer.routine = new JPRO.Routine([pat]);

// Initialize viewer
viewer.setDefaults();
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
