
// New juggling viewer
var viewer = new Viewer(30); // set beat period
var scale = viewer.view.scale;

// Setup hands
Handfun.scale = scale;
//var hand_fcts = new Hand_Functions(scale);
//var LeftHand = hand_fcts.linear_osc(new Vec(-50,0,-200));
//var RightHand = hand_fcts.linear_osc(new Vec(250,0,-200));

//var LeftHand = Handfun.linear_osc(new Vec(-50,0,-200));
//var RightHand = Handfun.linear_osc(new Vec(250,0,-200));
//var LeftHand = Handfun.casc_l(new Vec(0,0,-300), 90);
//var RightHand = Handfun.casc_r(new Vec(0,0,-300), 90);
//var LeftHand = Handfun.rev_casc_l(new Vec(0, 200, 0), -90);
//var RightHand = Handfun.rev_casc_r(new Vec(0, 200, 0), -90);
//var LeftHand = Handfun.rshower_l(new Vec(0,0,-100), 90);
//var RightHand = Handfun.rshower_r(new Vec(0,0,-100), 90);

var LeftHand = Handfun.stationary_l(new Vec(0, 200, 0), -90);
var RightHand = Handfun.stationary_r(new Vec(0, 200, 0), -90);

var lh = new Hand(viewer, LeftHand, 'LH', 3, 2, 'lhand_2x.png');
//lh.my_sprite.scale.x = 1;
//lh.my_sprite.scale.y = 0.1;
var rh = new Hand(viewer, RightHand, 'RH', 3, 2, 'rhand_2x.png');
//rh.my_sprite.scale.x = 1;
//rh.my_sprite.scale.y = 0.1;

// New juggling patterns
//var xx = new Pattern(null, [[lh],[rh]], -1); // sync pattern
//xx.set_period_rows(5,2); // period=5, rows=hands=2
//var xx = new Pattern([[ [[1,3]], [[0,2]], [[1,3]], [[0,2]] ],
//		      [ [[1,2]], [[0,3]], [[1,2]], [[0,3]] ] ],
//		     [[lh],[rh]], -1);
//xx.beat_period = 40;

//var ss978 = new Pattern([[ [[0,9]], [[0,7]], [[0,8]], ]],
//			  [[lh,rh]], 6);      // hands alternate throws
//ss978.beat_period = 17;
var cascade = new Pattern([[ [[0,6]], [[0,0]], [[0,0]], [[1,6]], [[0,0]], [[0,0]], [[0,3]], [[0,0]], [[0,0]], [[0,3]], [[0,0]], [[0,0]],
			     [[1,4]], [[0,0]], [[0,2]], [[0,0]] ],
			   [ [[1,3]], [[1,0]], [[1,0]], [[1,3]], [[1,0]], [[1,0]], [[1,6]], [[1,0]], [[1,0]], [[0,5]], [[1,0]], [[1,0]],
			     [[1,2]], [[1,0]], [[0,5]], [[1,0]] ]],
			  [[lh,null,null,lh,null,null,lh,null,null,lh,null,null,lh,null,lh,null],
			   [rh,null,null,rh,null,null,rh,null,null,rh,null,null,rh,null,rh,null]], -1);
cascade.beat_period = 30;

//var c2 = new Pattern([[ [[1,4]], [[0,0]], [[0,2]], [[0,0]] ],
//		      [ [[1,2]], [[1,0]], [[0,5]], [[1,0]] ]],
//		     [[lh,null],[rh,null]], 1);
//c2.beat_period = 30;

// Add patterns to a new Routine
//var routine = new Routine([xx, ss978, cascade]);
//var routine = new Routine([xx]);
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
