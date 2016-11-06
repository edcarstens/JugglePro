/**
 * @author Ed Carstens
 */

/**
 * JugThrow is a class for a juggler's throw parameters and methods.
 *
 * @class JugThrow
 * @extends Base
 * @constructor
 * @param destRow {Number} MHN+ throw destination row
 * @param fltBeats {Number} MHN+ throw-height (flight time in beats)
 * @param destBeats {Number} MHN+ async-extended destination beats in
 *                           fltBeats (may be negative)
 * @param preDwellRatio {Number} dwell before destination beat after catch
 * @param postDwellRatio {Number} dwell after current beat prior to throw
 * @param name {String} name of this JugThrow
 *
 */

(function () {

    'use strict';
    JPRO.ID.JugThrow = 0;
    JPRO.JugThrow = function(destRow, fltBeats, destBeats,
			     preDwellRatio, postDwellRatio,
			     bounces, forceThrow, earlyCatch,
			     name) {
	// Call superclass
	this.className = this.className || 'JugThrow';
	JPRO.Base.call(this, name);

	/**
	 * Destination MHN+ row; commonly corresponds to
	 * a hand that is to catch the prop, but actually
	 * the row is mapped to a control point that
	 * makes the catch.
	 *
	 * @property destRow
	 * @type Number
	 */
	this.destRow = destRow || 0;

	/**
	 * Flight time in beats (MHN+ throw-height)
	 *
	 * @property fltBeats
	 * @type Number
	 */
	this.fltBeats = fltBeats || 0;
	
	/**
	 * Flight time destination beats (MHN+ destination throw-height)
	 * This is the number of beats in fltBeats that are so-called
	 * destination beats. If the destination MHN row has a different
	 * clock than the throwing MHN row, then it may be necessary to
	 * use destination beats to accurately describe the arrival time.
	 * This number may be negative.
	 *
	 * @property destBeats
	 * @type Number
	 */
	this.destBeats = destBeats || 0;
	
	/**
	 * Ratio of dwell time before destination beat
	 * after catch to (the beat time just prior
	 * to destination beat).
	 * If catches are to be synchronized with the
	 * beats in a rhythm, set this to zero.
	 *
	 * @property preDwellRatio
	 * @type Number
	 */
	this.preDwellRatio = preDwellRatio ? preDwellRatio : 0;

	/**
	 * Ratio of dwell time after current beat before this
	 * throw to (the time interval from current beat to
	 * the next beat).
	 * If throws are to be synchronized with the beats in
	 * a rhythm, set this to zero.
	 * 
	 * @property postDwellRatio
	 * @type Number
	 */
	this.postDwellRatio = postDwellRatio ? postDwellRatio : 0;

	/**
	 * Number of bounces off the floor for a ball from throw to catch
	 *
	 * @property bounces
	 * @type Number
	 */
	this.bounces = bounces || 0;

	/**
	 * Flag indicating that a bounce throw is directed downward (v<0)
	 *
	 * @property forceThrow
	 * @type Boolean
	 */
	this.forceThrow = forceThrow || null;

	/**
	 * Flag that a bouncing ball is to be caught early (v>0)
	 *
	 * @property earlyCatch
	 * @type Boolean
	 */
	this.earlyCatch = earlyCatch || null;

	/**
	 * Yellow throw-height warning threshold
	 *
	 * @property highThrowHeight
	 * @type Number
	 */
	this.highThrowHeight = 9;
	
	/**
	 * Red throw-height warning threshold
	 *
	 * @property maxThrowHeight
	 * @type Number
	 */
	this.maxThrowHeight = 19; // red warning threshold

	// Precalculated variables
	this.pos = new JPRO.Vec();    // origin of throw
	this.destControlPoint = null; // destination control point
	this.dest = new JPRO.Vec();   // destination point (catch)
	this.vel = new JPRO.Vec();    // initial velocity
	this.timer = 0;               // time left until catch

	// For W3-CSS HTML
	this.w3Color = 'w3-light-blue';
	this.w3IsSelected = 0;
    };

    JPRO.JugThrow.prototype = Object.create(JPRO.Base.prototype);
    JPRO.JugThrow.prototype.constructor = JPRO.JugThrow;

    JPRO.JugThrow.prototype.toString = function() {
	var destBeats = '';
	var syncOffset = '';
	if (this.destRow < 0) {
	    return '-';
	}
	if ((this.destBeats !== 0) || this.syncOffset) {
	    destBeats = '.' + this.destBeats;
	}
	if (this.syncOffset) {
	    syncOffset = '.' + this.syncOffset;
	}
	return String.fromCharCode(65 + this.destRow) + this.fltBeats + destBeats + syncOffset;
    };

    JPRO.JugThrow.prototype.w3ToggleSelect = function() {
	if (this.destRow < 0) {
	    return 0;
	}
	if (this.w3IsSelected) {
	    this.w3IsSelected = null;
	    return -1;
	}
	else {
	    this.w3IsSelected = 1;
	    return 1;
	}
    }
    
    JPRO.JugThrow.prototype.w3GetColor = function(row) {
	var t = this.fltBeats;
	var dr = this.destRow;
	if (this.w3IsSelected) {
	    return 'w3-deep-purple';
	}
	if (dr < 0) {
	    return this.w3Color;
	}
	if ((t > this.maxThrowHeight) || (t < 0) || (t === 0) && (dr !== row)) {
	    return 'w3-red';
	}
	if (t > this.highThrowHeight) {
	    return 'w3-yellow';
	}
	return this.w3Color;
    };

})();
