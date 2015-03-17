// Example6: Demonstrate transition from sync to async
// This example shows a transition from an async 5-ball
// cascade to a sync 5-ball box.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();

// view
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-8);
//viewer.zoomDistance = 9000;
viewer.view = new JPRO.View(viewer);

// timing
var myBasePeriod = 20;
var myBasePeriodSync = 40;
viewer.basePeriod = myBasePeriod;
viewer.clock = new JPRO.Clock(viewer.basePeriod);
viewer.dwellRatio = 0.5;

// jugglers
var Adam = new JPRO.Juggler(viewer, 'Adam', null, new JPRO.Vec(0,200,0));
viewer.jugglers = [Adam];

// alternate hand movements for Adam
var sL = JPRO.Handfun.stationaryL(Adam);
var sR = JPRO.Handfun.stationaryR(Adam);
var cL = JPRO.Handfun.cascL(Adam);
var cR = JPRO.Handfun.cascR(Adam);
//var bL = JPRO.Handfun.boxL(Adam);
//var bR = JPRO.Handfun.boxR(Adam);
var bL = sL;
var bR = sR;

//alert('bL movement period = ' + bL.movementPeriod);

// TODO - debug why changing hand movements fails
//sL = cL;
//sR = cR;

// routine
var rhma = new JPRO.RowHandMapper('rhmA', [[Adam.hands[0],Adam.hands[1]]]);
var casc = new JPRO.Pattern([[ [[0,5]] ]], rhma, 5, 'casc');
// dynamic pattern modification
//  2 4
// 1 3 5
//
// 2 4 1
//  3 5
//
//  4 1
// 3 52
//
// 4 1
//  523
//
//  14
// 532
//
// 14
// 325
var casc2boxSeq = new JPRO.ThrowSeq([[ [[0,5]],[[1,4]],[[1,4]],[[0,3]] ]], rhma, 'casc2boxSeq');
var casc2boxSeq2 = new JPRO.ThrowSeq([[ [[1,3]] ]], rhma, 'casc2boxSeq2');
var casc2box = new JPRO.Routine([casc2boxSeq], 1, 'casc2box');
casc2box.viewer = viewer;
var casc2box2 = new JPRO.Routine([casc2boxSeq2], 1, 'casc2box2');
casc2box2.viewer = viewer;
casc2box2.entryCB = function(laf) {
    var v = this.viewer;
    v.clock.beatPeriod = myBasePeriodSync;
    v.clock.basePeriod = myBasePeriodSync;
    v.basePeriod = myBasePeriodSync;
};

var rhms = new JPRO.RowHandMapper('rhmS', [[Adam.hands[0]],
					   [Adam.hands[1]]]);
var boxPat = new JPRO.Pattern([[ [[0,3]], [[1,2]] ],
			       [ [[0,2]], [[1,3]] ]], rhms, 6, 'boxPat');
var box = new JPRO.Routine([boxPat], 1, 'box');
box.viewer = viewer;
box.entryCB = function(laf) {
    var v = this.viewer;
    v.clock.beatPeriod = myBasePeriodSync;
    v.clock.basePeriod = myBasePeriodSync;
    v.basePeriod = myBasePeriodSync;
    var h0 = this.patterns[0].rhMap.rhm[0][0];
    var h1 = this.patterns[0].rhMap.rhm[1][0];
    
    h0.movementPeriod = bL.movementPeriod;
    h0.movementBeat = 0;
    h0.hFunc.name = bL.name;
    h0.hFunc.movementPeriod = bL.movementPeriod;
    h0.hFunc.nposes2 = bL.nposes2;
    h0.hFunc.nposes = bL.nposes;
    h0.hFunc.posesXva = bL.posesXva;
    
    h1.movementPeriod = bR.movementPeriod;
    h1.movementBeat = 0;
    h1.hFunc.name = bR.name;
    h1.hFunc.movementPeriod = bR.movementPeriod;
    h1.hFunc.nposes2 = bR.nposes2;
    h1.hFunc.nposes = bR.nposes;
    h1.hFunc.posesXva = bR.posesXva;
};

//var rhms2 = new JPRO.RowHandMapper('rhmS2', [[Adam.hands[0]],[Adam.hands[1]]]);
// 12
// 345
//
// 2 3
// 45 1
//
//  3 2
// 5 1 4
var box2cascSeq = new JPRO.ThrowSeq([[ [[0,4]], [[0,4]], [[0,1]] ],
				     [ [[0,2]], [[0,5]], [[0,5]] ]], rhms, 'box2cascSeq');
var box2asyncPat = new JPRO.Pattern([[ [[0,5]] ]], rhma, 2, 'box2asyncPat');
var box2async = new JPRO.Routine([box2asyncPat], 1, 'box2asyncRtn');
box2async.viewer = viewer;
box2async.entryCB = function(laf) {
    var v = this.viewer;
    v.clock.beatPeriod = myBasePeriod;
    v.clock.basePeriod = myBasePeriod;
    v.basePeriod = myBasePeriod;
    var h0 = this.patterns[0].rhMap.rhm[0][0];
    var h1 = this.patterns[0].rhMap.rhm[0][1];
    h0.movementPeriod = cL.movementPeriod;
    h0.movementBeat = 0;
    h0.hFunc.name = cL.name;
    h0.hFunc.movementPeriod = cL.movementPeriod;
    h0.hFunc.nposes2 = cL.nposes2;
    h0.hFunc.nposes = cL.nposes;
    h0.hFunc.posesXva = cL.posesXva;
    h1.movementPeriod = cR.movementPeriod;
    h1.movementBeat = 0;
    h1.hFunc.name = cR.name;
    h1.hFunc.movementPeriod = cR.movementPeriod;
    h1.hFunc.nposes2 = cR.nposes2;
    h1.hFunc.nposes = cR.nposes;
    h1.hFunc.posesXva = cR.posesXva;
};
viewer.routine = new JPRO.Routine([casc, casc2box, casc2box2, box, box2cascSeq, box2async], -1, 'topRoutine');
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
