/**
 * @author Ed Carstens
 */

/**
 * A ControlPoint represents a juggler's control
 * point, commonly a hand, but it could be any part
 * of the body or even another object under the
 * juggler's control. A control point placed on the
 * floor or a wall could effect a bounce, but this
 * is really a misuse of control points. A bounce
 * should be modeled based on physics since the
 * juggler has no control over it during the bounce.
 *
 * mappedRow = mapRow(mhnRow, t)
 * cprl = getControlPointRL(mappedRow)
 * cp = cprl.getItem(t)
 * x = mapPos(cp.getPos(t - preDwell), t)
 * 
 * @class ControlPoint
 * @constructor
 * @param parent {Performance} the parent performance object
 * @param name {String} this control point's name
 *
 */

(function () {

    'use strict';

    JPRO.ID.ControlPoint = 0;
    JPRO.ControlPoint = function(viewer, juggler, armIdx, location,
				 getPos, name) {

	// Call superclass
	this.className = this.className || 'ControlPoint';
	JPRO.Base.call(this, name);

	/**
	 * Pointer to the Viewer object
	 *
	 * @property viewer
	 * @type Viewer
	 */
	this.viewer = viewer;

	/**
	 * Pointer to Juggler
	 *
	 * @property juggler
	 * @type Juggler
	 */
	this.juggler = juggler;
	
	/**
	 * Juggler's arm index
	 *  0 = left arm
	 *  1 = right arm
	 *
	 * @property armIdx
	 * @type Number
	 */
	this.armIdx = armIdx || 0;
	
	/**
	 * Location of control point on arm
	 *  0 = hand
	 *  1 = thumb
	 *  2 = wrist
	 *  3 = elbow
	 *
	 * @property location
	 * @type Number
	 */
	this.location = location || 0;

	/**
	 * Function returning position at specified time
	 *
	 * @property getPos
	 * @type Function (beat, timeWithinBeat)
	 */
	this.getPos = getPos || function(beat, timeWithinBeat) {
	    var jpa = this.juggler.arms[this.armIdx].jointPos(beat, timeWithinBeat);
	    return jpa[this.location]; // hand position
	};
	
	/**
	 *
	 */
	this.props = [];
    };
    
    JPRO.ControlPoint.prototype = Object.create(JPRO.Base.prototype);
    JPRO.ControlPoint.prototype.constructor = JPRO.ControlPoint;

    /**
     * Copy
     *
     * @method copy
     * @return {ControlPoint} copied ControlPoint
     */
    JPRO.ControlPoint.prototype.copy = function(objHash, cFunc) {
    };

    /**
     * Update position
     *
     * @method updatePos
     */
    //JPRO.ControlPoint.prototype.updatePos = function() {
//	this.pos = this.getPos(0, this.movementBeat);
//	//this.posProjected = this.view.project(this.pos);
//    };

    /**
     * Catch prop
     * 
     * @method catchProp
     * @param p {Prop} prop being caught
     * @param updatePropN {Boolean} 0=call prop's caughtBy method
     */
    JPRO.ControlPoint.prototype.catchProp = function(p, updatePropN) {
	var updatePropN1 = updatePropN || 0;
	this.props.push(p);
	if (updatePropN1 === 0) p.caughtBy(this,1);
    };

    /**
     * Throw prop
     *
     * @method throwProp
     * @param jugThrow {JugThrow} juggling throw object
     * @return {Prop} the prop being thrown
     */
    JPRO.ControlPoint.prototype.throwProp = function(jugThrow) {
	var p;
	if (this.props.length > 0) {
	    p = this.props.shift();
	}
	else {
	    p = this.viewer.grabNewProp();
	    p.pos.setV(this.pos);
	}
	p.throw2Hand(jugThrow);
	return p; // ??
    };

    /**
     * Returns the number of props held in this hand
     *
     * @method nprops
     * @return {Number} the number of props held in this hand
     */
    JPRO.ControlPoint.prototype.nprops = function() {
	return this.props.length;
    };

    /**
     * Drop specified number of props
     *
     * @method dropProp
     * @param n {Number} the number of props to drop
     */
    JPRO.ControlPoint.prototype.dropProp = function(n) {
	var p,i;
	for (i=0; i<n; i++) {
	    p = this.props.shift();
	    this.viewer.dropProp(p);
	}
    };
    
})();
