// Example2
// This example shows how to customize the viewer
// to add your own juggling routine set to a rhythm.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();

// view
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-12);
viewer.view = new JPRO.View(viewer);

// timing
viewer.basePeriod = 10;
var rhythm1 = new JPRO.Rhythm([3,3,2], 1);
rhythm1.name = "rhythm1";
var rhythm2 = new JPRO.Rhythm([rhythm1, 4,4]);
rhythm2.name = "rhythm2";
//var rhythm = new JPRO.Rhythm([3,1,2,2,
//			      3,1,1,1,2]);
//var rhythm = new JPRO.Rhythm([1,2,3,4,5]);
viewer.clock = new JPRO.Clock(viewer.basePeriod, rhythm2);
viewer.dwellRatio = 0.5;

// jugglers
var juggler = new JPRO.Juggler(viewer);
viewer.jugglers = [juggler];

// routine
var rhMap = new JPRO.RowHandMapper('rhm', [[juggler.hands[0],juggler.hands[1]]]);
var pat = new JPRO.Pattern([[ [[0,3]] ]], rhMap, 1, 'pat');
viewer.routine = new JPRO.Routine([pat], -1, 'rtn');

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
