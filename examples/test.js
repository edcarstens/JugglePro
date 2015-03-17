// test hand movement dynamic modification

var viewer = new JPRO.Viewer('vwr');

// view
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-4);
//viewer.zoomDistance = 9000;
viewer.view = new JPRO.View(viewer);

// timing
var myBasePeriod = 100;
viewer.basePeriod = myBasePeriod;
viewer.clock = new JPRO.Clock(viewer.basePeriod, null, 'clk');
viewer.dwellRatio = 0.5;

// juggler
var Ed = new JPRO.Juggler(viewer, 'Ed', null, new JPRO.Vec(0,0,0));
viewer.jugglers = [Ed];

// alternate hand movements for Ed
var sL = JPRO.Handfun.stationaryL(Ed);
var sR = JPRO.Handfun.stationaryR(Ed);
var cL = JPRO.Handfun.cascL(Ed);
var cR = JPRO.Handfun.cascR(Ed);
JPRO.Handfun.testL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, [[[-90, 0, 90, 20, 0, 0]]], 'testL');
};
JPRO.Handfun.testR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, [[[-90, 0, 90, -20, 0, 0]]], 'testR');
};
var tL = JPRO.Handfun.testL(Ed);
var tR = JPRO.Handfun.testR(Ed);

// simple one-ball pattern
var rhma = new JPRO.RowHandMapper('rhma', [[Ed.hands[0],Ed.hands[1]]]);
var rhms = new JPRO.RowHandMapper('rhms', [[Ed.hands[0]],[Ed.hands[1]]]);
var p1 = new JPRO.Pattern([[ [[0,2]], [[0,2]], [[0,2]], [[1,1]] ]], rhma, 1, 'p1');
var p2 = new JPRO.Pattern([[ [[0,1]], [[0,1]], [[0,1]] ],
			   [ [[1,1]], [[1,1]], [[0,2]] ]], rhms, 1, 'p2');
var r1 = new JPRO.Routine([p1], 1, 'r1');
r1.viewer = viewer;
r1.entryCB = function(laf) {
    var v = this.viewer;
    var h0 = this.patterns[0].rhMap.rhm[0][0];
    var h1 = this.patterns[0].rhMap.rhm[0][1];
    h0.movementPeriod = tL.movementPeriod;
    h0.movementBeat = 0;
    h0.hFunc.name = tL.name;
    h0.hFunc.movementPeriod = tL.movementPeriod;
    h0.hFunc.nposes2 = tL.nposes2;
    h0.hFunc.nposes = tL.nposes;
    h0.hFunc.posesXva = tL.posesXva;
    h1.movementPeriod = tR.movementPeriod;
    h1.movementBeat = 0;
    h1.hFunc.name = tR.name;
    h1.hFunc.movementPeriod = tR.movementPeriod;
    h1.hFunc.nposes2 = tR.nposes2;
    h1.hFunc.nposes = tR.nposes;
    h1.hFunc.posesXva = tR.posesXva;    
};
var r2 = new JPRO.Routine([p2], 1, 'r2');
r2.viewer = viewer;
r2.entryCB = function(laf) {
    var h0 = this.patterns[0].rhMap.rhm[0][0];
    var h1 = this.patterns[0].rhMap.rhm[1][0];
    
    h0.movementPeriod = sL.movementPeriod;
    h0.movementBeat = 0;
    h0.hFunc.name = sL.name;
    h0.hFunc.movementPeriod = sL.movementPeriod;
    h0.hFunc.nposes2 = sL.nposes2;
    h0.hFunc.nposes = sL.nposes;
    h0.hFunc.posesXva = sL.posesXva;
    
    h1.movementPeriod = sR.movementPeriod;
    h1.movementBeat = 0;
    h1.hFunc.name = sR.name;
    h1.hFunc.movementPeriod = sR.movementPeriod;
    h1.hFunc.nposes2 = sR.nposes2;
    h1.hFunc.nposes = sR.nposes;
    h1.hFunc.posesXva = sR.posesXva;
};

viewer.routine = new JPRO.Routine([r1,r2], -1, 'rtop');
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
