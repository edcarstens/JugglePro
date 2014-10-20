"use strict";

function Prop(viewer, pos) {
    // object members
    this.viewer = viewer; // required
    if (this.viewer) {
	this.view = this.viewer.view; // required
    }
    this.pos = pos || new Vec(); // xyz position
    this.vel = new Vec(); // velocity
    this.pos_projected = null;
    this.in_hand = null;
    this.timer = 0; // countdown timer
    this.dest_hand = null;
    this.in_play = null;
    
    // methods
    this.update_pos = update_pos;
    this.throw2pos = throw2pos;
    this.throw2hand = throw2hand;
    this.caught_by = caught_by;

    function update_pos(update_timer) {
	var update_timer1 = update_timer || 0; // default is to update timer
	if (this.in_play == null) { return this; }
	if (this.in_hand) {
	    this.pos.setv(this.in_hand.pos);
	}
	else {
	    this.pos.acc(this.vel.acc(this.view.g)); // v=v+(0,0,-1); x=x+v
	}
	this.pos_projected = this.view.project(pos); // x,y, and depth
	if ((update_timer1 == 0) && (this.timer > 0)) {
	    this.timer--;
	    if (this.timer <= 0) {
		this.caught_by(this.dest_hand);
	    }
	}
	return this;
    }

    // Sets initial velocity of prop in such a way as
    // to arrive at a future time and destination.
    // Given z''=-g, z[0]=pos, z[time]=dest, Find z'[0].
    // z' = -g*t + z'[0]; z = -g*t*t/2 + t*z'[0] + z[0]
    // z[time] = z[0] + v*time;  v = z'[0] - time*g/2
    // z'[0] = v + time*g/2 = (z[time]-z[0])/time + time*g/2
    // Other cool ideas..
    // trajectory with 1 bounce (force or lift)
    // multiple bounces?
    // bouncing off walls or ceiling, not just floor
    // modeling air drag
    //
    // This function is not called too often, yet it needs
    // to do some hefty arithmetic. Could these calcs be
    // made in advance?
    function throw2pos(dest, time) {
	var p = this.pos;
	var rx = (dest.x-p.x)/time - time*this.view.g.x/2;
	var ry = (dest.y-p.y)/time - time*this.view.g.y/2;
	var rz = (dest.z-p.z)/time - time*this.view.g.z/2;
	this.vel.set(rx,ry,rz);
	this.in_hand = null; // release prop
	this.timer = time; // init countdown timer
	return this;
    }

    function throw2hand(dest_hand, dest_beat_rel) {
	// Calculate throw time
	var beat = this.viewer.beat;
	var dest_beat = (dest_hand.movement_beat + dest_beat_rel) % dest_hand.movement_period;
	var dwell = dest_hand.get_dwell(dest_beat); // todo - change to get_dwell(dest_beat_rel)
	var time = dest_beat_rel * this.viewer.beat_period - dwell;
	//var time = this.viewer.pattern.get_time_between_beats(beat, beat + dest_beat_rel) - dwell;
	var min_time = this.viewer.min_throw_time;
	if (time < min_time) time = min_time;

	// Calculate dest hand position
	var time_abs = (time + dest_hand.movement_beat*this.viewer.beat_period) %
	    (dest_hand.movement_period * this.viewer.beat_period);

	this.dest_hand = dest_hand;
	console.log('Prop.throw2hand: throw prop to ' + dest_hand.name + ' in time ' + time);
	var pa = dest_hand.fpos(time_abs, this.viewer.beat_period); // position array
	var pos = this.view.transform(pa[0]);
	console.log('Prop.throw2hand: pos = ' + pos.to_string());
	return this.throw2pos(pos, time);
    }
    
    function caught_by(hand, update_hand_n) {
	var update_hand_n1 = update_hand_n || 0;
	this.in_hand = hand;
	if (update_hand_n1 == 0) hand.catch_prop(this, 1);
	this.pos.setv(hand.pos); // the ball should land in this hand
	return this;
    }
}
