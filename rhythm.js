
// New juggling viewer
var viewer = new Viewer(30); // set beat period
var scale = viewer.view.scale;
viewer.view.g.z = -16; // change gravity

// Setup hands
Handfun.scale = scale;
var LeftHand = Handfun.stationary_l(new Vec(0, 200, 0), -90);
var RightHand = Handfun.stationary_r(new Vec(0, 200, 0), -90);
var lh = new Hand(viewer, LeftHand, 'LH', 3, 2, 'lhand_2x.png');
var rh = new Hand(viewer, RightHand, 'RH', 3, 2, 'rhand_2x.png');

// New juggling patterns
var cascade = new Pattern([[ [[0,6]], [[0,0]], [[0,0]], [[1,6]], [[0,0]], [[0,0]], [[0,3]], [[0,0]], [[0,0]], [[0,3]], [[0,0]], [[0,0]],
			     [[1,4]], [[0,0]], [[0,2]], [[0,0]] ],
			   [ [[1,3]], [[1,0]], [[1,0]], [[1,3]], [[1,0]], [[1,0]], [[1,6]], [[1,0]], [[1,0]], [[0,5]], [[1,0]], [[1,0]],
			     [[1,2]], [[1,0]], [[0,5]], [[1,0]] ]],
			  [[lh,null,null,lh,null,null,lh,null,null,lh,null,null,lh,null,lh,null],
			   [rh,null,null,rh,null,null,rh,null,null,rh,null,null,rh,null,rh,null]], -1);
cascade.beat_period = 30;

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
