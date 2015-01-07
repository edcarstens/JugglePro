// Example4: Impossible pattern
// This example shows an 8-ball siteswap with a
// reverse cascade hand movement. The dwell ratio
// was tweaked to produce this incredible
// juggling pattern free of collisions.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();

// view
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-8);
viewer.zoomDistance = 9000;
viewer.view = new JPRO.View(viewer);

// timing
viewer.basePeriod = 15;
viewer.clock = new JPRO.Clock(viewer.basePeriod);
viewer.dwellRatio = 0.32;

// jugglers
// set Adam.hands=0 when customizing hand movements
var Adam = new JPRO.Juggler(viewer, 'Adam', 0, new JPRO.Vec(0, 200, -170));
var AdamLFunc = JPRO.Handfun.revCascL(Adam);
var AdamRFunc = JPRO.Handfun.revCascR(Adam);
var AdamL = new JPRO.Hand(viewer, AdamLFunc, Adam.name + '_LH', 0);
var AdamR = new JPRO.Hand(viewer, AdamRFunc, Adam.name + '_RH', 1);
Adam.hands = [AdamL, AdamR];
viewer.jugglers = [Adam];

// routine
var rhMap = new JPRO.RowHandMapper([[Adam.hands[0],Adam.hands[1]]]);
var pat = new JPRO.Pattern([[ [[0,8]],[[0,9]],[[0,7]] ]], rhMap, 1);
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
