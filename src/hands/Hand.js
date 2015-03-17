/**
 * @author Ed Carstens
 */

/**
 * A Hand represents a juggler's hand
 *
 * @class Hand
 * @constructor
 * @param viewer {Viewer} the viewer object
 * @param hFunc {Handfun.Func} externally defined hand movement object
 * @param name {String} this hand's name
 * @param isRight {Number} 1=right, 0=left
 * @param dwellRatio {Number} dwell ratio for this hand
 *
 */

(function () {

    'use strict';

    JPRO.ID.Hand = 0;
    JPRO.Hand = function(viewer, name, hFunc, isRight, dwellRatio) {

    // Call superclass
    this.className = this.className || 'Hand';
    JPRO.Base.call(this, name);

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
    this.view = viewer.view;
    
    /**
     * Dwell ratio for this hand
     *
     * @property dwellRatio
     * @type Number
     */
    this.dwellRatio = dwellRatio || this.viewer.dwellRatio; // use global default as default
    
    /**
     * Is this hand a right hand (1) or a left hand (0)?
     *
     * @property isRight
     * @type Boolean
     */
    this.isRight = isRight;
    
    /**
     * The beat keeps track of throws (i.e. throw beats).
     *
     * @property beat
     * @type Number
     */
    this.beat = 0;
    
    /**
     * Beat used by hFunc getPos method
     *
     * @property movementBeat
     * @type Number
     */
    this.movementBeat = 0;
    
    /**
     * List of props held in this hand
     *
     * @property props
     * @type Array
     */
    this.props = [];
        
    /**
     * An externally defined object, its getPos method 
     * calculates and returns the positions of the arm
     * joints and hand at the specified time.
     *
     * @property hFunc
     * @type Handfun.Func
     */
    this.hFunc = hFunc; // its getPos method returns list of Vec objects
    this.movementPeriod = hFunc.movementPeriod;
    
    // init sprite
//    if (imgfile) {
//	this.mySprite = new Sprite3D.fromImage('../jp3d.js/assets/' + imgfile);
//	this.mySprite.anchor.x = 0.5;
//	this.mySprite.anchor.y = 0.5;
//    }
//    else {
//	this.mySprite = null;
//    }

    // call update to init position
    //this.update();
    
    /**
     * 3D Position of this hand
     *
     * @property pos
     * @type Vec
     */
    this.pos = new JPRO.Vec();
    
    /**
     * Position projected on 2D view screen
     * The Z coordinate is used for the depth or zoom.
     *
     * @property pos
     * @type Vec
     */
    this.posProjected = new JPRO.Vec();
};

JPRO.Hand.prototype = Object.create(JPRO.Base.prototype);
JPRO.Hand.prototype.constructor = JPRO.Hand;

/**
 * Copy
 *
 * @method copy
 * @return {Hand} copied Hand
 */
JPRO.Hand.prototype.copy = function(objHash, cFunc) {
    cFunc = cFunc || function() {
	return new JPRO.Hand({}, // viewer
			     1, // name
			     {}, // hFunc
			     1, // isRight
			     1 // dwellRatio
			    );
    };
    var skip = {};
    skip.props = 1;
    return this.copyOnce(objHash, cFunc, skip);
    
/*
    if (objHash === undefined) { objHash = {}; }
    if (objHash[this.name] !== undefined) { return objHash[this.name]; }
    var rv = new JPRO.Hand(this.viewer.copy(objHash), this.name + '_copy',
			   this.hFunc.copy(objHash), this.isRight,
			   this.dwellRatio);
    objHash[this.name] = rv;
    objHash[rv.name] = this;
    rv.viewer = this.viewer.copy(objHash);
    rv.view = this.view.copy(objHash);
    rv.beat = this.beat;
    rv.movementBeat = this.movementBeat;
    rv.movementPeriod = this.movementPeriod;
//    rv.props = JPRO.Common.copyObjVector(this.props, objHash);
    rv.pos = this.pos.copy(objHash);
    rv.posProjected = this.posProjected.copy(objHash);
    return rv; */
};

/**
 * Update hand position from hFunc for look-ahead
 * operation.
 *
 * @method lookAheadUpdate
*/
//JPRO.Hand.prototype.lookAheadUpdate = function() {
    
//};

/**
 * Update hand position
 *
 * @method updatePos
*/
JPRO.Hand.prototype.updatePos = function() {
    var pa = this.hFunc.getPos(0, this.movementBeat);
    this.pos = this.view.transform(pa[0]); // pa[0] is hand position
    //this.posProjected = this.view.project(this.pos);
};

/**
 * Draw this hand on the view screen and may also
 * draw the arm to which the hand is attached.
 *
 * @method update
*/
JPRO.Hand.prototype.update = function(timeBetweenThrowsHash) {
    // New method
    // use lookAhead
    var duration = this.viewer.clock.duration(this.name);
    var time;
    var timeBetweenThrows = timeBetweenThrowsHash[this.name];
    if (timeBetweenThrows < 0.01) {
	time = 0.5;
    }
    else {
	time = duration/timeBetweenThrows;
    }

//    if (this.name === 'Juggler_0_RH') {
//	console.log('time=' + this.viewer.clock.totalTime() + ' hand=' + this.name + ' timeBetweenThrows=' + timeBetweenThrows + ' duration=' + duration);
//    }
    /*
    // current time within current beat
    var t = this.viewer.clock.t;
    // duration since last throw by this hand
    var duration = this.viewer.clock.duration(this.name);
    //console.log('duration=' + duration);
    // find time until next throw by this hand (rhMap)
    var b2t = this.viewer.getBeatsToNextThrow(this);
    //console.log(this.name + ' b2t=' + b2t);
    //var xx = this.viewer.clock.timeBetweenBeats(0, b2t);
    //console.log('xx=' + xx);
    var time2t = this.viewer.clock.timeBetweenBeats(0, b2t) - t;
    //console.log('time2t=' + time2t);
    var tbt = duration + time2t;
    var time;
    if (tbt < 0.01) {
	time = 0.5;
    }
    else {
	time = duration/tbt;
    }
    //console.log('time=' + time);
    //var pa = this.fpos(time, this.viewer.clock.beatPeriod);
    */

    var pa = this.hFunc.getPos(time, this.movementBeat);
    var tpos = this.view.project(this.view.transform(pa[1]));
    var wpos = this.view.project(this.view.transform(pa[2]));
    var epos = this.view.project(this.view.transform(pa[3]));
    var spos = this.view.project(this.view.transform(pa[4]));
    this.pos = this.view.transform(pa[0]); // pa[0] is hand position
    this.posProjected = this.view.project(this.pos);
    var x = this.posProjected.x;
    var y = this.posProjected.y;
    //console.log('Hand.update() - hand pos = ' + this.pos.toString());
    // draw line from hand to wrist to elbow to shoulder
    var g = this.viewer.grfx;
    g.lineStyle(1, 0xffcc66, 1);
    g.beginFill(0xffcc66);
    g.drawCircle(wpos.x, wpos.y, 8);
    g.drawCircle(epos.x, epos.y, 8);
    g.endFill();
    
    g.lineStyle(16, 0xffcc66, 1);
    g.moveTo(x, y);
    g.lineTo(wpos.x, wpos.y);
    g.moveTo(wpos.x, wpos.y);
    g.lineTo(epos.x, epos.y);
    g.moveTo(epos.x, epos.y);
    g.lineTo(spos.x, spos.y);
    //g.moveTo(spos.x, spos.y);

    // Draw hand
    g.lineStyle(4, 0xffcc66, 1);
    var yDx = x - wpos.x;
    var yDy = y - wpos.y;
    var xDx = tpos.x - x;
    var xDy = tpos.y - y;
    if (! this.isRight) {
	xDx = -xDx;
	xDy = -xDy;
    }
    // draw thumb
    g.moveTo(x + xDx, y + xDy);
    g.lineTo(wpos.x, wpos.y);
    // calc finger positions
    var fsX = xDx >> 2; // finger-to-finger spacing
    var fsY = xDy >> 2;
    var f2X = x + fsX; // index
    var f2Y = y + fsY;
    var f4X = x - fsX; // ring
    var f4Y = y - fsY;
    var f5X = x - (xDx >> 1); // pinky
    var f5Y = y - (xDy >> 1);
    var f2tX = f2X + yDx;
    var f2tY = f2Y + yDy;
    var f3tX = x + yDx;
    var f3tY = y + yDy;
    var f4tX = f4X + yDx;
    var f4tY = f4Y + yDy;
    var f5tX = f5X + yDx;
    var f5tY = f5Y + yDy;
    // Draw fingers
    g.moveTo(f2X, f2Y);
    g.lineTo(f2tX, f2tY);
    g.moveTo(x, y);
    g.lineTo(f3tX, f3tY);
    g.moveTo(f4X, f4Y);
    g.lineTo(f4tX, f4tY);
    g.moveTo(f5X, f5Y);
    g.lineTo(f5tX, f5tY);
    // Draw rest of hand
    //g.beginFill(0xffcc66, 1);
    g.moveTo(f5X, f5Y);
    g.lineTo(f2X, f2Y);
    g.moveTo(f2X, f2Y);
    g.lineTo(f2X - yDx, f2Y - yDy);
    g.moveTo(f2X - yDx, f2Y - yDy);
    g.lineTo(f5X - yDx, f5Y - yDy);
    g.moveTo(f5X - yDx, f5Y - yDy);
    g.lineTo(f5X, f5Y);
    //g.endFill();
};
  
//    function removeMe() {
//	this.viewer.stage.removeChild(this.mySprite);
//    }
    
/**
 * Returns dwell time for this hand and specified
 * throw beat. Dwell time is the amount of time a
 * prop is held in this hand before being thrown.
 *
 * @method getDwell
 * @param beat {Number} throw beat
 * @return {Number} dwell time
*/
//JPRO.Hand.prototype.getDwell = function(beat) {
//    var i = beat % this.dwellRatios.length;
    //console.log('getDwell: i=' + i);
    // TODO - use clock method timeBetweenBeats?
//    var dwell = this.dwellRatios[i] * this.viewer.clock.beatPeriod * this.period;
    //console.log('getDwell: dwell=' + dwell);
//    return dwell;
//};

/**
 * Returns dwell ratio for this hand
 *
 * @method getDwellRatio
 * @return {Number} dwell ratio
*/
JPRO.Hand.prototype.getDwellRatio = function() {
    return this.dwellRatio;
};

/**
 * Increment this hand's movement beat
 * Update hand position
 * @method nextBeat
*/
JPRO.Hand.prototype.nextBeat = function() {
    var pa;
    if (this.movementBeat >= this.movementPeriod - 1) {
	this.movementBeat = 0;
    }
    else {
	this.movementBeat++;
    }
    pa = this.hFunc.getPos(0, this.movementBeat);
    this.pos = this.view.transform(pa[0]);
};

/**
 * Catch prop
 *
 * @method catchProp
 * @param p {Prop} prop being caught
 * @param updatePropN {Boolean} 0=call prop's caughtBy method
*/
JPRO.Hand.prototype.catchProp = function(p, updatePropN) {
    var updatePropN1 = updatePropN || 0;
    console.log(this.name + ' caught ball');
    this.props.push(p);
    if (updatePropN1 === 0) p.caughtBy(this,1);
};

/**
 * Throw prop to specified destination hand and
 * arrival time.
 *
 * @method throwProp
 * @param origDestHand {Hand} original destination hand
 * @param destHand {Hand} copy of original destination hand
 * @param destBeatRel {Number} arrival time specified in beats
 *        relative to current beat
 * @return {Prop} the prop being thrown
*/
//JPRO.Hand.prototype.throwProp = function(origDestHand, destHand, destBeatRel, dwell) {
JPRO.Hand.prototype.throwProp = function(td) {
    var p;
    if (this.props.length > 0) {
	p = this.props.shift();
    }
    else {
	p = this.viewer.grabNewProp();
	p.pos.setV(this.pos);
    }
    //console.log(this.name + ' throws a ' + destBeatRel + ' to ' + origDestHand.name);
    //console.log('dwell = ' + dwell);
    //p.throw2Hand(origDestHand, destHand, destBeatRel, dwell);
    p.throw2Hand(td);
};

/**
 * Returns the number of props held in this hand
 *
 * @method nprops
 * @return {Number} the number of props held in this hand
*/
JPRO.Hand.prototype.nprops = function() {
    return this.props.length;
};

/**
 * Drop specified number of props
 *
 * @method dropProp
 * @param n {Number} the number of props to drop
*/
JPRO.Hand.prototype.dropProp = function(n) {
    var p,i;
    for (i=0; i<n; i++) {
	p = this.props.shift();
	this.viewer.dropProp(p);
    }
};

})();
