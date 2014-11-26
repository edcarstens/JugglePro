/**
 * @author Ed Carstens
 */

/**
 * A Prop is an object being juggled which has a position, velocity,
 * and destination hand, unless it is being held (by a hand).
 * @class Prop
 * @constructor
 * @param viewer {Viewer} the viewer object
 * @param pos {Vec} optional initial position
 *
 */

"use strict";

JPRO.Prop = function(viewer, pos) {

    /**
     * Pointer to the Viewer object
     *
     * @property viewer
     * @type Viewer
     */
    this.viewer = viewer; // required

    /**
     * Pointer to the View object
     *
     * @property view
     * @type View
     */
    if (this.viewer) {
	this.view = this.viewer.view; // required
    }
    
    /**
     * Position
     *
     * @property pos
     * @type Vec
     * @default (0,0,0)
     */
    this.pos = pos || new Vec(); // xyz position

    /**
     * Velocity
     *
     * @property vel
     * @type Vec
     * @default (0,0,0)
     */
    this.vel = new Vec(); // velocity

    /**
     * Projected position (to 2D view screen)
     *
     * @property posProjected
     * @type Vec
     */
    this.posProjected = null;

    /**
     * Is this prop being held?
     *
     * @property inHand
     * @type Boolean
     * @default null
     */
    this.inHand = null;

    /**
     * Countdown timer used for flight time of prop after
     * being thrown. At zero, it has reached its destination.
     *
     * @property timer
     * @type Number
     * @default 0
     */
    this.timer = 0; // countdown timer

    /**
     * Destination hand pointer
     *
     * @property destHand
     * @type Hand
     * @default null
     */
    this.destHand = null;

    /**
     * Is this prop part of a juggling pattern?
     *
     * @property inPlay
     * @type Boolean
     * @default null
     */
    this.inPlay = null;
    
};

// constructor
JPRO.Prop.prototype.constructor = JPRO.Prop;

/**
 * Updates position of this prop (one small time step)
 *
 * @method updatePos
 * @param updateTimer {Boolean} whether or not to update the timer
 * @return {Prop} this
*/
JPRO.Prop.prototype.updatePos = function(updateTimer) {
    var updateTimer1 = updateTimer || 0; // default is to update timer
    if (this.inPlay == null) { return this; }
    if (this.inHand) {
	this.pos.setv(this.inHand.pos);
    }
    else {
	this.pos.acc(this.vel.acc(this.view.g)); // v=v+g; x=x+v
    }
    this.posProjected = this.view.project(pos); // x,y, and depth
    if ((updateTimer1 == 0) && (this.timer > 0)) {
	this.timer--;
	if (this.timer <= 0) {
	    this.caughtBy(this.destHand);
	}
    }
    return this;
};

/**
 * Throw this prop to xyz coordinate in specified time.
 * To accomplish this, the initial velocity is calculated
 * assuming constant acceleration of gravity and no
 * other forces.
 *
 * Given z''=-g, z[0]=pos, z[time]=dest, Find z'[0].
 * z' = -g*t + z'[0]; z = -g*t*t/2 + t*z'[0] + z[0]
 * z[time] = z[0] + v*time;  v = z'[0] - time*g/2
 * z'[0] = v + time*g/2 = (z[time]-z[0])/time + time*g/2
 * Other cool ideas..
 * trajectory with 1 bounce (force or lift)
 * multiple bounces?
 * bouncing off walls or ceiling, not just floor
 * modeling air drag
 * 
 * This function is not called too often, yet it needs
 * to do some hefty arithmetic. Could these calcs be
 * made in advance?
 *
 * @method throw2Pos
 * @param dest {Vec} the desination position vector
 * @param time {Number} the required flight time
 * @return {Prop} this
*/
JPRO.Prop.prototype.throw2Pos = function(dest, time) {
    var p = this.pos;
    var rx = (dest.x-p.x)/time - time*this.view.g.x/2;
    var ry = (dest.y-p.y)/time - time*this.view.g.y/2;
    var rz = (dest.z-p.z)/time - time*this.view.g.z/2;
    this.vel.set(rx,ry,rz);
    this.inHand = null; // release prop
    this.timer = time; // init countdown timer
    return this;
};

/**
 * Throw this prop to specified destination hand at time
 * specified. Time specified in beats is converted by
 * mulitplying be the beat period. Then dwell time is
 * subtracted to obtain the flight time.
 *
 * The position of the destination hand at the destination
 * time is calculated, then throw2Pos is called.
 *
 * @method throw2Hand
 * @param destHand {Hand} the destination hand
 * @param destBeatRel {Number} destination beat relative to current beat (aka throw-height)
 * @return {Prop} this
*/
JPRO.Prop.prototype.throw2Hand = function(destHand, destBeatRel) {
    // Calculate throw time
    var beat = this.viewer.beat;
    var destBeat = (destHand.movementBeat + destBeatRel) % destHand.movementPeriod;
    var dwell = destHand.getDwell(destBeat); // todo - change to get_dwell(dest_beat_rel)
    var time = destBeatRel * this.viewer.beatPeriod - dwell;
    //var time = this.viewer.pattern.get_time_between_beats(beat, beat + dest_beat_rel) - dwell;
    var minTime = this.viewer.minThrowTime;
    if (time < minTime) time = minTime;

    // Calculate dest hand position
    var timeAbs = (time + destHand.movementBeat*this.viewer.beatPeriod) %
	(destHand.movementPeriod * this.viewer.beatPeriod);

    this.destHand = destHand;
    console.log('JPRO.Prop.throw2Hand: throw prop to ' + destHand.name + ' in time ' + time);
    var pa = destHand.fpos(timeAbs, this.viewer.beatPeriod); // position array
    var pos = this.view.transform(pa[0]);
    console.log('JPRO.Prop.throw2Hand: pos = ' + pos.toString());
    return this.throw2Pos(pos, time);
};
    
/**
 * Called when prop is to be caught by a hand, this method
 * sets inHand to the Hand object catching the prop and the
 * position is set to the hand's position. The Hand's
 * catchProp method may be called to update Hand info too.
 *
 * @method caughtBy
 * @param hand {Hand} the hand doing the catching
 * @param updateHandN {Boolean} optional, whether or not
 *                              to call hand.catchProp
 * @return {Prop} this
*/
JPRO.Prop.prototype.caughtBy = function(hand, updateHandN) {
    var updateHandN1 = updateHandN || 0;
    this.inHand = hand;
    if (updateHandN1 == 0) hand.catchProp(this, 1);
    this.pos.setv(hand.pos); // the ball should land in this hand
    return this;
};

