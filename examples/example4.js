// Example4: Dynamic pattern modification
// This demonstrates how the routine can be
// modified dynamically using a Dynamic object.
// The number of iterations of the Dynamic
// returned Routine is modified and at some
// point the Routine containing the Dynamic is
// extinguished by setting iters=0.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();

// view
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-8);
viewer.zoomDistance = 6000;
viewer.view = new JPRO.View(viewer);

// timing
viewer.basePeriod = 15;
viewer.clock = new JPRO.Clock(viewer.basePeriod);
viewer.dwellRatio = 0.32;

// jugglers
// set Adam.hands=0 when customizing hand movements
var Adam = new JPRO.Juggler(viewer, 'Adam', 0, new JPRO.Vec(0, 200, -170));
var AdamLFunc = JPRO.Handfun.revCascL(Adam);
AdamLFunc.name = 'AdamLFunc';
var AdamRFunc = JPRO.Handfun.revCascR(Adam);
AdamRFunc.name = 'AdamRFunc';
var AdamL = new JPRO.Hand(viewer, Adam.name + '_LH', AdamLFunc, 0);
var AdamR = new JPRO.Hand(viewer, Adam.name + '_RH', AdamRFunc, 1);
Adam.hands = [AdamL, AdamR];
viewer.jugglers = [Adam];

// routine
var rhMap = new JPRO.RowHandMapper('rhm', [[Adam.hands[0],Adam.hands[1]]]);
var pat = new JPRO.Pattern([[ [[0,8]],[[0,9]],[[0,7]] ]], rhMap, 2, 'pat');
var pat2 = new JPRO.Pattern([[ [[0,9]],[[0,7]] ]], rhMap, 3, 'pat2');
// dynamic pattern modification
var myDynPat = new JPRO.Pattern([[ [[0,8]] ]], rhMap, 1, 'myDynPat');
var myDynRtn = new JPRO.Routine([myDynPat], 5, 'myDynRtn');
myDynRtn.viewer = viewer;
myDynRtn.entryCB = function(laf) {
    laf || alert('entryCB called upon entering routine, ' + this.name);
};
myDynRtn.exitCB = function(laf) {
    // increment iters
    this.iters++;
    if (this.iters >= 7) this.iters = 0;
    laf || alert('exitCB called upon exiting routine, ' + this.name + '; iters=' + this.iters);
};

/*
var myDyn = new JPRO.Dynamic(myDynRtn, 'myDyn');
myDyn.getRoutine = function(r, laf) {
    if (laf) {
	// Lookahead only
	console.log('EXAMPLE 4: LOOKAHEAD');
    }
    else {
	// Real-time juggling
	console.log('EXAMPLE 4: REAL-TIME JUGGLING');
    }
    var mr = this.routine;
    if ((mr.iterCnt === 0) && mr.enable) {
	if (mr.iters >= 8) {
	    r.iters = 0; // modify containing routine iterations
	    laf || alert('Containing routine extinguished!');
	}
	else {
	    mr.iters++;
	    laf || alert('myDynRtn.iters=' + mr.iters);
	}
    }
    // return Routine or Dynamic
    return mr;
};
*/

var myRtn = new JPRO.Routine([ pat2, myDynRtn ], 2, 'myRtn');
viewer.routine = new JPRO.Routine([pat, myRtn], -1, 'topRtn');
//viewer.routine = new JPRO.Routine([pat, myDynRtn], -1, 'topRtn');
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
