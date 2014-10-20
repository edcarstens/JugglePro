
// New juggling viewer
var viewer = new Viewer(14); // set beat period
viewer.dwell_ratio = 0.20; // set global dwell ratio to 20%
var scale = viewer.view.scale;

// Setup hands
Handfun.scale = scale;
var LeftHand = Handfun.rshower_l(new Vec(0,0,-300), 90);
var RightHand = Handfun.rshower_r(new Vec(0,0,-300), 90);

var lh = new Hand(viewer, LeftHand, 'LH', 2, 2, 'lhand_2x.png');
lh.my_sprite.scale.x = 1;
lh.my_sprite.scale.y = 0.1;
var rh = new Hand(viewer, RightHand, 'RH', 2, 2, 'rhand_2x.png');
rh.my_sprite.scale.x = 1;
rh.my_sprite.scale.y = 0.1;

var shower = new Pattern([[ [[0,5]], [[0,15]], [[0,5]], [[0,11]] ]],   // (9 balls)
			  [[lh,rh]], -1);      // hands alternate throws
shower.beat_period = 14;

// Add patterns to a new Routine
var routine = new Routine([shower]);

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
