// Example5: Demonstrate transition from sync to async
// This example shows a transition from an async 3-ball
// cascade to a sync 3-ball box.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();

// view
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-2);
//viewer.zoomDistance = 9000;
viewer.view = new JPRO.View(viewer);

// timing
viewer.basePeriod = 60;
viewer.clock = new JPRO.Clock(viewer.basePeriod);
viewer.dwellRatio = 0.25;

// jugglers
var Adam = new JPRO.Juggler(viewer, 'Adam');
viewer.jugglers = [Adam];

// routine
var rhMapAsync = new JPRO.RowHandMapper('rhmA', [[Adam.hands[0],Adam.hands[1]]], [[2,2]], [[2,2]]);
var casc = new JPRO.Pattern([[ [[0,3]] ]], rhMapAsync, 3);
// dynamic pattern modification
//var casc2boxSeq = new JPRO.Pattern([[ [[0,3]],[[1,2]],[[0,2]] ]], rhMapAsync, 1);
var casc2boxSeq = new JPRO.ThrowSeq([[ [[0,3]],[[1,2]],[[0,2]] ]], rhMapAsync);
var casc2boxRtn = new JPRO.Routine([casc2boxSeq], 1);
//console.log(casc2boxSeq.toString());
//console.log(casc2boxRtn.toString());
//var testRtn = casc2boxRtn.copy();
//console.log(testRtn.toString());

casc2boxRtn.viewer = viewer;
var casc2box = new JPRO.Dynamic(casc2boxRtn);
casc2box.getRoutine = function(parentRoutine, laf) {
    if (laf) {
	console.log('casc2box getRoutine: laf=' + laf);
    }
    var v = this.routine.viewer;
    console.log(typeof v);
    console.log('r.viewer=' + v);
    console.log('r.viewer.basePeriod' + v.basePeriod);
    console.log('r.viewer.clock=' + v.clock);
    //v.clock.basePeriod *= 2;
    //v.basePeriod *= 2;
    //viewer.clock.basePeriod *= 2;
    return this.routine;
};
var rhMapSync = new JPRO.RowHandMapper('rhmS', [[Adam.hands[0]],
					[Adam.hands[1]]], [[1],[1]], [[2],[1]]);
var box = new JPRO.Pattern([[ [[1,1]], [[0,2]] ],
			    [ [[1,2]], [[0,1]] ]], rhMapSync, 3);
var box2cascSeq = new JPRO.Pattern([[ [[0,3]], [[0,1]]  ],
				    [ [[1,1]], [[0,3]] ]], rhMapSync, 1);
viewer.routine = new JPRO.Routine([casc, casc2box, box, box2cascSeq]);
//viewer.routine = new JPRO.Routine([casc, casc2boxSeq, box]);
//viewer.routine = new JPRO.Routine([box]);
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
