"use strict";

function Hand(viewer, fpos, name, period, movement_period, is_right, dwell_ratios) {
    // object members
    // this.pos = current xyz position
    this.viewer = viewer; // required
    this.view = viewer.view;
    this.name = name || 'hand';
    this.dwell_ratios = dwell_ratios || [this.viewer.dwell_ratio]; // use global default as default
    this.is_right = is_right;
    this.period = period || 2; // number of beats from throw to throw
    this.beat = 0; // beat to keep track of throws
    this.movement_period = movement_period || 2; // number of beats in fpos function
    this.movement_beat = 0; // beat used for fpos function
    this.props = []; // list of props held in this hand
    this.pos_projected = null;
    
    // object methods
    this.fpos = fpos; // position function returns a Vec object (define externally)
    this.update = update;
    this.remove_me = remove_me;
    this.get_dwell = get_dwell;
    this.next_beat = next_beat;
    this.catch_prop = catch_prop;
    this.throw_prop = throw_prop;
    this.nprops = nprops;
    this.drop_prop = drop_prop;
    
    // init sprite
//    if (imgfile) {
//	this.my_sprite = new Sprite3D.fromImage('../jp3d.js/assets/' + imgfile);
//	this.my_sprite.anchor.x = 0.5;
//	this.my_sprite.anchor.y = 0.5;
//    }
//    else {
//	this.my_sprite = null;
//    }

    // call update to init position
    //this.update();
    this.pos = new Vec();
    this.pos_projected = new Vec();

    function update() {
	var dscale,didx;
	var time = this.viewer.t + this.movement_beat * this.viewer.beat_period;
	var pa = this.fpos(time, this.viewer.beat_period);
	this.pos = this.view.transform(pa[0]); // pa[0] is hand position
	this.pos_projected = this.view.project(this.pos);
	var x = this.pos_projected.x;
	var y = this.pos_projected.y;
	//console.log('Hand.update() - hand pos = ' + this.pos.to_string());
	// draw line from hand to wrist to elbow to shoulder
	var g = this.viewer.grfx;
	g.lineStyle(16, 0xffcc66, 1);
	g.moveTo(x, y);
	var tpos = this.view.project(this.view.transform(pa[1]));
	var wpos = this.view.project(this.view.transform(pa[2]));
	var epos = this.view.project(this.view.transform(pa[3]));
	var spos = this.view.project(this.view.transform(pa[4]));
//	g.lineTo(tpos.x, tpos.y);
//	g.moveTo(this.pos_projected.x, this.pos_projected.y);
	//if (wpos.mdist2(this.pos_projected) > 9) {
	    g.lineTo(wpos.x, wpos.y);
	//}
	//if (epos.mdist2(wpos) > 9) {
	    g.lineTo(epos.x, epos.y);
	//}
	//if (spos.mdist2(epos) > 9) {
	    g.lineTo(spos.x, spos.y);
	//}

	// Draw hand
	g.lineStyle(4, 0xffcc66, 1);
	var y_dx = x - wpos.x;
	var y_dy = y - wpos.y;
	var x_dx = tpos.x - x;
	var x_dy = tpos.y - y;
	if (! this.is_right) {
	    x_dx = -x_dx;
	    x_dy = -x_dy;
	}
	// draw thumb
	g.moveTo(x + x_dx, y + x_dy);
	g.lineTo(wpos.x, wpos.y);
	// calc finger positions
	var fs_x = x_dx >> 2; // finger-to-finger spacing
	var fs_y = x_dy >> 2;
	var f2_x = x + fs_x; // index
	var f2_y = y + fs_y;
	var f4_x = x - fs_x; // ring
	var f4_y = y - fs_y;
	var f5_x = x - (x_dx >> 1); // pinky
	var f5_y = y - (x_dy >> 1);
	var f2t_x = f2_x + y_dx;
	var f2t_y = f2_y + y_dy;
	var f3t_x = x + y_dx;
	var f3t_y = y + y_dy;
	var f4t_x = f4_x + y_dx;
	var f4t_y = f4_y + y_dy;
	var f5t_x = f5_x + y_dx;
	var f5t_y = f5_y + y_dy;
	// Draw fingers
	g.moveTo(f2_x, f2_y);
	g.lineTo(f2t_x, f2t_y);
	g.moveTo(x, y);
	g.lineTo(f3t_x, f3t_y);
	g.moveTo(f4_x, f4_y);
	g.lineTo(f4t_x, f4t_y);
	g.moveTo(f5_x, f5_y);
	g.lineTo(f5t_x, f5t_y);
	// Draw rest of hand
	g.beginFill(0xffcc66, 1);
	g.moveTo(f5_x, f5_y);
	g.lineTo(f2_x, f2_y);
	g.lineTo(f2_x - y_dx, f2_y - y_dy);
	g.lineTo(f5_x - y_dx, f5_y - y_dy);
	g.lineTo(f5_x, f5_y);
	g.endFill();
    }
    
    function remove_me() {
	this.viewer.stage.removeChild(this.my_sprite);
    }
    
    function get_dwell(beat) {
	var i = beat % this.dwell_ratios.length;
	//console.log('get_dwell: i=' + i);
	var dwell = this.dwell_ratios[i] * this.viewer.beat_period * this.period;
	//console.log('get_dwell: dwell=' + dwell);
	return dwell;
    }

    function next_beat() {
	if (this.movement_beat >= this.movement_period - 1) {
	    this.movement_beat = 0;
	}
	else {
	    this.movement_beat++;
	}
    }

    function catch_prop(p, update_prop_n) {
	var update_prop_n1 = update_prop_n || 0;
	console.log(this.name + ' caught ball');
	this.props.push(p);
	if (update_prop_n1 == 0) p.caught_by(this,1);
    }

    function throw_prop(dest_hand, dest_beat_rel) {
	var p;
	if (this.props.length > 0) {
	    p = this.props.shift();
	}
	else {
	    p = this.viewer.grab_new_prop();
	    p.pos.setv(this.pos);
	}
	console.log(this.name + ' throws a ' + dest_beat_rel + ' to ' + dest_hand.name);
	p.throw2hand(dest_hand, dest_beat_rel);
    }

    // return # of props held in this hand
    function nprops() {
	return this.props.length;
    }

    function drop_prop(n) {
	var p,i;
	for (i=0; i<n; i++) {
	    p = this.props.shift();
	    this.viewer.drop_prop(p);
	}
    }
}
