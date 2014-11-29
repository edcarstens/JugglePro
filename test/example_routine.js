
// New juggling viewer
var viewer = new JPRO.Viewer(20); // set beat period
viewer.dwell_ratio = 0.5; // set global dwell ratio to 1/3
var scale = viewer.view.scale;
viewer.view.g.z = -10; // increase gravity

// Setup hands
JPRO.Handfun.scale = scale;
var LeftHand = JPRO.Handfun.revCascL(new JPRO.Vec(0,200,100), -90);
var RightHand = JPRO.Handfun.revCascR(new JPRO.Vec(0,200,100), -90);
//var LeftHand = JPRO.Handfun.experimentL(new JPRO.Vec(0,200,100), -90);
//var RightHand = JPRO.Handfun.experimentR(new JPRO.Vec(0,200,100), -90);

var lh = new JPRO.Hand(viewer, LeftHand, 'LH', 2, 2, 0);
var rh = new JPRO.Hand(viewer, RightHand, 'RH', 2, 2, 1);

var ss441 = new JPRO.Pattern([[ [[0,4]], [[0,4]], [[0,1]] ]], [[lh,rh]], 4);
var ss531 = new JPRO.Pattern([[ [[0,5]], [[0,3]], [[0,1]] ]], [[lh,rh]], 4);
var ss42 = new JPRO.Pattern([[ [[0,4]], [[0,2]] ]], [[lh,rh]], 6);
var ss3 = new JPRO.Pattern([[ [[0,3]] ]], [[lh,rh]], 12);
// transition to shower (excited state pattern)
var ss4 = new JPRO.Pattern([[ [[0,4]], [[0,5]] ]], [[lh,rh]], 1);
var ss51 = new JPRO.Pattern([[ [[0,1]], [[0,5]] ]], [[lh,rh]], 4); // excited state
// transition to ground state
var ss41 = new JPRO.Pattern([[ [[0,1]], [[0,4]], [[0,1]], [[0,3]] ]], [[lh,rh]], 1);

// get transition throw seq from ss51 to ss3
var ss3_state = new JPRO.State(ss3.mhn, ss3.props);
var ss51_state = new JPRO.State(ss51.mhn, ss51.props);
console.log('ss3 state = ' + ss3_state.toString());
console.log('ss51 state = ' + ss51_state.toString());
var ss3_15_up_tmp = ss3_state.getTransition(ss51_state);
var ss3_15_up = new JPRO.Pattern(ss3_15_up_tmp.mhn, [[lh,rh]], 1);
console.log('ss3_15_up = ' + ss3_15_up.toString());

ss441.beat_period = 25;
ss531.beat_period = 20;
ss3.beat_period = 25;
ss42.beat_period = 25;
ss51.beat_period = 20;
ss4.beat_period = 20;
ss41.beat_period = 25;

// Add patterns to a new Routine
//var routine = new Routine([ss3, ss441, ss42, ss531, ss3_15_up, ss51, ss41]);
var routine0 = new JPRO.Routine([ss3, ss42]);
routine0.iters = 0;
var routine1 = new JPRO.Routine([ss3, ss441, ss42]);
routine1.iters = 1;
var routine2 = new JPRO.Routine([ss531, ss3_15_up, ss51, ss41]);
routine2.iters = 1;
//var routine = new JPRO.Routine([routine0, routine1, routine0, ss441, routine0]);
routine = new JPRO.Routine([routine0, ss3, routine2]);
//routine.push_pat(routine); // BAD - should result in error
//routine.iters = 2;

// init pattern in viewer
viewer.init(routine, [lh, rh]);
viewer.initAnimation();

// Gui
var gui = new JPRO.Gui(viewer);
gui.init();

viewer.enable = 1;
$("#pause_button").show();
$("#start_button").hide();

// Start animation
requestAnimFrame( animate );

function animate() {
    if (viewer.enable) {
	requestAnimFrame( animate );
	viewer.update();
    }
}
