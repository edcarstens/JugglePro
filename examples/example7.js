// Example7: Simple box pattern
// This example shows a sync box pattern.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();

// view
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-8);
//viewer.zoomDistance = 9000;
viewer.view = new JPRO.View(viewer);

// timing
viewer.basePeriod = 30;
viewer.clock = new JPRO.Clock(viewer.basePeriod);
viewer.dwellRatio = 0.5;

// jugglers
var Adam = new JPRO.Juggler(viewer, 'Adam', 0, new JPRO.Vec(0,200,0));
var bL = JPRO.Handfun.boxL(Adam);
//bL.name = 'bL';
var bR = JPRO.Handfun.boxR(Adam);
//bR.name = 'bR';
var AdamL = new JPRO.Hand(viewer, Adam.name + '_LH', bL, 0);
var AdamR = new JPRO.Hand(viewer, Adam.name + '_RH', bR, 1);
Adam.hands = [AdamL, AdamR];
viewer.jugglers = [Adam];

//alert('bL movement period = ' + bL.movementPeriod);

// routine
var rhms = new JPRO.RowHandMapper('rhmS', [[Adam.hands[0]],
					   [Adam.hands[1]]]);
var boxPat = new JPRO.Pattern([[ [[1,2]], [[0,3]] ],
			       [ [[1,3]], [[0,2]] ]], rhms, 2, 'boxPat');
viewer.routine = new JPRO.Routine([boxPat], 'topRoutine');
viewer.routine.viewer = viewer;

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
