
// New juggling viewer
var viewer = new Viewer(20); // set beat period
viewer.dwell_ratio = 0.5; // set global dwell ratio to 1/3
var scale = viewer.view.scale;
viewer.view.g.z = -10; // increase gravity

// Setup hands
Handfun.scale = scale;
//var LeftHand = Handfun.stationary_l(new Vec(0,200,100), -90);
//var RightHand = Handfun.stationary_r(new Vec(0,200,100), -90);
var LeftHand = Handfun.experiment_l(new Vec(0,200,100), -90);
var RightHand = Handfun.experiment_r(new Vec(0,200,100), -90);

var lh = new Hand(viewer, LeftHand, 'LH', 2, 2, 0);
var rh = new Hand(viewer, RightHand, 'RH', 2, 2, 1);

var ss441 = new Pattern([[ [[0,4]], [[0,4]], [[0,1]] ]], [[lh,rh]], 4);
var ss531 = new Pattern([[ [[0,5]], [[0,3]], [[0,1]] ]], [[lh,rh]], 4);
var ss42 = new Pattern([[ [[0,4]], [[0,2]] ]], [[lh,rh]], 6);
var ss3 = new Pattern([[ [[0,3]] ]], [[lh,rh]], 12);
// transition to shower (excited state pattern)
var ss4 = new Pattern([[ [[0,4]], [[0,5]] ]], [[lh,rh]], 1);
var ss51 = new Pattern([[ [[0,1]], [[0,5]] ]], [[lh,rh]], 4); // excited state
// transition to ground state
var ss41 = new Pattern([[ [[0,1]], [[0,4]], [[0,1]], [[0,3]] ]], [[lh,rh]], 1);

// get transition throw seq from ss51 to ss3
var ss3_state = new State(ss3.mhn, ss3.props);
var ss51_state = new State(ss51.mhn, ss51.props);
console.log('ss3 state = ' + ss3_state.toString());
console.log('ss51 state = ' + ss51_state.toString());
var ss3_15_up = ss3_state.get_transition(ss51_state);
console.log('ss3_15_up = ' + ss3_state.mhn_toString(ss3_15_up));
var ss3_to_ss15 = new Pattern(ss3_15_up, [[lh,rh]], 1);

ss441.beat_period = 25;
ss531.beat_period = 20;
ss3.beat_period = 25;
ss42.beat_period = 25;
ss51.beat_period = 20;
ss4.beat_period = 20;
ss41.beat_period = 25;

// Add patterns to a new Routine
//var routine = new Routine([ss3, ss441, ss42, ss531, ss3_to_ss15, ss51, ss41]);
var routine0 = new Routine([ss3, ss42]);
routine0.iters = 0;
var routine1 = new Routine([ss3, ss441, ss42]);
routine1.iters = 1;
var routine2 = new Routine([ss531, ss3_to_ss15, ss51, ss41]);
routine2.iters = 1;
//var routine = new Routine([routine0, routine1, routine0, ss441, routine0]);
routine = new Routine([routine0, ss3, routine2]);
//routine.push_pat(routine); // BAD - should result in error
//routine.iters = 2;

// init pattern in viewer
viewer.init(routine, [lh, rh]);
viewer.init_animation();

// Gui
var gui = new Gui(viewer);
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
