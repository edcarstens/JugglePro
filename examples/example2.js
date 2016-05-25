// Example2
// This example shows how to customize the viewer
// to add your own juggling routine set to a rhythm.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();

// viewer parameters
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-12);

// production
// A production includes cameras, camera angles,
// lighting, music, etc.
viewer.production = new JPRO.Production(viewer);
//viewer.view = new JPRO.View(viewer);

// default anything omitted
//viewer.production.setDefaults();

// performance(s)
// A list of performances, each of which include
// jugglers, rhythms, props, and juggling routines,
var performance = new JPRO.Performance(viewer)
viewer.addPerformance(performance);
//viewer.performances = [performance];
//viewer.basePeriod = 10;

// timing
var rhythm1 = new JPRO.RptSeq([3,3,2], 2, null, 'rhythm1');
var rhythm2 = new JPRO.Seq([4, 4], 'rhythm2');
var rhythm3 = new JPRO.HierRptSeq([rhythm1, rhythm2]);
rhythm3.name = 'rhythm3';
var basePeriod = 10;
performance.clock = new JPRO.Clock(basePeriod, rhythm3, 'clock1');
// default dwell ratios
performance.preDwellRatio = 0.5;
performance.postDwellRatio = 0;

// jugglers
var juggler = new JPRO.Juggler(viewer);
performance.jugglers = [juggler];

// juggler arm movements (omitted)

// juggling routine
//var lh = new JPRO.ControlPoint(viewer, juggler, 0, 0, null, 'lh');
//var rh = new JPRO.ControlPoint(viewer, juggler, 1);
//rh.name = 'rh';
//var cpSeq1 = JPRO.HierRptSeq.createSeq([lh, rh]);
//cpSeq1.name = 'cpSeq1';
//var cpm = new JPRO.ControlPointMapper([cpSeq1], 'cpm');
var cpm = JPRO.ControlPointMapper.create(performance);
var pat = new JPRO.JugPattern(5, 1, cpm, 'pat');
performance.routine = new JPRO.HierRptSeq([pat]);
performance.routine.name = 'routine';

// default anything omitted
//performance.setDefaults();

// initialize viewer
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
