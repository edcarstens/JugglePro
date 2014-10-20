
function Viewer(beat_period) {
    // Methods
    this.init_vars = init_vars;
    this.set_beat_period = set_beat_period;
    this.init = init;
    this.init_hands = init_hands;
    this.init_props = init_props;
    this.init_rotation_matrix = init_rotation_matrix;
    this.grab_new_prop = grab_new_prop;
    this.init_animation = init_animation;
    this.update_hands = update_hands;
    this.update_props = update_props;
    this.update_clock = update_clock;
    this.throw_props = throw_props;
    this.update = update; // main animation method
    this.rotate_view_when_enabled = rotate_view_when_enabled;
    this.rotate_view = rotate_view;
    this.drop_prop = drop_prop;
    
    // Members
    // create a new instance of a pixi stage
    this.stage = new PIXI.Stage(0x000000);
    // create a graphics object
    this.grfx = new PIXI.Graphics();
    this.grfx.setStageReference(this.stage);
    this.stage.addChild(this.grfx);
    this.dwell_ratio = 0.5; // global default dwell ratio
    this.set_beat_period(beat_period || 40);
    this.init_vars();
    this.renderer = null;
    this.pattern = null;
    this.routine = null;

    this.testvar = 0; // for experimentation
    
    function init_vars() {
	this.view = new View(this, 800, 600); // scaling factor is 2^4 = 16
	this.ball_colors = [0xbb11bb, 0x1111dd, 0x11bb11, 0xdddd00, 0xee9900, 0xdd1111]

//	    0xdd2222, 0x22dd22, 0x2222dd, 0xbb22bb,
//			    0x22bbbb, 0xbbbb22, 0x888888, 0x1155bb,
//			    0xeeee00, 0xffaa00, 0xaaff00, 0x22aaff];
	this.ball_size = 40; // best not to change this anymore
	this.hands = [];
	this.props = []; // list of available props not being juggled
	this.all_props = []; // complete list of props
	this.nprops = 0; // total number of props
	this.t = 0; // time (iteration)
	this.beat = 0; // beat number (when throws occur)
	//this.renderer = null;
	this.enable = 1;
	//this.pattern = null;
	//this.nprops_not_thrown = 0; // number of props not yet thrown
	this.rot_enable = null; // enable view rotation
	this.rot_period = 5; // used to slow down view rotation
	this.rot_deg = 180;
	this.rot_cnt = 0;
	this.aerial_turn = null;
	this.zoom_in = null;
	this.zoom_out = null;
    }

    function set_beat_period(bp) {
	this.base_period = bp;
	this.min_throw_time = (bp >> 1) + 1; // 1/2 beat period
    }
    
    function init(routine, hands) {
	this.init_rotation_matrix();
	this.routine = routine;
	this.init_hands(hands);
	this.init_props();
	this.enable = this.routine.next_pat(this); // init routine.viewer=this
	this.view.rotate_me(this.r1);
	this.view.translate_me(this.zoom_out);
	this.t = 0; // clear time
	this.beat = 0; // and beat
	//this.beat_period = this.pattern.get_beat_period(this.beat, this.base_beat_period);
	this.throw_props(this.pattern); // make first throws
	return this;
    }

    function init_rotation_matrix() {
	// Precompute rotation matrix to be used
	// by optional view rotation code during
	// animation
	//var rotx = new Rmatrix(-1,0);
	//var roty = new Rmatrix(1,1);
	var rotz = new Rmatrix(1,2);
	var vangle = 0; // view angle
	this.r1 = new Rmatrix(-vangle,0);
	var r1i = new Rmatrix(vangle,0);
	this.aerial_turn = new Matrix();
	this.aerial_turn.x_matrix(this.r1).x_matrix(rotz).x_matrix(r1i);
	this.zoom_out = new Vec(0, 3500, 0);
	this.zoom_in = new Vec(0, -this.zoom_out.y, 0);
    }
    
    function init_hands(hands) {
	this.hands = hands;
	return this;
    }

    function init_props() {
	var i;
	var b;
	this.nprops = 30;
	for (i=0; i<this.nprops; i++) {
	    b = new Ball(this, new Vec(),
			 this.ball_colors[i % this.ball_colors.length],
			 this.ball_size); //.caught_by(this.hands[i % this.hands.length]);
	    this.props.push(b);
	    this.all_props.push(b);
	    this.view.push_prop(b); // push this ball to the view world list
	}
	this.grfx.clear();
	return this;
    }

    function init_animation() {
	
	// create a renderer instance
	this.renderer = PIXI.autoDetectRenderer(this.view.width, this.view.height);

	// add the renderer view element to the DOM
	document.body.appendChild(this.renderer.view);

	return this;
    }

    function grab_new_prop() {
	var p;
	console.log('grabbing new prop');
	if (this.props.length == 0) {
	    console.log('No props left to grab!');
	    return null;
	}
	else {
	    p = this.props.pop();
	    p.in_play = 1;
	    return p;
	}
    }

    function drop_prop(p) {
	console.log('dropping a prop');
	p.in_play = null;
	p.in_hand = null;
	this.props.push(p);
    }
    
    function update_hands() {
	var i;
	for (i=0; i<this.hands.length; i++) {
	    this.hands[i].update();
	}
	return this;
    }

    function update_props() {
	var i;
	for (i=0; i<this.all_props.length; i++) {
	    this.all_props[i].update();
	}
	return this;
    }

    function update_clock(pattern) {
	if (this.t >= this.beat_period-1) {
	    this.t = 0;
	    if (this.beat >= pattern.period-1) {
		this.beat = 0;
		//this.enable = pattern.repeat();
		this.enable = pattern.repeat() || this.routine.next_pat();
		if (this.enable) console.log("restart pattern");
	    }
	    else {
		this.beat++;
	    }
	    for (i=0; i<this.hands.length; i++) {
		this.hands[i].next_beat(); // for hand movements
	    }
	    pattern.next_beat(); // for multi-phase hands per row
	    //this.beat_period = pattern.get_beat_period(this.beat, this.base_beat_period);
	    return 1; // new beat - do throws
	}
	else {
	    this.t++; // increment time (once per animation frame)
	    return null;
	}
    }

    function throw_props(pattern) {
	var i,k,pairs,dest_row,dest_hand,row_hand,unthrown;
	for (i=0; i<pattern.rows; i++) {
	    pairs = pattern.mhn[i][this.beat];
	    row_hand = pattern.get_hand(i);
	    unthrown = 0;
	    for (k=0; k<pairs.length; k++) {
		if (pairs[k][1] > 0) {
		    dest_row = pairs[k][0];
		    dest_hand = pattern.get_hand(dest_row, pairs[k][1]);
		    if ((dest_hand != row_hand) || (pairs[k][1] != row_hand.period) ||
			(row_hand.nprops() == 0)) {
			row_hand.throw_prop(dest_hand, pairs[k][1]);
		    }
		    else {
			// do not make unnecessary little throw
			console.log(row_hand.name + ' not throwing a ' + pairs[k][1] + ' to ' + dest_hand.name);
			unthrown++;
		    }
		}
	    }
	    if (row_hand.nprops() > unthrown) {
		row_hand.drop_prop(row_hand.nprops() - unthrown); // fix the problem
	    }
	}
	return this;
    }

    function update() {
	var i;

	this.grfx.clear(); // clear graphics

	// Update hands/balls
	this.update_hands().update_props();

        // Optional view rotation
	this.rotate_view_when_enabled(this.aerial_turn, this.zoom_in, this.zoom_out);
	
	// Do throws once every beat period
	this.update_clock(this.pattern) && this.throw_props(this.pattern);
	
	// render the stage
	this.renderer.render(this.stage);

	return this;
    }

    function rotate_view_when_enabled(rot, zoom_in, zoom_out) {
	if (this.rot_enable) {
	    this.rot_cnt++;
	    if (this.rot_cnt > this.rot_period) {
		this.rot_cnt = 0;
		this.rotate_view(rot, zoom_in, zoom_out);
	    }
	}
    }
    
    function rotate_view(rot, zoom_in, zoom_out) {
	var x,y,hand_scale_lb,rot_rad,i;
	hand_scale_lb = 0.3;
	function hsbound(xx, limit) {
	    var x = xx;
	    if (Math.abs(x) < limit) {
		x = limit;
	    }
	    return x;
	}
	
	this.view.translate_me(zoom_in);
	this.view.rotate_me(rot);
	this.view.translate_me(zoom_out);
	this.rot_deg++;
	if (this.rot_deg > 180) this.rot_deg -= 360;
	rot_rad = this.rot_deg * Math.PI / 180; // convert to radians
//	for (i=0; i<this.hands.length; i++) {
//	    this.hands[i].my_sprite.rotation = rot_rad;
//	    // Scale hands' sprites in x and y directions
//	    x = 2*Math.abs(Math.cos(rot_rad))*this.hands[i].pos_projected.z;
//	    y = 2*Math.abs(Math.sin(rot_rad))*this.hands[i].pos_projected.z;
//	    // Avoid the paper thin disappearing hand issue when
//	    // scale gets too close to zero
//	    x = hsbound(x, hand_scale_lb);
//	    y = hsbound(y, hand_scale_lb);
//	    this.hands[i].my_sprite.scale.x = x;
//	    this.hands[i].my_sprite.scale.y = y;
//	} // for
	return this;
    }

}

