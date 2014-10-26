
// New juggling viewer
var viewer = new Viewer(30); // set beat period
viewer.dwell_ratio = 0.33; // set global dwell ratio to 1/3
var scale = viewer.view.scale;

// Setup hands
Handfun.scale = scale;
var LeftHand = Handfun.rev_casc_l(new Vec(0,0,0), 90);
var RightHand = Handfun.rev_casc_r(new Vec(0,0,0), 90);

var lh = new Hand(viewer, LeftHand, 'LH', 2, 2, 0);
var rh = new Hand(viewer, RightHand, 'RH', 2, 2, 1);

var cascade = new Pattern([[ [[0,19]], [[0,17]], [[0,15]] ]],   // (17 balls)
			  [[lh,rh]], -1);      // hands alternate throws
cascade.beat_period = 11;

// Add patterns to a new Routine
var routine = new Routine([cascade]);

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
