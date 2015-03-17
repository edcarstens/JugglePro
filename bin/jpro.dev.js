/**
 * @license
 * JugglePro - v0.0.2
 * Copyright (c) 2014, Ed Carstens
 * http://www.wealthygames.com/
 *
 * Compiled: 2015-03-15
 *
 * JugglePro is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */
/**
 * @author Ed Carstens
 */

/**
 * @module JPRO
 */
var JPRO = JPRO || {}; // jshint ignore:line

/* 
* 
* This file contains a lot of jpro consts
*
*/

// version
JPRO.VERSION = "v0.0.2";

// Matrix axes enumeration
JPRO.XAXIS = 0;
JPRO.YAXIS = 1;
JPRO.ZAXIS = 2;

// Juggler
JPRO.SHOULDERWIDTH = 80;
JPRO.UPPERARMLENGTH = 100;
JPRO.FOREARMLENGTH = 120;
JPRO.HANDLENGTH = 25;

// Object ID
// This is used to generate unique names for objects
JPRO.ID = {};

/**
 * @author Ed Carstens
 */

/**
 * Base Class for most JPRO Classes
 *
 * @class Base
 * @constructor
 * @param
 *
 *
 */

(function () {

    'use strict';
    JPRO.Base = function(name) {

	/**
	 * className (should be defined prior to Base construction)
	 *
	 * @property className
	 * @type String
	 */
	this.className = this.className || 'Base';

	/**
	 * Name (optional)
	 *
	 * @property name
	 * @type String
	 */
	this.name = name || this.className + '_' + JPRO.ID[this.className]++;
    };

    // constructor
    JPRO.Base.prototype.constructor = JPRO.Base;

    /**
     * Copies a JPRO object with a deep copy, meaning
     * all properties/functions of the object are copied
     * with a deep copy.
     *
     * @method copyOnce
     * @param objHash {Object}  Optional hash (object) keeps track of
     *                          every object copied by name
     * @param cFunc {Function}  Optional constructor function returning
     *                          target object
     * @param skip {Object}     Optional hash of obj properties to skip
     * @param pFuncs {Object}   Optional hash of functions to call to copy
     *                          each property; each function takes two params,
     *                          function(p,objHash), and returns copy of p.
     * @param callBacks {Array} Array of callBack functions to be copied.
     * @return {Object} the copied JPRO object
     */
    JPRO.Base.prototype.copyOnce = function(objHash, cFunc, skip, pFuncs, callBacks) {
	objHash = objHash || {};
	if (objHash[this.name] !== undefined) { return objHash[this.name]; }
	cFunc = cFunc || function() { return new JPRO[this.className](); };
	var obj,p,x;
	skip = skip || {};
	skip.name = 1; // always skip the name property
	skip.className = 1; // always skip className property
	skip.constructor = 1; // always skip constructor
	pFuncs = pFuncs || {};
	callBacks = callBacks || [];
	x = JPRO.ID[this.className];
	obj = cFunc.call(this);
	JPRO.ID[this.className] = x;
	obj.name = this.name + '_copy';
	objHash[this.name] = obj;
	objHash[obj.name] = this;
	for (p in this) {
	    if (skip[p]) continue;
	    if (pFuncs[p]) {
		obj[p] = pFuncs[p](this[p], objHash);
		continue;
	    }
	    x = typeof this[p];
	    if (x === 'function') continue;

	    if (this[p] && (x === 'object')) {
		obj[p] = this[p].copy(objHash);
	    }
	    else {
		obj[p] = this[p];
	    }
	}
	for (x in callBacks) {
	    p = callBacks[x];
	    obj[p] = this[p];
	}
	return obj;
    };

    /**
     * Copies specified properties of a JPRO object with a deep copy,
     * meaning the copy recurses objects. This should be faster than
     * the general copyOnce method, but requires the user to
     * specify every property to be copied.
     *
     * @method directedCopy
     * @param objHash {Object}  Optional hash (object) keeps track of
     *                          every object copied by name
     * @param cFunc {Function}  Optional constructor function returning
     *                          target object
     * @param pFuncs {Object}   Optional hash of functions to call to copy
     *                          each property; each function takes two params,
     *                          function(p,objHash), and returns copy of p.
     * @param scalars {Array}   Array of simple scalar properties or
     *                          callbacks to be copied.
     * @param objects {Array}   Array of parameters that are JPRO objects
     * @return {Object} copied JPRO object
     */
    JPRO.Base.prototype.directedCopy = function(objHash, cFunc, pFuncs, scalars, objects) {
	objHash = objHash || {};
	if (objHash[this.name] !== undefined) { return objHash[this.name]; }
	cFunc = cFunc || function() { return new JPRO[this.className](); };
	var obj,p,x;
	pFuncs = pFuncs || {};
	scalars = scalars || [];
	objects = objects || [];
	x = JPRO.ID[this.className];
	obj = cFunc.call(this);
	JPRO.ID[this.className] = x;
	obj.name = this.name + '_copy';
	objHash[this.name] = obj;
	objHash[obj.name] = this;
	for (p in pFuncs) {
	    obj[p] = pFuncs[p](this[p], objHash);
	}
	for (x in scalars) {
	    p = scalars[x];
	    obj[p] = this[p];
	}
	for (x in objects) {
	    p = objects[x];
	    obj[p] = this[p].copy(objHash);
	}
	return obj;
    };

/**
 * Copy (default)
 * Modify this method in your derived class to set
 * your own cFunc constructor function. Otherwise, the
 * default cFunc will be JPRO[this.className](). If
 * there are property types such as arrays you will
 * also have to modify this method in order to make
 * deep copies of arrays properly. Hashes (objects)
 * are another special case. These exceptions must be
 * added to the skip hash in copyOnce. Functions are
 * not copied unless put into the callBacks array.
 *
 * @method copy
 * @return {Base} copied JPRO object
 */
JPRO.Base.prototype.copy = function(objHash, cFunc) {
    return this.copyOnce(objHash, cFunc);
};

})();

/**
 * @author Ed Carstens
 */

// Common Functions
/**
 * A library of common generic functions,
 *
 * @class Common
 * @static
 */
 
(function () {

    'use strict';
    
    JPRO.Common = {};

    /* jshint unused:false */
    // The objHash is here to conform to a standard
    // argument list for property copy functions
    JPRO.Common.copyHash = function(h, objHash) {
	var rv = {};
	var x;
	for (x in h) {
	    rv[x] = h[x];
	}
	return rv;
    };
    /* jshint unused:true */

    // This function does not conform to the
    // standard argument list (p, objHash) for
    // property copy functions.
    // Call makeCopyMatrix(d) to create a
    // conforming property copy function.
    JPRO.Common.copyMatrix = function(m, d) {
	if (d === 0) {
	    return m;
	}
	var i;
	var rv = [];
	for (i=0; i<m.length; i++) {
	    rv.push(JPRO.Common.copyMatrix(m[i], d-1));
	}
	return rv;
    };
    
    JPRO.Common.makeCopyMatrix = function(d) {
	/* jshint unused:false */
	return function(p, objHash) {
	    return JPRO.Common.copyMatrix(p, d);
	};
	/* jshint unused:true */
    };
    
    JPRO.Common.copyObjMatrix = function(m, objHash) {
	var i;
	var rv = [];
	for (i=0; i<m.length; i++) {
	    rv.push(JPRO.Common.copyObjVector(m[i], objHash));
	}
	return rv;
    };
    
    JPRO.Common.copyObjVector = function(v, objHash) {
	var i;
	var rv = [];
	for (i=0; i<v.length; i++) {
	    rv.push(v[i].copy(objHash));
	}
	return rv;
    };

})();


/**
 * @author Ed Carstens
 */

/**
 *
 *
 * @class Gui
 * @constructor
 * @param viewer {Viewer} the pattern viewer
 */
/* global $:true, viewer:true */
/* global requestAnimFrame:true, animate:true */
JPRO.Gui = function(viewer) {
    this.viewer = viewer;
};

JPRO.Gui.prototype.constructor = JPRO.Gui;

/**
 *
 *
 * @method 
*/
JPRO.Gui.prototype.init = function() {
    //$(document).ready(function(){
    var v,p;
    v = this.viewer; if (!v) return;
    p = v.pattern; if (!p) return;
    //console.log('Gui: Pattern=' + p.toString());
    $('#div1').html(p.toHtml());
    var bpslider = this.makeSlider('Base Period', 'BasePeriod', // viewer.clock.basePeriod, 5, 75, 1, 10, 70, 10);
				   {val:viewer.clock.basePeriod,
				    min:5,
				    max:75,
				    step:1,
				    start:10,
				    end:70,
				    tstep:10});
    var dwslider = this.makeSlider('Dwell Ratio', 'DwellRatio', // viewer.dwellRatio*100, 0, 100, 1, 0, 100, 10);
				   {val:viewer.dwellRatio*100,
				    min:0,
				    max:100,
				    step:1,
				    start:0,
				    end:100,
				    tstep:10});
    //var vslider = this.makeSlider('Test Variable', 'TestVar', viewer.testVar, 0, 100, 1, 0, 100, 10);
    $('#div2').html(bpslider);
    $('#div3').html(dwslider);
    this.updateDwellRatio(viewer.dwellRatio*100);
    this.updateBasePeriod(viewer.clock.basePeriod);
    this.initButtons();
};

/**
 *
 *
 * @method 
*/
JPRO.Gui.prototype.makeSlider = function(label, vname, p) { //val, min, max, step, start, end, tstep) {
    var i;
    var fader = vname + '_fader';
    var settings = vname + '_settings';
    var call = '\"viewer.gui.update' + vname + '(value)\"';
    var rv = '<label for=' + fader + '>' + label + '</label>';
    rv += '<input type=range min=' + p.min + ' max=' + p.max + ' value=' + p.val;
    rv += ' id=' + fader + ' step=' + p.step + ' list=' + settings + ' oninput=' + call + '>';
    rv += '<output for=' + fader + ' id=' + vname + '>' + p.val + '</output>';
    rv += '<datalist id=' + settings + '>';
    for (i=p.start; i<=p.end; i+=p.tstep) {
	rv += '<option>' + i + '</option>';
    }
    rv += '</datalist>';
    //console.log(rv);
    return rv;
};


/**
 *
 *
 * @method initButtons
*/
JPRO.Gui.prototype.initButtons = function() {
    $('#start_button').hide();
    $('#pause_button').click(function(){
	viewer.enable = null;
	$('#pause_button').hide();
	$('#start_button').show();
    });
    $('#start_button').click(function(){
	viewer.enable = 1;
	requestAnimFrame( animate );
	$('#start_button').hide();
	$('#pause_button').show();
    });
    
    $('#pause_rot').hide();
    $('#pause_rot').click(function(){
	viewer.rotEnable = null;
	$('#pause_rot').hide();
	$('#start_rot').show();
    });
    $('#start_rot').click(function(){
	viewer.rotEnable = 1;
	$('#start_rot').hide();
	$('#pause_rot').show();
    });
};


/**
 *
 *
 * @method updateBasePeriod
*/
JPRO.Gui.prototype.updateBasePeriod = function(val) {
    console.log('update base period = ' + val);
    viewer.clock.basePeriod = val;
    $('#BasePeriod').html(val);
};


/**
 *
 *
 * @method updateDwellRatio
*/
JPRO.Gui.prototype.updateDwellRatio = function(val) {
    var j,h;
    console.log('update dwell ratio = ' + val);
    viewer.dwellRatio = val/100;
    for (j in viewer.jugglers) {
	for (h in viewer.jugglers[j].hands) {
	    viewer.jugglers[j].hands[h].dwellRatio = viewer.dwellRatio;
	}
    }
    $('#DwellRatio').html(val + '%');
};

/**
 *
 *
 * @method updateTestVar
*/
JPRO.Gui.prototype.updateTestVar = function(val) {
    viewer.testVar = val;
    viewer.view.translateMe(viewer.zoomIn);
    viewer.zoomOut.y = 100*val;
    viewer.zoomIn.y  = -100*val;
    viewer.view.translateMe(viewer.zoomOut);
    $('#testVar').html(viewer.zoomOut.y);
};

/**
 * @author Ed Carstens
 */

/**
 *
 *
 * @class Juggler
 * @constructor
 * @param viewer {Viewer} the viewer object
 *
 */
JPRO.ID.Juggler = 0;
JPRO.Juggler = function(viewer, name, hands, neckPos, facingAngle, params) {
    
    // Call superclass
    this.className = this.className || 'Juggler';
    JPRO.Base.call(this, name);

    /**
     * Pointer to the Viewer object
     *
     * @property viewer
     * @type Viewer
     */
    this.viewer = viewer;
    
    /**
     * 3D Position of this juggler (specifically the neck)
     *
     * @property neckPos
     * @type Vec
     */
    this.neckPos = ((neckPos === undefined) || (neckPos === null)) ? new JPRO.Vec(0,200,100) : neckPos;

    /**
     * Facing Angle
     *
     * @property 
     * @type Number
     */
    this.facingAngle = ((facingAngle === undefined) || (facingAngle === null)) ? -90 : facingAngle;

    /**
     * Parameters: shoulderWidth, upperArmLength, foreArmLength, handLength
     * 
     * @property params
     * @type Object
     */
    if (params === undefined) { params = {}; }
    this.shoulderWidth = params.shoulderWidth || JPRO.SHOULDERWIDTH;
    this.upperArmLength = params.upperArmLength || JPRO.UPPERARMLENGTH;
    this.foreArmLength = params.foreArmLength || JPRO.FOREARMLENGTH;
    this.handLength = params.handLength || JPRO.HANDLENGTH;

    /**
     * Array of Hand objects
     *
     * @property hands
     * @type Array
     */
    if ((hands !== undefined) && (hands !== null)) {
	this.hands = hands;
    }
    else {
	var LeftHand = JPRO.Handfun.cascL(this);
	var RightHand = JPRO.Handfun.cascR(this);
	//var LeftHand = JPRO.Handfun.stationaryL(this);
	//var RightHand = JPRO.Handfun.stationaryR(this);
	var lh = new JPRO.Hand(this.viewer, this.name + '_LH', LeftHand, 0);
	var rh = new JPRO.Hand(this.viewer, this.name + '_RH', RightHand, 1);
	this.hands = [lh, rh];
    }    
};

JPRO.Juggler.prototype = Object.create(JPRO.Base.prototype);
JPRO.Juggler.prototype.constructor = JPRO.Juggler;

/**
 * Copy
 *
 * @method copy
 * @return {Juggler} copied Juggler
 */
JPRO.Juggler.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    pFuncs.hands = JPRO.Common.copyObjVector;
   
    cFunc = cFunc || function() {
	return new JPRO.Juggler(null, // viewer
				1, // name
				[], // hands
				1, // neckPos
				1, // facingAngle
				{}); // params
    };
    return this.copyOnce(objHash, cFunc, {}, pFuncs);
};

JPRO.Juggler.prototype.update = function(timeBetweenThrowsHash) {
    var i;
    for (i in this.hands) {
	this.hands[i].update(timeBetweenThrowsHash);
    }
};

JPRO.Juggler.prototype.updatePos = function() {
    var i;
    for (i in this.hands) {
	this.hands[i].updatePos();
    }
};

JPRO.Juggler.prototype.nextBeat = function() {
    var i;
    for (i in this.hands) {
	this.hands[i].nextBeat();
    }
};

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

/**
 * @author Ed Carstens
 */

// Hand Functions
/**
 * A library of hand movement functions,
 * methods return functions with (t, bp)
 * arguments, which return a list of Vec
 * objects representing positions of
 * hand, thumb, wrist, elbow, and
 * shoulder.
 *
 * @class Handfun
 * @static
 */

(function () {

'use strict';

JPRO.Handfun = function() {};

// Class similar to spine
// skeleton made of bones
// Handfun Globals
JPRO.Handfun.scale = 5;

JPRO.Handfun.Bone = function(length) {
    this.length = length;
};

JPRO.Handfun.Bone.prototype = {
    pitch: 0,
    yaw: 0,
    roll: 0
};

JPRO.Handfun.Bone.prototype.constructor = JPRO.Handfun.Bone;

JPRO.Handfun.Pose = function(pos, facingAngle, uaLength, faLength, handLength) {
    this.pos = pos;
    this.facingAngle = facingAngle;
    this.bones = [
	new JPRO.Handfun.Bone(uaLength),
	new JPRO.Handfun.Bone(faLength),
	new JPRO.Handfun.Bone(handLength)
    ];
    // Methods
    this.set = function(uaP, uaY, faP, faY, faR, handP) {
	this.bones[0].pitch = uaP;    // upper arm pitch
	this.bones[0].yaw = uaY;      // upper arm yaw
	this.bones[1].pitch = faP;    // forearm pitch
	this.bones[1].yaw = faY;      // forearm yaw
	this.bones[1].roll = faR;     // forearm roll
	this.bones[2].pitch = handP;  // hand pitch
    };
    this.jointPos = function() {
	var r00 = new JPRO.Rmatrix(this.bones[0].pitch, 0); // rotation about X axis
	var r02 = new JPRO.Rmatrix(this.bones[0].yaw, 2);   // rotation about Z axis
	r00.xMatrix(r02);
	r00.col4 = new JPRO.Vec(0, 0, 0);
	var r10 = new JPRO.Rmatrix(this.bones[1].pitch, 0);
	var r12 = new JPRO.Rmatrix(this.bones[1].yaw, 2);
	var r11 = new JPRO.Rmatrix(this.bones[1].roll, 1); // rotation about Y axis
	r10.xMatrix(r12).xMatrix(r11);
	r10.col4 = new JPRO.Vec(0, this.bones[0].length, 0);

	// calculate position of elbow
	var elbow = r00.xVec(r10.col4);
	
	var r20 = new JPRO.Rmatrix(this.bones[2].pitch, 0);
	r20.col4 = new JPRO.Vec(0, this.bones[1].length, 0);

	// Now multiply the 4x4 matrixes
	r00.xMatrix4(r10.xMatrix4(r20));
	// 4th Column vector is position of wrist in jugglers frame

	// calculate position of hand
	var hpos = r00.xVec4(new JPRO.Vec(0, this.bones[2].length, 0));
	// calculate position of 'thumb' to aid 3d orientation
	var tpos = r00.xVec4(new JPRO.Vec(this.bones[2].length, 0, 0));

	// we still need one more transformation to the view frame
	//var rfinal = new JPRO.Rmatrix(this.facingAngle, 2); // rotation about Z axis
	var rfinal = new JPRO.Rmatrix(this.facingAngle - 90, 2); // rotation about Z axis
	rfinal.col4 = new JPRO.Vec().setV(this.pos);

	// calculate position of hand, thumb, elbow and wrist in final frame
	var finalElbow = rfinal.xVec4(elbow);
	var finalWrist = rfinal.xVec4(r00.col4);
	var finalHand = rfinal.xVec4(hpos);
	var finalThumb = rfinal.xVec4(tpos);
	var rv = [finalHand, finalThumb, finalWrist, finalElbow];
	return rv;
    };
};
JPRO.Handfun.Pose.prototype.constructor = JPRO.Handfun.Pose;

// hand function object
JPRO.ID.Func = 0;    
JPRO.Handfun.Func = function(owner, isRight, posesMatrix, name) {
    var i,j,k;

    // Call superclass
    this.className = this.className || 'Func';
    JPRO.Base.call(this, name);

    this.owner = owner;
    if (owner) {
	//this.name = name || 'Func_' + JPRO.Handfun.ID.Func++;
	this.scale = JPRO.Handfun.scale;
	var neckPos = owner.neckPos;
	this.shoulderWidth = owner.shoulderWidth;
	this.upperArmLength = owner.upperArmLength;
	this.foreArmLength = owner.foreArmLength;
	this.handLength = owner.handLength;
	// calculate right or left shoulder position
	this.shoulderAngle = isRight ? -90 : 90;
	//this.throwBeat = isRight ? 0 : 1;
	this.facingAngle = owner.facingAngle;
	var srad = (this.facingAngle + this.shoulderAngle) * PIXI.DEG_TO_RAD;
	var x = neckPos.getX() + this.shoulderWidth * Math.cos(srad);
	var y = neckPos.getY() + this.shoulderWidth * Math.sin(srad);
	this.shoulderPos = new JPRO.Vec(x, y, neckPos.getZ());
	this.ps = new JPRO.Vec();
	this.ps.setV(this.shoulderPos);
	this.ps.scale(this.scale);
    }
    
    if ((posesMatrix !== undefined) && (posesMatrix !== null)) {
	this.movementPeriod = posesMatrix.length;
	this.nposes2 = [];
	this.nposes = [];
	var posesMatrixT;
	this.posesXva = [];
	var largePosesMatrix = [];
	var largePosesXva = [];
	// FIX - need to combine entire movement into one matrix,
	// then split it out after calcXva.
	for (i=0; i<this.movementPeriod; i++) {
	    this.nposes2.push(posesMatrix[i].length);
	    // number of poses (double the specified array length)
	    this.nposes.push(posesMatrix[i].length << 1);
	    // flatten into large matrix
	    largePosesMatrix = largePosesMatrix.concat(posesMatrix[i]);
	}
    
	// transpose pose matrix
	posesMatrixT = JPRO.Matrix.transpose(largePosesMatrix);
	// calculate xva matrix
	largePosesXva = this.calcXva(posesMatrixT);
	// unflatten large transposed posesXva matrix
	k = 0;
	for (j=0; j<this.movementPeriod; j++) {
	    this.posesXva.push([]);
	    for (i=0; i<largePosesXva.length; i++) {
		this.posesXva[j].push(largePosesXva[i].slice(k, k+this.nposes[j]));
	    }
	    k += this.nposes[j];
	}
	k = 99; // for debug breakpoint
    }
};

JPRO.Handfun.Func.prototype = Object.create(JPRO.Base.prototype);
JPRO.Handfun.Func.prototype.constructor = JPRO.Handfun.Func;

/**
 * Copy
 *
 * @method copy
 * @return {Handfun.Func} copied Func
 */
JPRO.Handfun.Func.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    //pFuncs.posesXva = function(p, objHash) {
//	return JPRO.Common.copyMatrix(p, 4);
//    };
    pFuncs.posesXva = JPRO.Common.makeCopyMatrix(4);
    cFunc = cFunc || function() {
	return new JPRO.Handfun.Func();
    };
    var skip = {};
    skip.nposes2 = 1;
    skip.nposes = 1;
    var rv = this.copyOnce(objHash, cFunc, skip, pFuncs);
    rv.nposes2 = this.nposes2.slice();
    rv.nposes = this.nposes.slice();
    return rv;
};

JPRO.Handfun.Func.prototype.getPose = function(tIn,movementBeat) { // 0<=tIn<1, movementBeat>=0 (integer)
    var mBeat = movementBeat % this.movementPeriod;
    //console.log('mBeat=' + mBeat);
    var np = this.nposes[mBeat];
    var t = tIn * np;
    if (t >=np ) { t -= np; }
    var t0 = Math.floor(t);
    //t0=0;
//    console.log('tIn='+tIn);
//    console.log('t0='+t0);
    var dt = t - t0;
    //var t1 = (t0 === 7) ? 0 : t0 + 1; // not needed
    var i,xva,x0,v0,a0,x;
    var poseAngles = [];
    //var temp;
    for (i=0; i<this.posesXva[mBeat].length; i++) {
	//temp = this.posesXva[mBeat][i];
	//console.log('temp length = ' + temp.length);
	xva = this.posesXva[mBeat][i][t0];
	x0 = xva[0];
	v0 = xva[1];
	a0 = xva[2];
	x = x0 + v0*dt/2 + a0*dt*dt/4;
	//console.log('x[' + i + '] = ' + x);
	poseAngles.push(x);
    }
    var p = new JPRO.Handfun.Pose(this.shoulderPos, this.facingAngle, this.upperArmLength, this.foreArmLength, this.handLength);
    p.set( poseAngles[0],
	   poseAngles[1],
	   poseAngles[2],
	   poseAngles[3],
	   poseAngles[4],
	   poseAngles[5]
	 );
    return p;
};

JPRO.Handfun.Func.prototype.getPos = function(t,movementBeat) {
    var pose = this.getPose(t, movementBeat);
    var jointPositions = pose.jointPos();
    var p = new JPRO.Vec().setV(jointPositions[0]);
    var pt = new JPRO.Vec().setV(jointPositions[1]);
    var pw = new JPRO.Vec().setV(jointPositions[2]);
    var pe = new JPRO.Vec().setV(jointPositions[3]);
    p.scale(this.scale);   // position of hand
    pt.scale(this.scale);  // position of thumb
    pw.scale(this.scale);  // position of wrist
    pe.scale(this.scale);  // position of elbow
    //console.log('Hand Position = ' + p.toString());
    return [p, pt, pw, pe, this.ps];
};

JPRO.Handfun.Func.prototype.calcXva = function(posesT) {
//    console.log('JPRO.Handfun.calcXva called');
    var rv = [];
    var i;
    for (i=0; i<posesT.length; i++) {
	rv.push(this.interpolator(posesT[i]));
    }
    return rv;
};

JPRO.Handfun.Func.prototype.interpolator = function(x) {
    // x is an array of angles in degrees
    // the movement repeats x[0]..x[last],x[0]...

    // returns difference of angles (b-a)
    var adelta = function(a,b) {
	var rv = b-a;
	// normalize to (-180 : +180]
	while (rv <= -180) { rv += 360; }
	while (rv > 180) { rv -= 360; }
	return rv;
    };

    var i,j,k,k2;
    var d = []; // deltas or average velocities
    var v = []; // velocities
    var a = []; // accelerations
    var xx = []; // positions (twice the length of x)
    var xva = []; // [positions, velocities, accelerations]
    var n = x.length;
    
    // compute deltas, store in array
    for (i=0; i<n; i++) {
	j = (i+1) % n;
	d[i] = adelta(x[i], x[j]);
    }

    // look for local maxima or minima
    // if d[0]>=0 and d[1]<=0, then x[1] is local max, v[1]=0
    // if d[0]<=0 and d[1]>=0, then x[1] is local min, v[1]=0
    for (i=0; i<n; i++) {
	j = (i - 1 + n) % n;
	k = i << 1;
	if ((d[j] >= 0) && (d[i] <= 0)) {
	    v[k] = 0;
	}
	else if ((d[j] <= 0) && (d[i] >= 0)) {
	    v[k] = 0;
	}
	else {
	    v[k] = (d[j] + d[i])/2; // simple average
	}
    }
    // Solve for in-between velocities
    for (i=0; i<n; i++) {
	k = i << 1;
	j = k + 1;
	if (i === n-1) {
	    k2 = 0;
	}
	else {
	    k2 = j + 1;
	}
	v[j] = d[i]*2 - (v[k] + v[k2])/2;
    }
    // Calculate accelerations
    for (i=0; i<v.length; i++) {
	j = (i === v.length-1) ? 0 : i+1;
	a[i] = v[j] - v[i];
    }
    // Calculate in between positions
    j = 0;
    for (i=0; i<n; i++) {
	xx.push(x[i]);
	xx.push(x[i] + v[j]/2 + a[j]/4);
	j += 2;
    }
    xva.push(xx);
    xva.push(v);
    xva.push(a);
    xva = JPRO.Matrix.transpose(xva); // transpose for easier use
    return xva; // return positions, velocities and accelerations arrays

    // x = 1/2 * a * t*t
    // a = 2x/t/t
    // x = [0, 10, 30, 10]
    // d = [10,20,-20,-10]
    // v = [0, v1, 15, v3 0, v5, -15, v7]
    // now solve for v1, v3, v5 and v7
    // v1 = d[0]*2 - (v[0] + v[2])/2 = 20-7.5=12.5
    // v3 = d[1]*2 - (v[2] + v[4])/2 = 40-7.5=32.5
    // v5 = d[2]*2 - (v[4] + v[6])/2 = -40+7.5=-32.5
    // v7 = d[3]*2 - (v[6] + v[0])/2 = -20+7.5=-12.5
    // v = [0, 12.5, 15, 32.5, 0, -32.5, -15, -12.5]
    // a = [12.5, 2.5, 17.5, -32.5, -32.5, 17.5, 2.5, 12.5]
    // x = [0, 6.25/2, 10, 22, 30,..

};

JPRO.Handfun.mirrorX = function(pm) {
    // affects yaw and roll angles ([1],[3],[4])
    var i,j;
    var rv = [];
    var rvj;
    for (i=0; i<pm.length; i++) {
	rvj = [];
	for (j=0; j<pm[i].length; j++) {
	    rvj.push([pm[i][j][0], -pm[i][j][1], pm[i][j][2],
		      -pm[i][j][3],-pm[i][j][4], pm[i][j][5]]);
	}
	rv.push(rvj);
    }
    return rv;
};

// Ordinary Cascade/Fountain
JPRO.Handfun.casc = [[
    //uap   uay   fap   fay  far   hp
    [-70,    10,   20+70,   10,   0,   0],
    [-70,    15,   25+70,   15,   0,   0],
    [-70,     0,    0+70,    0,   0,   0],
    [-70,    -5,  -12+70,   -5,   0,   0],
    [-70,    -10, -25+70,  -10,   0,   0],
    [-70,    -5,  -12+70,   -5,   0,   0],
    [-70,     0,    0+70,    0,   0,   0],
    [-70,     5,   12+70,    5,   0,   0]
]];

// cascR is a method of Handfun, not a constructor!
JPRO.Handfun.cascR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, JPRO.Handfun.casc, 'cascR');
};
// cascL is a method of Handfun, not a constructor!
JPRO.Handfun.cascL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, JPRO.Handfun.mirrorX(JPRO.Handfun.casc), 'cascL');
};

// Reverse Cascade
JPRO.Handfun.revCasc = [[
    //uap   uay   fap  fay  far   hp
    [-70,   -20,   80, -40,   0,   30],
    [-70,   -20,  100, -40,   0,   30],
    [-70,     0,   80, -20,   0,   30],
    [-70,    10,   60,   5,   0,   30],
    [-70,    20,   60,  10,   0,   30],
    [-70,    10,   60,   5,   0,   30],
    [-70,     0,   60,   0,   0,   30],
    [-70,   -10,   60, -20,   0,   30]
]];

JPRO.Handfun.revCascR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, JPRO.Handfun.revCasc, 'revCascR');
};

JPRO.Handfun.revCascL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, JPRO.Handfun.mirrorX(JPRO.Handfun.revCasc), 'revCascL');
};

// Right-handed Shower
JPRO.Handfun.rshowerRm = [[
    //uap   uay   fap  fay  far   hp
    [-70,     0,   40, -60,   0,   0],
    [-70,     0,   60, -60,   0,   0],
    [-70,     0,   35, -60,   0,   0],
    [-70,     0,   10, -60,  40,   0],
    [-70,     0,  -20, -60,  80,   0],
    [-70,     0,  -10, -60,  40,   0],
    [-70,     0,    0, -60,   0,   0],
    [-70,     0,    0, -60,   0,   0]
]];
JPRO.Handfun.rshowerR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, JPRO.Handfun.rshowerRm, 'rshowerR');
};
JPRO.Handfun.rshowerLm = [[
    //uap   uay   fap  fay  far   hp
    [-70,     0,   70, -25,   0,   0],
    [-70,     0,   70, -60,   0,   0],
    [-70,     0,   70, -20,   0,   0],
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  10,   0,   0]
]];
JPRO.Handfun.rshowerL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, JPRO.Handfun.rshowerLm, 'rshowerL');
};

// Left-handed Shower
JPRO.Handfun.lshowerR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, JPRO.Handfun.mirrorX(JPRO.Handfun.rshowerRm), 'lshowerR');
};
JPRO.Handfun.lshowerL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, JPRO.Handfun.mirrorX(JPRO.Handfun.rshowerLm), 'lshowerL');
};

// Synchronous Box hand movement
JPRO.Handfun.box = [[
    //uap   uay   fap  fay  far   hp
    [-70,   -10,   80, -20,   0,  20],
    [-70,    -5,   70, -15,   0,  10],
    [-70,     0,   60, -10,   0,   0],
    [-70,     0,   60,  -5,   0,   0],
    [-70,     0,   60,   0,   0,   0],
    [-70,     0,   60,   5,   0,   0],
    [-70,     0,   60,  10,   0,   0],
    [-70,     5,   70,  15,   0,  10]
],[
    //uap   uay   fap  fay  far   hp
    [-70,    10,   80,  20,   0,  20],
    [-70,     5,   70,  15,   0,  10],
    [-70,     0,   60,  10,   0,   0],
    [-70,     0,   60,   5,   0,   0],
    [-70,     0,   60,   0,   0,   0],
    [-70,     0,   60,  -5,   0,   0],
    [-70,     0,   60, -10,   0,   0],
    [-70,    -5,   70, -15,   0,  10]
]];

JPRO.Handfun.boxR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, JPRO.Handfun.box, 'boxR');
};
JPRO.Handfun.boxL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, JPRO.Handfun.box, 'boxL');
};

// TODO - Better method may be to select hand movement based on throw destination/time
//        Hand should move in direction of throw obviously.
// Box
// 441
// Pendulum
// Fast Machine
// Mills' Mess
// Rubenstein's Revenge?
// Pistons
// Chops
// Double Box
// False Shower

// Simplest hand movement functions
JPRO.Handfun.stationaryL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, [[[-90, 0, 90, 0, 50, 0]]], 'stationaryL');
};
JPRO.Handfun.stationaryR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, [[[-90, 0, 90, 0, 20, 0]]], 'stationaryR');
};
JPRO.Handfun.experimentL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, [[[-90, 0, 90, 0, 0, 0],
					     [-90, 0, 90, 0, 90, 0],
					     [-90, 0, 90, 0,180, 0],
					     [-90, 0, 90, 0,270, 0]]], 'xL');
};
JPRO.Handfun.experimentR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, [[[-90, 0, 90, 0,180, 0],
					     [-90, 0, 90, 0,270, 0],
					     [-90, 0, 90, 0,  0, 0],
					     [-90, 0, 90, 0, 90, 0]]], 'xR');
};

})();

/**
 * @author Ed Carstens
 */

/**
 * A throw's destination hand is a function of its destination row
 * and the throw beat. A mapping function maps the row to the actual
 * destination hand. RowHandMapper implements the row-to-hand mapping.
 * It is being called a matrix, but actually is an array of arrays
 * that do not even have to be the same size.
 *
 * @class RowHandMapper
 * @constructor
 * @param rowHands {Array} row-to-hand mapping matrix
 */
JPRO.ID.RowHandMapper = 0;
JPRO.RowHandMapper = function(name, rhm) {

    // Call superclass
    this.className = this.className || 'RowHandMapper';
    JPRO.Base.call(this, name);

    /**
     * row-to-hand mapping matrix
     *
     * @property rhm
     * @type Array
     */
    this.rhm = rhm;

    /**
     * Keeps track of beat for each row.
     * Each row can have different period.
     *
     * @property rowBeats
     * @type Array
     */
    if (this.rhm) {
	this.rowBeats = this.makeArray(this.rhm.length); // make array filled with zeros
    
    // Calculate throw period matrix
    //this.tpm = tpm;
    //this.entryTpm = (entryTpm === undefined) ? this.tpm : entryTpm;
    //this.entryDone = this.makeArray(this.rhm.length);
    
    /**
     * Hand-to-row hash lookup
     *
     * @property handToRowHash
     * @type Object
     */
	// Calculate handToRowHash (hand-to-row) hash lookup
	var i,j;
	this.handToRowHash = {};
	for (i=0; i<this.rhm.length; i++) {
	    for (j=0; j<this.rhm[i].length; j++) {
		this.handToRowHash[this.rhm[i][j].name] = i;
	    }
	}
    }
};

JPRO.RowHandMapper.prototype = Object.create(JPRO.Base.prototype);
JPRO.RowHandMapper.prototype.constructor = JPRO.RowHandMapper;

/**
 * Copy
 *
 * @method copy
 * @return {RowHandMapper} copied RowHandMapper
 */
JPRO.RowHandMapper.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    pFuncs.rhm = JPRO.Common.copyObjMatrix;
    pFuncs.handToRowHash = JPRO.Common.copyHash;
    cFunc = cFunc || function() {
	return new JPRO.RowHandMapper();
    };
    var skip = {};
    skip.rowBeats = 1;
    var rv = this.copyOnce(objHash, cFunc, skip, pFuncs);
    rv.rowBeats = this.rowBeats.slice();
    return rv;
};

/**
 * Return a string representation of this object. 
 *
 * @method toString
 * @return {String} representation of this object
 */
JPRO.RowHandMapper.prototype.toString = function () {
    var i,j;
    var rv = '{rhm:[';
    for (i=0; i<this.rhm.length; i++) {
	if (i > 0) {
	    rv = rv + ', ';
	}
	rv = rv + '[';
	for (j=0; j<this.rhm[i].length; j++) {
	    if (j > 0) {
		rv = rv + ', ';
	    }
	    rv = rv + this.rhm[i][j].name;
	}
	rv = rv + ']';
    }
    rv = rv + '], rowBeats:[';
    for (i=0; i<this.rowBeats.length; i++) {
	if (i > 0) {
	    rv = rv + ', ';
	}
	rv = rv + this.rowBeats[i];
    }
    rv = rv + ']}';
    return rv;
};

/**
 * Returns the destination hand specified by row and
 * number of beats relative to current beat.
 *
 * @method getHand
 * @param row {Number}
 * @param beatRel {Number}
 * @return {Hand} the destination hand
 */
JPRO.RowHandMapper.prototype.getHand = function(row, beatRel) {
    var beatRel1 = beatRel || 0;
    //console.log('row=' + row);
    var rHands = this.rhm[row];
    if (rHands === undefined) {
	console.log(this.name);
	console.log('rhm[0][0]=' + this.rhm[0][0].name);
	console.log('rhm[1]=' + this.rhm[1]);
	console.log('rhm[1][0]=' + this.rhm[1][0].name);
	alert('hello');
    }
    var i = (this.rowBeats[row] + beatRel1) % rHands.length;
    return rHands[i];
};

/*
JPRO.RowHandMapper.prototype.getDwell = function(pat, row, clock, beatRel) {
    var rHands = this.rhm[row];
    var i = this.rowBeats[row];
    //console.log('getDwell: row=' + row + ' i=' + i);
    //console.log('entryTpm=' + this.entryTpm);
    //console.log('tpm=' + this.tpm);
    //console.log('pat=' + pat.toString());
    //console.log('pat.iterCnt=' + pat.iterCnt);
    var beats = (this.entryDone[row] === 0) ? this.entryTpm[row][i] : this.tpm[row][i];
    //console.log('beats=' + beats);
    var dr = rHands[i].getDwellRatio();
    var beat1 = 0;
    if (beats < beatRel) {
	beat1 = beatRel - beats;
    }
    var pd = clock.timeBetweenBeats(beat1, beatRel);
    //console.log(rHands[i].name + ' dr='+dr+' pd='+pd);
    return dr*pd;
};*/

/**
 * Returns the dwell time of the destination hand specified
 * by row and number of beats relative to current beat.
 *
 * @method getDwell
 * @param row {Number}
 * @param beatRel {Number}
 * @param clock {Clock}
 * @return {Number} the dwell time in destination hand
 */
/*JPRO.RowHandMapper.prototype.getDwell = function(row, beatRel, clock) {
    var rHands = this.rhm[row];
    var i = (this.rowBeats[row] + beatRel) % rHands.length;
    var beats = this.getHandBeatsFromLastThrow(row, beatRel);
    var beat1 = 0;
    if (beats < beatRel) {
	beat1 = beatRel - beats;
    }
    var dr = rHands[i].getDwellRatio();
    var pd = clock.timeBetweenBeats(beat1, beatRel);
    console.log(rHands[i].name + ' dr='+dr+' pd='+pd);
    return rHands[i].getDwellRatio() * clock.timeBetweenBeats(beat1, beatRel);
};*/

/**
 * Returns the number of beats from last throw beat for
 * destination hand specified by row and number of
 * beats relative to current beat.
 *
 * @method getHandBeatsFromLastThrow
 * @param row {Number}     - row of RHM matrix
 * @param beatRel {Number} - beat relative to current
 * @param hand {Hand}      - specify the Hand object to search for
 * @return {Number} the number of beats for destination
 *                  hand from its last throw beat
 */
/*
JPRO.RowHandMapper.prototype.getHandBeatsFromLastThrow = function(row, beatRel, hand) {
    var beatRel1 = beatRel || 0;
    if (hand !== undefined) {
	row = this.handToRow(hand);
    }
    var rHands = this.rhm[row];
    var i = (this.rowBeats[row] + beatRel1) % rHands.length;
    var rv = 0;
    if (hand === undefined) {
	rv = 1;
	hand = rHands[i];
    }
    while (rv < 999) {
	if (hand === rHands[(i+rHands.length-rv) % rHands.length]) {
	    return rv;
	}
	rv++;
    }
    return 0; // something went wrong
};
*/
JPRO.RowHandMapper.prototype.getHandBeatsToNextThrow = function(hand) {
    var row = this.handToRow(hand);
    //console.log('row=' + row);
    var i = this.rowBeats[row];
    var rHands = this.rhm[row];
    //console.log('rHands=' + rHands);
    var rv = 1;
    while (rv < 999) {
	if (hand === rHands[(i+rv) % rHands.length]) {
	    return rv;
	}
	rv++;
    }
    return 0; // something went wrong
};

/**
 * Increments rowBeats variables, which are used to
 * determine destination hands
 *
 * @method nextBeat
 * @return {RowHandMapper} this object
 */
JPRO.RowHandMapper.prototype.nextBeat = function() {
    var i;
    for (i=0; i<this.rowBeats.length; i++) {
	if (this.rowBeats[i] >= this.rhm[i].length - 1) {
	    this.rowBeats[i] = 0;
	    //this.entryDone[i] = 1;
	}
	else {
	    this.rowBeats[i]++;
	}
	//console.log('rowBeats[' + i + ']=' + this.rowBeats[i]);
    }
    return this;
};

/**
 * Creates an array of specified size filled with
 * specified value or zero if value is not specified.
 *
 * @method makeArray
 * @param sz {Number} size
 * @param val {Number} optional value
 * @return {Array} the created array
 */
JPRO.RowHandMapper.prototype.makeArray = function(sz, val) {
    var val1 = val || 0;
    var i;
    var rv = [];
    for (i=sz-1; i>=0; i--) {
	rv[i] = val1;
    }
    return rv;
};

/*
JPRO.RowHandMapper.prototype.clearEntryDone = function() {
    var i;
    for (i=0; i<this.entryDone.length; i++) {
	this.entryDone[i] = 0;
    }
};
*/

/**
 * Returns the rhm row corresponding to specified Hand.
 * A Hand is assumed to be in no more than one rhm row.
 *
 * @method handToRow
 * @param hand {Hand} hand object to look up
 * @return {Number} the (last) rhm row in which this hand is found
 */
JPRO.RowHandMapper.prototype.handToRow = function(hand) {
    //if (hand) {
//	console.log('RowHandMapper handToRow: hand ok name=' + hand.name);
//    }
//    if (this.handToRowHash) {
//	console.log(this.handToRowHash);
//    }
    return this.handToRowHash[hand.name];
};

/**
 * @author Ed Carstens
 */

/**
 * A Vec represents a 3D vector
 *
 * @class Vec
 * @constructor
 * @param
 *
 *
 */

(function () {

'use strict';
JPRO.ID.Vec = 0;
JPRO.Vec = function(x, y, z) {

    // Call superclass
    this.className = this.className || 'Vec';
    JPRO.Base.call(this);

    /**
     * X cartesian coordinate
     *
     * @property x
     * @type Number
     */
    this.x = x || 0;

    /**
     * Y cartesian coordinate
     *
     * @property y
     * @type Number
     */
    this.y = y || 0;

    /**
     * Z cartesian coordinate
     *
     * @property z
     * @type Number
     */
    this.z = z || 0;

};

// constructor
JPRO.Vec.prototype = Object.create(JPRO.Base.prototype);
JPRO.Vec.prototype.constructor = JPRO.Vec;
    
/**
 * Copy
 *
 * @method copy
 * @return {Vec} copied vector
 */
//JPRO.Vec.prototype.copy = function(objHash, obj) {
//JPRO.Vec.prototype.copy = function(objHash, cFunc) {
    //cFunc = cFunc || function() { return new JPRO.Vec(); };
//    return this.copyOnce(objHash, cFunc);
//};
    
/**
 * Getter function for X coordinate
 *
 * @method getX
 * @return {Number} X coordinate
*/
JPRO.Vec.prototype.getX = function() {
    return this.x;
};
    
/**
 * Getter function for Y coordinate
 *
 * @method getY
 * @return {Number} Y coordinate
*/
JPRO.Vec.prototype.getY = function() {
    return this.y;
};
    
/**
 * Getter function for Z coordinate
 *
 * @method getZ
 * @return {Number} Z coordinate
*/
JPRO.Vec.prototype.getZ = function() {
    return this.z;
};

/**
 * Setter function for X,Y,Z coordinates
 *
 * @method set
 * @param x {number} the X coordinate
 * @param y {number} the Y coordinate
 * @param z {number} the Z coordinate
*/
JPRO.Vec.prototype.set = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
};
    
/**
 * Setter function for X,Y,Z coordinates from Vec
 *
 * @method setV
 * @param v {Vec} Vec object from which coordinates are copied
*/
JPRO.Vec.prototype.setV = function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
};

/**
 * Calculates manhattan distance from this point to another point.
 *
 * @method mDist
 * @param v {Vec} the other point
*/
JPRO.Vec.prototype.mDist = function(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
};

/**
 * Calculates manhattan distance from this point to another point
 * using only the X and Y coordinates.
 *
 * @method mDist2
 * @param v {Vec} the other point
*/
JPRO.Vec.prototype.mDist2 = function(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
};

/**
 * Scales all three coordinates by some power of 2
 *
 * @method scale
 * @param sc {number} Coordinates are scaled by 2^sc
*/
JPRO.Vec.prototype.scale = function(sc) {
    this.x = this.x << sc;
    this.y = this.y << sc;
    this.z = this.z << sc;
};

/**
 * Adds vectors; adds another Vec to this Vec and
 * returns a new Vec.
 *
 * @method add
 * @param v {Vec} the other vector
*/
JPRO.Vec.prototype.add = function(v) {
    return new JPRO.Vec(
	this.x + v.x,
	this.y + v.y,
	this.z + v.z
    );
};

/**
 * Adds vectors; adds another Vec to this Vec,
 * stores the result in this Vec and returns this Vec.
 *
 * @method
 * @param v {Vec} the other vector
*/
JPRO.Vec.prototype.acc = function(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
};

/**
 * Returns string representing this Vec object.
 *
 * @method toString
*/
JPRO.Vec.prototype.toString = function() {
    return '(' + this.x + ',' + this.y + ',' + this.z + ')';
};

})();

/**
 * @author Ed Carstens
 */

/**
 * A Matrix represents a 3x3 matrix or
 * a special 4x4 matrix for robotics kinematics math
 *
 * @class Matrix
 * @constructor
 * @param row1 {Vec} the first row of the matrix
 * @param row2 {Vec} the second row of the matrix
 * @param row3 {Vec} the third row of the matrix
 * @param col4 {Vec} optional fourth column of matrix
 *
 */

(function () {

'use strict';
JPRO.ID.Matrix = 0;
JPRO.Matrix = function(row1, row2, row3, col4) {

    // Call superclass
    this.className = this.className || 'Matrix';
    JPRO.Base.call(this);

    var r1 = row1 || new JPRO.Vec(1,0,0);
    var r2 = row2 || new JPRO.Vec(0,1,0);
    var r3 = row3 || new JPRO.Vec(0,0,1);
    
    /**
     * 3x3 matrix
     *
     * @property m
     * @type Array
     */
    this.m = [r1.getX(), r1.getY(), r1.getZ(),
	      r2.getX(), r2.getY(), r2.getZ(),
	      r3.getX(), r3.getY(), r3.getZ()];
    
    /**
     * 4th column in special 4x4 matrix
     * This column vector represents a linkage
     * translation in robotic kinematics math.
     *
     * @property col4
     * @type Array
     */
    this.col4 = (col4 === undefined) ? new JPRO.Vec() : col4; // 4th column

};

// constructor
JPRO.Matrix.prototype = Object.create(JPRO.Base.prototype);
JPRO.Matrix.prototype.constructor = JPRO.Matrix;

/**
 * Copy
 *
 * @method copy
 * @return {Matrix} copied Matrix
 */
JPRO.Matrix.prototype.copy = function(objHash, cFunc) {
    // skip the m property (an array of numbers)
    var rv = this.copyOnce(objHash, cFunc, {'m':1});
    rv.m = this.m.slice();
    return rv;
};

/**
 * Multiplies two matrixes
 *
 * @method xMatrix
 * @param a {Matrix} is matrix to multiply this matrix by
 * @return {Matrix} result
*/
JPRO.Matrix.prototype.xMatrix = function(a) {
    var m0,m1,m2,m3,m4,m5,m6,m7,m8;
    m0 = this.m[0]*a.m[0] + this.m[1]*a.m[3] + this.m[2]*a.m[6];
    m1 = this.m[0]*a.m[1] + this.m[1]*a.m[4] + this.m[2]*a.m[7];
    m2 = this.m[0]*a.m[2] + this.m[1]*a.m[5] + this.m[2]*a.m[8];
    m3 = this.m[3]*a.m[0] + this.m[4]*a.m[3] + this.m[5]*a.m[6];
    m4 = this.m[3]*a.m[1] + this.m[4]*a.m[4] + this.m[5]*a.m[7];
    m5 = this.m[3]*a.m[2] + this.m[4]*a.m[5] + this.m[5]*a.m[8];
    m6 = this.m[6]*a.m[0] + this.m[7]*a.m[3] + this.m[8]*a.m[6];
    m7 = this.m[6]*a.m[1] + this.m[7]*a.m[4] + this.m[8]*a.m[7];
    m8 = this.m[6]*a.m[2] + this.m[7]*a.m[5] + this.m[8]*a.m[8];
    this.m = [m0, m1, m2,
	      m3, m4, m5,
	      m6, m7, m8];
    return this;
};

/**
 * Multiplies two 4x4 matrixes
 * [R1 c1] x [R2 c2] = [R1xR2 R1xc2+c1]
 *
 * @method xMatrix4
 * @param a {Matrix} is matrix to multiply this matrix by
 * @return {Matrix} result
*/
JPRO.Matrix.prototype.xMatrix4 = function(a) {
    this.col4.acc(this.xVec(a.col4));
    return this.xMatrix(a);
};

/**
 * Multiply this matrix by vector
 * Returns new vector = M*v
 * @method xVec
 * @param v {Vec}
 * @return {Vec} result
*/
JPRO.Matrix.prototype.xVec = function(v) {
    var x = v.getX();
    var y = v.getY();
    var z = v.getZ();
    return new JPRO.Vec(
	this.m[0]*x + this.m[1]*y + this.m[2]*z,
	this.m[3]*x + this.m[4]*y + this.m[5]*z,
	this.m[6]*x + this.m[7]*y + this.m[8]*z
    );
};

/**
 * Multiplies this 4x4 matrix by vector
 *
 * @method xVec4
 * @param v {Vec} vector to multiply this matrix by
 * @return {Vec} result
*/
// [R1 c1] * [v] = [R1 * v + c1]
JPRO.Matrix.prototype.xVec4 = function(v) {
    return this.xVec(v).acc(this.col4);
};

/**
 * Multiplies this matrix by vector and result is
 * stored in vector, then returns this matrix.
 *
 * @method xV
 * @param v {Vec} vector to be transformed by this matrix
 * @return this (matrix)
*/
// Returns this matrix after v=M*v
JPRO.Matrix.prototype.xV = function(v) {
    var x = v.getX();
    var y = v.getY();
    var z = v.getZ();
    v.x = this.m[0]*x + this.m[1]*y + this.m[2]*z;
    v.y = this.m[3]*x + this.m[4]*y + this.m[5]*z;
    v.z = this.m[6]*x + this.m[7]*y + this.m[8]*z;
    return this;
};

/**
 * Return string representing matrix
 *
 * @method toString
 * @return string representing matrix
*/
JPRO.Matrix.prototype.toString = function() {
    return '[[' + this.m[0] + ',' + this.m[1] + ',' + this.m[2] + '], [' +
	this.m[3] + ',' + this.m[4] + ',' + this.m[5] + '], [' +
	this.m[6] + ',' + this.m[7] + ',' + this.m[8] + ']]';
};

// Static Matrix functions

/**
 * Return transpose of arbitrary square matrix
 *
 * @method transpose
 * @param m {Array} this is a square matrix
 * @return transpose of matrix
*/
JPRO.Matrix.transpose = function(m) {
    var i,j;
    var cols = m[0].length; // assume square matrix
    var rv = [];
    var col = [];
    for (j=0; j<cols; j++) {
	col = [];
	for (i=0; i<m.length; i++) {
	    col.push(m[i][j]);
	}
	rv.push(col);
    }
    return rv;
};

})();

/**
 * @author Ed Carstens
 */

/**
 * A Rotation matrix is a special matrix used to
 * rotate a vector or another rotation matrix into
 * a new frame of reference.
 *
 * @class Rmatrix
 * @constructor
 * @param degrees {Number} the degrees of rotation
 * @param axis {Number} the axis of rotation
 *
 */

(function () {

'use strict';

JPRO.Rmatrix = function(degrees, axis) {
    this.degrees = degrees || 0;
    this.axis = axis || JPRO.XAXIS; // JPRO.XAXIS=0
    
    var radians = degrees*PIXI.DEG_TO_RAD;
    var s = Math.sin(radians);
    var c = Math.cos(radians);
    var m = [c,-s,0,s,c,0,0,0,1];
    if (axis === JPRO.XAXIS) {
	m = [1,0,0,0,c,-s,0,s,c];
    }
    else if (axis === JPRO.YAXIS) {
	m = [c,0,s,0,1,0,-s,0,c];
    }
    var r1 = new JPRO.Vec(m[0],m[1],m[2]);
    var r2 = new JPRO.Vec(m[3],m[4],m[5]);
    var r3 = new JPRO.Vec(m[6],m[7],m[8]);
    this.className = 'Rmatrix';
    JPRO.Matrix.call(this,r1,r2,r3);
};

// constructor
JPRO.Rmatrix.prototype = Object.create( JPRO.Matrix.prototype );
JPRO.Rmatrix.prototype.constructor = JPRO.Rmatrix;

})();

/**
 * @author Ed Carstens
 */

/**
 * ThrowSeq is just an MHN matrix describing throws, that may or may not
 * be a (periodic) pattern. Pattern inherits from ThrowSeq. Transition
 * sequences (linking excited state patterns to ground state ones)
 * should be ThrowSeq objects rather than Pattern objects.
 *
 * @class ThrowSeq
 * @constructor
 * @param mhn {Array} MHN throw matrix
 * @param rhMap {RowHandMapper} row-to-hand mapping object
 * @param name {String} name of this ThrowSeq
 *
 */

(function () {

    'use strict';
    JPRO.ID.ThrowSeq = 0;
    JPRO.ThrowSeq = function(mhn, rhMap, name) {
	
	// Call superclass
	this.className = this.className || 'ThrowSeq';
	JPRO.Base.call(this, name);

	/**
	 * Type of throw matrix object
	 *
	 * @property type
	 * @type String
	 */
	//this.type = 'ThrowSeq';
	
	/**
	 * MHN throw matrix
	 *
	 * @property mhn
	 * @type Array
	 */
	this.mhn = mhn ? mhn : [[[[0,0]]]];
	
	/**
	 * Row-to-hand mapper object ref
	 *
	 * @property rhMap
	 * @type RowHandMapper
	 */
	this.rhMap = rhMap;

	/**
	 * Number of iterations
	 *
	 * @property iters
	 * @type Number
	 */
	this.iters = 1;
	
	/**
	 * 
	 *
	 * @property rows
	 * @type Number
	 */
	this.rows = this.mhn.length;
	
	/**
	 * 
	 *
	 * @property period
	 * @type Number
	 */
	this.period = this.mhn[0].length;
//	console.log('rows=' + this.rows + ' period=' + this.period);
	
	/**
	 * Iteration counter
	 *
	 * @property iterCnt
	 * @type Number
	 */
	this.iterCnt = 0;
	
	/**
	 * 
	 *
	 * @property 
	 * @type 
	 */
	this.maxRows = 10; // limit to 10 rows

	/**
	 * 
	 *
	 * @property 
	 * @type 
	 */
	this.maxPeriod = 32;

	/**
	 * Used in ordering selected throws
	 *
	 * @property selectionOrder
	 * @type Number
	 */
	this.selectionOrder = 0;

	/**
	 * Number of throws selected
	 *
	 * @property selections
	 * @type Number
	 */
	this.selections = 0;

	/**
	 * Is the specified throw in MHN+ selected?
	 *
	 * @property isSelected
	 * @type Object
	 */
	this.isSelected = {}; // hash

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

	this.beat = 0;

    };

    JPRO.ThrowSeq.prototype = Object.create(JPRO.Base.prototype);
    JPRO.ThrowSeq.prototype.constructor = JPRO.ThrowSeq;

    /**
     * Copy
     *
     * @method copy
     * @param objHash {Object} tracks all copied objects
     * @param cFunc {Function} constructor function
     * @return {ThrowSeq} copied ThrowSeq
     */
    JPRO.ThrowSeq.prototype.copy = function(objHash, cFunc) {
	var pFuncs = {};
	pFuncs.mhn = JPRO.Common.makeCopyMatrix(4);
	var skip = {};
	skip.selectionOrder = 1;
	skip.selections = 1;
	skip.isSelected = 1;
	return this.copyOnce(objHash, cFunc, skip, pFuncs);
    };

 /*    JPRO.ThrowSeq.prototype.isThrowing = function(hand) {
	var i;
	for (i=0; i<this.mhn.length; i++) {
	    if (this.rhMap.getHand(i) === hand) {
		return 1;
	    }
	}
	return null;
    };
*/    

    /**
     * Indicates whether this object is to be repeated
     *
     * @method repeat
     * @return {Boolean} 1=repeat, null=finished
     */
    JPRO.ThrowSeq.prototype.repeat = function() {
	//console.log('ThrowSeq.repeat: iterCnt=' + this.iterCnt);
	if (this.iters < 0) {
	    return 1; // restart pattern indefinitely
	}
	else if (this.iterCnt < this.iters-1) {
	    this.iterCnt++;
	    //console.log('ThrowSeq.repeat: iterCnt=' + this.iterCnt);
	    return 1; // restart pattern
	}
	else {
	    this.iterCnt = 0; // reset for next time
	    return null; // finished
	}
    };
    
    /**
     * Alias for rhMap.getHand
     *
     * @method getHand
     * @param row {Number}
     * @param beatRel {Number}
     * @return {Hand} destination hand
     */
    JPRO.ThrowSeq.prototype.getHand = function (row,beatRel) {
	return this.rhMap.getHand(row,beatRel);
    };
    
    /**
     * Increments rowBeats variables, which are used to
     * determine destination hands; increments beat,
     * resetting beat to zero at pattern period.
     *
     * @method nextBeat
     * @return {Boolean} 1 when pattern repeats
     */
    JPRO.ThrowSeq.prototype.nextBeat = function () {
	var rv;
	//console.log(this.toString());
	//console.log('beat=' + this.beat + ' pd=' + this.mhn[0].length);
	if (this.beat >= this.mhn[0].length-1) {
	    this.beat = 0;
	    rv = this.repeat();
	}
	else {
	    this.beat++;
	    rv = 1;
	}
	if (this.iters !== 0) {
	    this.rhMap.nextBeat();
	}
	return rv;
    };

    /**
     * Swap two throws in MHN+ matrix
     *
     * @method swap
     * @param loc1 {Array}
     * @param loc2 {Array}
     */
    JPRO.ThrowSeq.prototype.swap = function(loc1, loc2) {
	var r1 = loc1[0];
	var t1 = loc1[1];
	var ms1 = loc1[2];
	var r2 = loc2[0];
	var t2 = loc2[1];
	var ms2 = loc2[2];
	var p1 = this.mhn[r1][t1][ms1];
	var p2 = this.mhn[r2][t2][ms2];
	var p1r = p1[0]; // pair1 destination row
	var p1t = p1[1] + t1; // pair1 destination time (absolute)
	this.mhn[r2][t2][ms2] = [p1r, p1t - t2]; // time adjusted (relative)
	var p2r = p2[0];
	var p2t = p2[1] + t2;
	this.mhn[r1][t1][ms1] = [p2r, p2t - t1];
	return this;
    };

    /**
     * Cleans the MHN+ matrix by removing any
     * multiplex slots that exist but are not
     * a throw (i.e. zero throw-height and to
     * the same row).
     *
     * @method clean
     */
    JPRO.ThrowSeq.prototype.clean = function() {
	var i,j;
	for (i=0; i<this.mhn.length; i++) {
	    for (j=0; j<this.mhn[i].length; j++) {
		this.mhn[i][j] = this.cleanList(this.mhn[i][j], i);
	    }
	} // end for i	
    };

    /**
     * Called by clean, this method returns a new (clean)
     * list of (multiplex) throws, with non-throws removed
     * except in the case that there is no throw at all,
     * the list consists of one non-throw (i.e. zero).
     *
     * @method cleanList
     * @param pairs {Array}
     * @param row {Number}
     * @return {Array}
     */
    JPRO.ThrowSeq.prototype.cleanList = function(pairs, row) {
	var rv = [];
	var pair;
	while (pair=pairs.shift) {
	    if ((pair[1] !== 0) || (pair[0] !== row)) {
		rv.push(pair);
	    }
	} // end while
	if (rv === []) {
	    rv = [row,0];
	}
	return rv;
    };

    /**
     * Keeps track of throw selection ordered list
     *
     * @method select
     * @param row {Number}
     * @param col {Number}
     * @param ms {Number}
     */
    JPRO.ThrowSeq.prototype.select = function(row, col, ms) {
	var k = row + ',' + col + ',' + ms; // hash key
	if (this.isSelected[k]) {
	    //this.isSelected[k] = 0; // deselect
	    delete this.isSelected[k];
	    this.selections--;
	}
	else {
	    this.isSelected[k] = ++this.selectionOrder;
	    this.selections++;
	}
	//console.log('selections:' + this.selections);
    };

    /**
     * 
     *
     * @method getSelectedThrows
     * @return {Array} selected throws
     */
    JPRO.ThrowSeq.prototype.getSelectedThrows = function() {
	var a,k,aa,i;
	a = [];
	for (k in this.isSelected) {
	    aa = k.split(',');
	    for (i=0; i<aa.length; i++) {
		aa[i] = parseInt(aa[i]); // convert to int
	    }
	    a.push(aa);
	}
	return a;
    };

    /**
     * Clears all throw selections
     *
     * @method clearSelections
     */
    JPRO.ThrowSeq.prototype.clearSelections = function() {
	var k;
	for (k in this.isSelected) {
	    delete this.isSelected[k];
	    this.selections--;
	}
    };

    /**
     * Displays this MHN+ pattern in HTML as a table
     * which has a number of clickable fields.
     *
     * @method toHtml
     * @return {String} HTML tabular representation of this pattern
     */
    JPRO.ThrowSeq.prototype.toHtml = function() {
	var i, j, k, rv, bcolor;
	var swapEnable, r, t;
	var period = this.mhn[0].length;
	swapEnable = (this.selections === 2) ? '' : 'disabled';
	rv = '<table><colgroup>';
	rv += '<col span=\'1\' id="first_col">';
	rv += '<col span=\'' + period + '\'>';
	rv += '<col span=\'1\' id="last_col">';
	rv += '</colgroup>';
	rv += '<tr><th></th>'; // start heading row
	rv += '<th>0</th>'; // heading col0
	for (j=1; j<period; j++) {
	    rv += '<th>' + j + '</th>';
	}
	rv += '<th>-</th>';
	rv += '</tr>'; // finish heading row
	for (i=0; i<this.mhn.length; i++) {
	    rv += '<tr><td>'; // start row
	    rv += this.toHandSymbol(i);
	    rv += '</td>';
	    for (j=0; j<period; j++) {
		rv += '<td>';
		for (k=0; k<this.mhn[i][j].length; k++) {
		    r = this.mhn[i][j][k][0]; // destination row
		    t = this.mhn[i][j][k][1]; // destination beat (relative)
		    if (k > 0) rv += ',';
		    bcolor = this.isSelected[i + ',' + j + ',' + k] ? '#0022dd' :
			((t > this.maxThrowHeight) || (t < 0) || (t === 0) && (r !== i)) ? 'red' :
			(t > this.highThrowHeight) ? 'yellow' : 'black';
		    rv += '<span style=\"background-color:' + bcolor +
			'\" onclick=\"JPRO._table(' + i + ',' + j + ',' + k + ')\">';
		    rv += this.toHandSymbol(r);
		    rv += t;
		    rv += '</span>';
		}
		rv += '</td>'; // finish column element
	    }
	    rv += '<td>';
	    rv += '</td>';
	    rv += '</tr>'; // finish row
	}
	// Final row
	rv += '<tr style=\"background-color:#505050\">'; // start row
	rv += '<td>';
	rv += this.toHandSymbol(this.mhn.length);
	rv += '</td>';
	rv += '<td><button onclick=\"JPRO._swap()\"' + swapEnable + '> Swap </button></td>';
	for (j=1; j<period; j++) {
	    rv += '<td></td>';
	}
	// bottom right cell
	rv += '<td></td>';
	rv += '</tr>'; // finish row
	rv += '</table>';
	return rv;
    };
    
    /**
     * Convert row number to capital letter
     *
     * @method toHandSymbol
     * @param row {Number}
     * @return {String} capital letter representing row number
     */
    JPRO.ThrowSeq.prototype.toHandSymbol = function(row) {
	return String.fromCharCode(65 + row); // A,B,..
    };
        
    /**
     * Returns string representation of this throw sequence
     *
     * @method toString
     * @param mhn {Array} optional MHN+ matrix; if omitted, use this.mhn
     * @return {String} string representation of this throw sequence
     */
    JPRO.ThrowSeq.prototype.toString = function(mhn) {
	var rv, i, j, k, mhnTmp;
	mhnTmp = mhn;
	if ((mhn === null) || (mhn === undefined)) {
	    mhnTmp = this.mhn;
	}
	rv = '[';
//	console.log(mhn);
//	console.log(mhnTmp);
	for (i=0; i<mhnTmp.length; i++) {
	    if (i > 0) {
		rv = rv + ', ';
	    }
	    rv = rv + '[';
	    for (j=0; j<mhnTmp[i].length; j++) {
		if (j > 0) {
		    rv = rv + ', ';
		}
		rv = rv + '[';
		for (k=0; k<mhnTmp[i][j].length; k++) {
		    if (k > 0) {
			rv = rv + ', ';
		    }
		    rv = rv.concat('[');
		    rv = rv.concat(mhnTmp[i][j][k][0]);
		    rv = rv.concat(',');
		    rv = rv.concat(mhnTmp[i][j][k][1]);
		    rv = rv.concat(']');
		}
		rv = rv + ']';
	    }
	    rv = rv + ']';
	}
	rv = rv + ']';
	return rv;
    };
    
})();

/**
 * @author Ed Carstens
 */

/**
 * A Pattern is a periodic (repeatable) sequence of throws.
 *
 * @class Pattern
 * @extends ThrowSeq
 * @constructor
 * @param mhn {Array} the MHN+ throw matrix
 * @param rowHands {Array} row-to-hand mapping
 * @param iters {Number} number of iterations of pattern to be executed
 *
 */
(function () {

'use strict';
JPRO.ID.Pattern = 0;
/* global $:true, viewer:true */
JPRO.Pattern = function(mhn, rhMap, iters, name) {

    // Call superclass
    this.className = this.className || 'Pattern';
    JPRO.ThrowSeq.call(this, mhn, rhMap, name);

    /**
     * Type string
     *
     * @property type
     * @type String
     */
    //this.type = 'Pattern';

    /**
     * Iterations
     *
     * @property iters
     * @type Number
     */
    this.iters = (iters === undefined) ? -1 : iters; // -1 means repeat forever

    /**
     * Iteration
     *
     * @property iterCnt 
     * @type Number
     */
    this.iterCnt = 0;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.props = this.calcProps();

};

JPRO.Pattern.prototype = Object.create( JPRO.ThrowSeq.prototype );
JPRO.Pattern.prototype.constructor = JPRO.Pattern;

/**
 * 
 *
 * @method setPeriodRows
 * @param period {Number}
 * @param rows {Number} 
 */
JPRO.Pattern.prototype.setPeriodRows = function(period, rows) {
    if (period) {
	this.period = period;
    }
    if (rows) {
	this.rows = rows;
    }
    this.mhn = this.genMhn(this.rows, this.period);
    this.props = this.calcProps();
    this.rowBeats = this.makeArray(this.rows); // make array of length rows, all zeros
    return this;
};

/**
 * 
 *
 * @method genMhn
 * @param rows {Number} 
 * @param period {Number}
 */
// generate MHN+ matrix (+ is multiplex-capable)
JPRO.Pattern.prototype.genMhn = function(rows, period) {
    var pairs; // list of hand/throw pairs (multiplex-capable)
    //var pair;
    var mhnRow;
    var i,j;
    var mhn = [];
    for (i=0; i<rows; i++) {
	//console.log('i=' + i);
	mhnRow = [];
	for (j=0; j<period; j++) {
	    pairs = [[i, 0]];
	    //console.log('j=' + j);
	    mhnRow.push(pairs);
	}
	mhn.push(mhnRow);
    }
    return mhn;
};

/**
 * 
 *
 * @method makeArray
 * @param sz {Number}
 * @param val {Number}
 */
JPRO.Pattern.prototype.makeArray = function(sz, val) {
    var val1 = val || 0;
    var i;
    var rv = [];
    for (i=sz-1; i>=0; i--) {
	rv[i] = val1;
    }
    return rv;
};

/**
 * Adds an offset to all throws in the throw matrix
 *
 * @method translateAll
 * @param offset {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.translateAll = function(offset) {
    var i,j,k;
    var offset1 = (offset === undefined) ? 1 : offset; // default to 1
    var sum = 0;
    for (i=0; i<this.rows; i++) {
	for (j=0; j<this.period; j++) {
	    for (k=0; k<this.mhn[i][j].length; k++) {
		this.mhn[i][j][k][1] += offset1;
		sum += offset1;
	    }
	}
    }
    this.props += Math.round(sum/this.period);
    return this;
};

/**
 * Adds multiple of the period to a throw
 *
 * @method translateThrow
 * @param loc {Array}
 * @param mult {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.translateThrow = function(loc, mult) {
    var r = loc[0];
    var t = loc[1];
    var ms = loc[2];
    var mult1 = (mult === undefined) ? 1 : mult; // default to 1
    this.mhn[r][t][ms][1] += mult1*this.period;
    this.props += mult1;
    return this;
};

/**
 * Adds multiple of the period to selected throws
 *
 * @method translateThrowsSelected
 * @param mult {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.translateThrowsSelected = function(mult) {
    var a,i;
    a = this.getSelectedThrows();
    for (i=0; i<a.length; i++) {
	this.translateThrow(a[i], mult);
    }
    return this;
};
    
/**
 * 
 *
 * @method multiplexTranslate
 * @param row {Number}
 * @param offset {Number}
 */
JPRO.Pattern.prototype.multiplexTranslate = function(row, offset) {
    var j;
    var row1 = row || 0; // default row to zero
    var offset1 = (offset === undefined) ? 1 : offset; // default offset to 1
    if (this.mhn[row1][0].length >= 4) { // button-happy kid proof this
	alert('No more than 4 multiplex slots allowed per row');
	return this;
    }
    for (j=0; j<this.period; j++) {
	this.mhn[row1][j].push([row1,offset1]); // new multiplex slot pair
    }
    this.props += offset1;
    return this;
};

/**
 * Rotates throws so that column x becomes column 1
 *
 * @method rotateThrows
 * @param x {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.rotateThrows = function(x) {
    var i;
    for (i=0; i<this.rows; i++) {
	this.mhn[i] = this.rotateRow(x, this.mhn[i]);
    }
    return this;
};

/**
 * Rotates throws only in specified row so that column x
 * of that row becomes column 1 of that row
 *
 * @method rotateRow
 * @param x {Number}
 * @param mhnRow {Array}
 * @return {Array} new rotated row
 */
JPRO.Pattern.prototype.rotateRow = function(x, mhnRow) {
    var j, idx;
    var rv = [];
    for (j=mhnRow.length-1; j>=0; j--) {
	idx = (j + x) % mhnRow.length;
	rv[j] = mhnRow[idx];
    }
    return rv;
};
    
/**
 * Rotates rows in MHN+ so that row x becomes the
 * first row
 *
 * @method rotateRows
 * @param x {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.rotateRows = function(x) {
    var i, idx;
    if (this.rows < 2) {
	return this;
    }
    var mhn = this.mhn.slice(0); // shallow clone
    for (i=0; i<this.rows; i++) {
	idx = (i + x + this.rows) % this.rows;
	this.mhn[i] = this.rotateRowsAdjust(mhn[idx], i-idx, this.rows);
    }
    return this;
};

/**
 * Adjusts all throws in a given row so that the relative
 * row destination stays the same when rotating rows.
 *
 * @method rotateRowsAdjust
 * @param row {Array}
 * @param adjustment {Number}
 * @param rows {Number}
 * @return {Array} adjusted row
 */
JPRO.Pattern.prototype.rotateRowsAdjust = function(row, adjustment, rows) {
    var j, k;
    for (j=0; j<row.length; j++) {
	for (k=0; k<row[j].length; k++) {
	    row[j][k][0] = (row[j][k][0] + adjustment + rows) % rows;
	}
    }
    return row;
};

/**
 * Extends period by one, choosing legal throw-heights
 *
 * @method extendPeriod
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.extendPeriod = function() {
    //console.log('extendPeriod called');
    var j,i,k,tAbs,x,msThrows,adjust;
    var sum = 0;
    var n = 0; // amount subtracted from each throw
    if (this.period >= this.maxPeriod) { // kid proofed
	alert('Period upper limit is ' + this.maxPeriod);
	return this;
    }
    while (sum < this.props*this.period) {
	for (j=0; j<this.period; j++) {
	    for (i=0; i<this.rows; i++) {
		for (k=0; k<this.mhn[i][j].length; k++) {
		    this.mhn[i][j][k][1] -= 1;
		    sum++;
		}
	    } // for i
	} // for j
	n++;
    } // while
    if (sum > this.props*this.period) {
	adjust = 1;
    }
    else {
	adjust = 0;
    }
    for (j=0; j<this.period; j++) {
	for (i=0; i<this.rows; i++) {
	    for (k=0; k<this.mhn[i][j].length; k++) {
		tAbs = this.mhn[i][j][k][1] + j + adjust; // absolute beat time
		x = Math.floor(tAbs/this.period); // adjusted for extra column
		this.mhn[i][j][k][1] += x + n; // add n back in to each throw
	    } // for k
	} // for i
    } // for j
    
    // Extend the period by one column
    for (i=0; i<this.rows; i++) {
	msThrows = [];
	for (k=0; k<this.mhn[i][0].length; k++) {
	    msThrows.push([i, n-adjust]);
	} // for k
	this.mhn[i].push(msThrows); // new column
    } // for i
    this.period++; // increment period
    return this;
};

/**
 * Extends rows by one, using specified throw-height
 *
 * @method extendRows
 * @param throwHeight {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.extendRows = function(throwHeight) {
    var t = throwHeight || 0;
    var row = [];
    var j;
    if (this.rows >= this.maxRows) { // kid proofed
	alert('Rows upper limit is ' + this.maxRows);
	return this;
    }
    for (j=0; j<this.period; j++) {
	row.push([[this.rows, t]]);
    }
    this.mhn.push(row); // append new row
    this.rows++; // increment rows
    return this;
};

/**
 * Resets the pattern to [[[[0,0]]]]
 *
 * @method reset
 */
JPRO.Pattern.prototype.reset = function() {
    this.period = 1;
    this.rows = 1;
    this.mhn = [[ [[0,0]] ]];
    this.props = 0;
};
    
/**
 * Calculate and return number of props juggled
 * in this pattern.
 *
 * @method calcProps
 * @return {Number} calculated number of props
 */
JPRO.Pattern.prototype.calcProps = function() {
    var i,j,k,sum,rv;
    //console.log('calcProps called');
    sum = 0;
    for (i=0; i<this.rows; i++) {
	for (j=0; j<this.period; j++) {
	    for (k=0; k<this.mhn[i][j].length; k++) {
		sum += this.mhn[i][j][k][1];
	    }
	}
    }
    //console.log('sum=' + sum);
    rv = sum/this.period;
    // todo - check for error if rv is not an integer
    return Math.round(rv);
};

/**
 * Displays this MHN+ pattern in HTML as a table
 * which has a number of clickable fields.
 *
 * @method toHtml
 * @return {String} HTML tabular representation of this pattern
 */
JPRO.Pattern.prototype.toHtml = function() {
    var i, j, k, rv, bcolor;
    var swapEnable, call, r, t;
    swapEnable = (this.selections === 2) ? '' : 'disabled';
    call = this.selections ? 'JPRO._ts' : 'JPRO._ta'; // translate selected by +-period or all throws by +-1
    rv = '<table><colgroup>';
    rv += '<col span=\'1\' id="first_col">';
    rv += '<col span=\'' + this.period + '\'>';
    rv += '<col span=\'1\' id="last_col">';
    rv += '</colgroup>';
    rv += '<tr><th><button onclick=\"JPRO._ac()\">AC</button></th>'; // start heading row
    rv += '<th><button onclick=\"' + call + '(1)\">0<sup>+</sup></button></th>'; // heading col0
    for (j=1; j<this.period; j++) {
	rv += '<th><button onclick=\"JPRO._rt(' + j + ')\">' + j + '</button></th>';
    }
    rv += '<th><button onclick=\"JPRO._ep()\">' + this.period + '</button></th>';
    rv += '</tr>'; // finish heading row
    call += '(-1)';
    for (i=0; i<this.rows; i++) {
	rv += '<tr><td><button onclick=\'' + call + '\'>'; // start row
	call = 'JPRO._rr(' + (i+1) + ')';
	rv += this.toHandSymbol(i);
	if (i === 0) {
	    rv += '<sup>-</sup>';
	}
	rv += '</button></td>';
	for (j=0; j<this.period; j++) {
	    rv += '<td>';
	    for (k=0; k<this.mhn[i][j].length; k++) {
		r = this.mhn[i][j][k][0]; // destination row
		t = this.mhn[i][j][k][1]; // destination beat (relative)
		if (k > 0) rv += ',';
		bcolor = this.isSelected[i + ',' + j + ',' + k] ? '#0022dd' :
		    ((t > this.maxThrowHeight) || (t < 0) || (t === 0) && (r !== i)) ? 'red' :
		    (t > this.highThrowHeight) ? 'yellow' : 'black';
		rv += '<span style=\"background-color:' + bcolor +
		    '\" onclick=\"JPRO._table(' + i + ',' + j + ',' + k + ')\">';
		rv += this.toHandSymbol(r);
		rv += t;
		rv += '</span>';
	    }
	    rv += '</td>'; // finish column element
	}
	rv += '<td>';
	rv += '<button onclick=\"JPRO._mp(' + i + ')\"> Multiplex </button>';
	rv += '</td>';
	rv += '</tr>'; // finish row
    }
    // Final row
    rv += '<tr style=\"background-color:#505050\">'; // start row
    rv += '<td><button onclick=\"JPRO._er()\">';
    rv += this.toHandSymbol(this.rows);
    rv += '</button></td>';
    rv += '<td><button onclick=\"JPRO._swap()\"' + swapEnable + '> Swap </button></td>';
    for (j=1; j<this.period; j++) {
	rv += '<td></td>';
    }
    // bottom right cell
    rv += '<td><button onclick=\"JPRO._reset()\"> Reset </button></td>';
    rv += '</tr>'; // finish row
    rv += '</table>';
    return rv;
};

/**
 * Finds a minimum throw sequence to transition from
 * this pattern to the specified one.
 *
 * @method getTranstion
 * @param destPat {Pattern}
 * @return {ThrowSeq} throw sequence to get from this pattern
 *     to destination pattern
 */
JPRO.Pattern.prototype.getTransition = function(destPat) {
    var destState = new JPRO.State(destPat.mhn, destPat.props);
    var myState = new JPRO.State(this.mhn, this.props);
    return myState.getTransition(destState);
};

// Global functions for onclick events

/**
 * 
 *
 * @method _ac
 */
JPRO._ac = function() {
    viewer.pattern.clearSelections();
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _ta
 * @param x {Number} offset
 */
JPRO._ta = function(x) {
    viewer.pattern.translateAll(x);
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _ts
 * @param  
 */
JPRO._ts = function(x) {
    viewer.pattern.translateThrowsSelected(x);
    viewer.pattern.clearSelections();
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _rt
 * @param  
 */
JPRO._rt = function(x) {
    viewer.pattern.rotateThrows(x);
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _ep
 * @param  
 */
JPRO._ep = function() {
    viewer.pattern.extendPeriod();
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._mp = function(row) {
    viewer.pattern.multiplexTranslate(row, 1);
    viewer.pattern.clearSelections();
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._rr = function(x) {
    viewer.pattern.rotateRows(x);
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._er = function() {
    viewer.pattern.extendRows(0);
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _swap
 * @param  
 */
JPRO._swap = function() {
    var a = viewer.pattern.getSelectedThrows();
    viewer.pattern.swap(a[0], a[1]);
    viewer.pattern.clearSelections();
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _table
 * @param  
 */
JPRO._table = function(row, col, ms) {
    viewer.pattern.select(row, col, ms);
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _reset
 * @param  
 */
JPRO._reset = function() {
    viewer.pattern.reset();
    $('#div1').html(viewer.pattern.toHtml());
};

})();

/**
 * @author Ed Carstens
 */

/**
 * A Routine is an ordered list of Pattern's, ThrowSeq's, or Routine's.
 * Each pattern can be executed X>=0 number of times or indefinitely (X=-1)
 * Routine.iters allows multiple runs of the routine
 * @class Routine
 * @constructor
 * @param patterns {Array} array of Pattern's, ThrowSeq's or Routine's
 *
 */
JPRO.ID.Routine = 0;
JPRO.Routine = function(patterns, iters, name) {

    // Call superclass
    this.className = this.className || 'Routine';
    JPRO.Base.call(this, name);

    /**
     * Sequence of patterns in this routine
     * Each member of this array is either a ThrowSeq, a
     # Pattern, or another Routine.
     *
     * @property patterns
     * @type Array
     */
    this.patterns = (patterns === undefined) ? [] : patterns; // list of patterns

    /**
     * Index to current element of patterns
     *
     * @property 
     * @type 
     */
    this.currentIdx = 0; // index to current element

    /**
     * Index to next element of patterns
     *
     * @property patternIdx
     * @type Number
     */
    this.patternIdx = 0; // index to next element in patterns

    /**
     * Iterations
     *
     * @property iters
     * @type Number
     */
    this.iters = (iters === undefined) ? -1 : iters;

    /**
     * Iteration count
     *
     * @property iterCnt
     * @type Number
     */
    this.iterCnt = 0;

    /**
     * Viewer reference
     *
     * @property viewer
     * @type Viewer
     */
    this.viewer = null;

    /**
     * Enable for this Routine
     *
     * @property enable
     * @type Boolean
     */
    this.enable = 1;

    /**
     * Object type (could be replaced by className now)
     *
     * @property type
     * @type String
     */
    //this.type = 'Routine';

    /**
     * Callback called on entry of this Routine
     *
     * @property entryCB
     * @type Function
     */
    /* jshint unused:false */
    this.entryCB = function(laf) {};
    /* jshint unused:true */
    /**
     * Callback called on exit of this Routine
     *
     * @property exitCB
     * @type Function
     */
    /* jshint unused:false */
    this.exitCB = function(laf) {};
    /* jshint unused:true */
};

JPRO.Routine.prototype = Object.create(JPRO.Base.prototype);
JPRO.Routine.prototype.constructor = JPRO.Routine;

/**
 * Copies this routine
 *
 */
JPRO.Routine.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    pFuncs.patterns = JPRO.Common.copyObjVector;
    var callBacks = ['entryCB', 'exitCB'];
    return this.copyOnce(objHash, cFunc, {}, pFuncs, callBacks);
};

/**
 * Pushes a pattern, throw sequence, or routine to
 * the patterns list.
 *
 * @method pushPat
 * @param pat {ThrowSeq | Routine} 
*/
JPRO.Routine.prototype.pushPat = function(pat) {
    this.patterns.push(pat);
    return this;
};

/**
 * Assigns the next pattern or throw sequence to the viewer.
 *
 * @method nextPat
 * @param viewer {Viewer} The viewer object
 * @param depth {Number} Recursive depth
*/
JPRO.Routine.prototype.nextPat = function(viewer, depth, lookAhead) {
    var i,j,x,pat,d,laf;
    //console.log('nextPat called with depth=' + depth + ' lookAhead=' + lookAhead);
    if (this.enable === null) {
	this.enable = 1;
	return null;
    }
    d = depth ? depth : 0;
    if (d > 99) {
	this.enable = null;
	throw 'exceeded recursive limit';
    }
    if (viewer) {
	this.viewer = viewer;
    }
    laf = lookAhead || 0; // lookahead flag
    if (this.iters === 0) {
	this.enable = null;
	return null;
    }
    j = 0;
    i = this.patternIdx;
    //console.log('pattern idx = ' + i);

    // Check for initial entry
    if ((this.iterCnt === 0) && (i === 0)) this.entryCB(laf);
    
    // Find first pattern with iters>0
    while ((j < this.patterns.length) && (this.patterns[i].iters === 0)) {
	i++;
	if (i >= this.patterns.length) {
	    i = 0;
	    if (this.iters > 0) {
		this.iterCnt++;
	    }
	}
	j++;
    }
    if (j === this.patterns.length) {
	throw 'routine has no iterable pattern in it';
    }
    // Set viewer pattern and other viewer vars
    x = this.patterns[i];
    this.patternIdx = i;
//    while (x.type === 'Dynamic') {
	//console.log('x is Dynamic object');
//	x = x.getRoutine(this, laf);
	//console.log('dynamic loop: x=' + x);
//    }
    if (x.className === 'Routine') {
	pat = x.nextPat(this.viewer, d+1, laf);
	if (pat) {
	    this.currentIdx = this.patternIdx;
	    return pat;
	}
	x.enable = 1;
	//console.log('finished routine');
	pat = null;
    }
    else {
	pat = x;
	this.currentIdx = this.patternIdx;
//	this.viewer.pattern = pat;
	//this.viewer.beatPeriod = pat.beatPeriod;
	//this.viewer.beatPeriod = this.patterns[i].get_beatPeriod(this.viewer.beat, this.viewer.base_beatPeriod);
	// Update MHN table in html
	//$('#div1').html(pat.toHtml());
	//return 1;
    }

    // Increment pattern index
    i++;
    if (i >= this.patterns.length) {
	i = 0;
	if ((this.iters > 0) || (this.iterCnt === 0)) {
	    this.iterCnt++;
	}
    }
    this.patternIdx = i;

    // Check for exit condition
    if ((this.iters > 0) && (this.iterCnt >= this.iters)) {
	this.iterCnt = 0;
	this.enable = null; // disable for next time
	this.exitCB(laf);
	return pat;
    }
    
    if (pat === null) {
	return this.nextPat(this.viewer, d+1, laf);
    }
    else {
	return pat;
    }
};

/**
 * Returns string representation of this routine
 *
 * @method toString
 * @param routine {Routine}
 * @return {String} representation of this routine 
*/
JPRO.Routine.prototype.toString = function() {
    var patterns = this.patterns;
    var i;
    var rv = '[';
    for (i=0; i<patterns.length; i++) {
	if (i > 0) {
	    rv = rv + ', ';
	}
	rv = rv + patterns[i].toString();
    }
    rv = rv + ']';
    return rv;
};

/**
 * @author Ed Carstens
 */

/**
 * A State is like a snapshot of a juggling pattern
 * at a specific throw beat. A state has the same number
 * of rows as the MHN throw matrix, but not necessarily
 * the same number of columns as in the MHN throw matrix.
 * The number in column 3, for example, indicates the
 * number of props which will arrive 3 beats later in
 * the hand associated with that row (and time).
 *
 * @class State
 * @constructor
 * @param mhn {Array} the MHN throw matrix
 * @param props {Number} number of props juggled
 *
 */
(function () {

'use strict';

JPRO.State = function(mhn, props) {
    
    /**
     * MHN+ (Multi-hand notation) throw matrix
     *
     * @property mhn
     * @type Array
     */
    this.mhn = mhn;
    
    /**
     * Number of props in state
     *
     * @property props
     * @type Number
     */
    this.props = props;
    
    var getState = function(mhn, props) {
	var i,j,k;
	var n = props;
	var state = [[]]; // 2D matrix
	var destRow, destTimeRel, scol, timeIdx, maxThrowHeight;
	maxThrowHeight = getMaxThrowHeight(mhn);
	console.log('maxThrowHeight=' + maxThrowHeight);
	for (i=0; i<mhn.length; i++) {
	    // proceed from end of pattern backwards in time
	    // repeating the pattern until all props accounted for
	    timeIdx = 1; // beats relative to final state
	    while (n > 0) {
		if (timeIdx > maxThrowHeight) {
		    console.log('State: ERROR - Unable to determine state for MHN pattern');
		    return;
		}
		for (j=mhn[i].length-1; j>=0; j--) {
		    for (k=0; k<mhn[i][j].length; k++) {
			destRow = mhn[i][j][k][0];
			destTimeRel = mhn[i][j][k][1];
			scol = destTimeRel - timeIdx;
			console.log('i=' + i + ' j=' + j + ' k=' + k + ' th=' + destTimeRel + ' scol=' + scol);
			if (scol >= 0) {
			    if ((state[destRow] === undefined) || (state[destRow][scol] === undefined)) {
				state[destRow][scol] = 1;
			    }
			    else {
				state[destRow][scol]++; // multiplex support
			    }
			    n--;
			}
		    } // for k
		    timeIdx++;
		} // for j
	    } // while
	} // for i
	return state;
    };

    var getMaxThrowHeight = function(mhn) {
	var i,j,k,throwHeight;
	var maxTh = 0;
	for (i=0; i<mhn.length; i++) {
	    for (j=0; j<mhn[i].length; j++) {
		for (k=0; k<mhn[i][j].length; k++) {
		    throwHeight = mhn[i][j][k][1];
		    if (throwHeight > maxTh) {
			maxTh = throwHeight;
		    } // if
		} // for k
	    } // for j
	} // for i
	return maxTh;
    };

    /**
     * A 2D matrix of non-negative integers
     * representing the state.
     *
     * @property state
     * @type Array
     */
    this.state = getState(mhn, props);

};

JPRO.State.prototype.constructor = JPRO.State;

/**
 * Increments specified row/column of this state matrix.
 *
 * @method incr
 * @param row {Number} row of state matrix
 * @param col {Number} column of state matrix
*/
JPRO.State.prototype.incr = function(row, col) {
    if (this.state[row] === undefined) {
	this.state[row] = [];
	this.state[row][col] = 1;
	return;
    }
    if (this.state[row][col] === undefined) {
	this.state[row][col] = 1;
	return;
    }
    this.state[row][col]++;
    return;
};
    
/**
 * Modifies the state matrix as a result of performing the specified
 * throw.
 *
 * @method makeThrow
 * @param row {Number}
 * @param destRow {Number}
 * @param th {Number} throw-height (beats to arrival, relative to current beat)
*/
JPRO.State.prototype.makeThrow = function(row, destRow, th) {
    console.log('makeThrow called with row=' + row + ' destRow=' + destRow + ' th=' + th);
    var b = this.state[row][0];
    if ((b === undefined) || (b === 0)) {
	if (th > 0) {
	    console.log('makeThrow: ERROR - throw-height must be 0 for row ' + row);
	    return;
	}
    }
    else {
	if (th === 0) {
	    console.log('makeThrow: ERROR - throw-height must be positive for row ' + row);
	    return;
	}
	b--;
	this.state[row][0] = b;
	this.incr(destRow, th);
    }
    if (this.firstColIsZero()) {
	this.nextState();
    }
};

/**
 * Determines if first column of state matrix is all zeros.
 *
 * @method firstColIsZero
 * @param state {Array} optional state; if omitted, this state is used 
 * @return {Number} 1=all zeros in first column, 0=otherwise
*/
JPRO.State.prototype.firstColIsZero = function(state) {
    var i,x;
    if (state === null) { state = this.state; }
    for (i=0; i<state.length; i++) {
	x = this.toInt(state[i][0]);
	if (x > 0) {
	    return null;
	} // if
    } // for i
    return 1;
};

/**
 * This method operates on either the current state or the supplied
 * state (a matrix, not an object) by shifting all rows of the
 * state matrix by one, discarding props shifted out. The illustration
 * would be proceeding ahead in time one beat with no throws. Balls
 * arriving at their destination hand are removed from the state
 * matrix. However, in current use this does not happen because it
 * is only called when there are no props in the first column of the
 * state matrix.
 *
 * @method nextState
 * @param state {Array} optional supplied state
*/
JPRO.State.prototype.nextState = function(state) {
    var i,x;
    if (state === null) { state = this.state; }
    for (i=0; i<state.length; i++) {
	x = state[i].shift();
    } // for i
};

/**
 * This method determines if this state equals another state.
 *
 * @method equals
 * @param s {State} the other state to be compared
 * @return {Number} 1=equal, 0=unequal
*/
JPRO.State.prototype.equals = function(s) {
    var i,j;
    var s1 = this.state;
    var s2 = s.state;
    if (s1.length !== s2.length) {
	console.log('rows not equal:' + s1.length + ' !== ' + s2.length);
	return 0;
    }
    for (i=0; i<s1.length; i++) {
	if (s1[i].length !== s2[i].length) {
	    console.log('cols not equal:' + s1[i].length + ' !== ' + s2[i].length + ' for row ' + i);
	    return 0;
	}
	for (j=0; j<s1[i].length; j++) {
	    if (s1[i][j] === undefined) { s1[i][j] = 0; }
	    if (s2[i][j] === undefined) { s2[i][j] = 0; }
	    if (s1[i][j] !== s2[i][j]) {
		return 0;
	    }
	} // for j
    } // for i
    return 1;
};

/**
 * Determines the minimum sequence of throws required to
 * transition from this state to target state, ts.
 * 
 * @method getTransition
 * @param tso {State} the target state
 * @return {ThrowSeq} the required minimum throw sequence
*/
JPRO.State.prototype.getTransition = function(tso) {
    var transSeq = [];
    var cs = this.copy().state;
    var ts = tso.state;
    var i,csi,tsi;
    for (i=0; i<cs.length; i++) {
	transSeq.push([]);
    }
    // If no balls to throw, we have no other option
    // but to wait for balls to drop into hands. This
    // is represented by 0 throw-heights.
    while (this.firstColIsZero(cs)) {
	this.nextState(cs);
	// push zeros on trans seq
	for (i=0; i<cs.length; i++) {
	    transSeq[i].push([[i,0]]);
	} // for i
    } // while
    //cs = this.state;
    console.log('0 transSeq = ' + this.mhnToString(transSeq));
    // Compare state heights
    var csh = this.getHeight();
    var tsh = tso.getHeight();
    var tlen = csh - tsh; // transition seq length
    if (tlen < 0) {
	tlen = 1;
    }
    console.log('csh=' + csh + ' tsh=' + tsh + ' tlen=' + tlen);
    // Find number of beats (tlen) from current state for which
    // target state is reachable
    csi = csh - 1; // max index of a prop in current state
    tsi = csi - tlen;
    while ((tlen <= csi) && this.unreachable(cs, csi, ts, tsi)) {
	tlen++;
	tsi = csi - tlen;
    } // while
    console.log('tlen=' + tlen);
    // push transition seq throws
    transSeq = this.pushTransThrows(transSeq, cs, ts, tlen);
    console.log('1 transSeq = ' + this.mhnToString(transSeq));
    return new JPRO.ThrowSeq(transSeq);
};
    
/**
 * This method helps to determine if target state is reachable without
 * having to go through the ground state. This method only checks
 * reachability given the specified correlation between current and
 * target states.
 *
 * @method unreachable
 * @param cs {Array} current state
 * @param csi {Number} high index to current state
 * @param ts {Array} target state
 * @param tsi {Number} high index to target state correlated with csi
 * @return {Number} 1=unreachable, 0=reachable
*/
JPRO.State.prototype.unreachable = function(cs, csi, ts, tsi) {
    var i,j,cx,tx;
    var csiTmp = csi;
    for (j=tsi; j>=0; j--) {
	for (i=0; i<ts.length; i++) {
	    cx = this.toInt(cs[i][csiTmp]);
	    tx = this.toInt(ts[i][j]);
	    if (cx > tx) {
		return 1;
	    }
	} // for i
	csiTmp--;
    } // for j
    console.log('target state is reachable without having to go through ground state');
    return 0;
};

/**
 * Converts undefined to 0 (in state matrix)
 * 
 * @method toInt
 * @param x {Number}
 * @return {Number} 0 if x===undefined, otherwise returns x
*/
JPRO.State.prototype.toInt = function(x) {
    if (x === undefined) {
	return 0;
    }
    else {
	return x;
    }
};

/**
 * Calculates throws necessary to build target state from
 * this state and pushes them to transSeq.
 *
 * @method pushTransThrows
 * @param transSeq {Array} current MHN matrix to be extended
 * @return {Array} extended transition sequence (MHN matrix)
*/
JPRO.State.prototype.pushTransThrows = function(transSeq, cs, ts, tlen) {
    var i,j,k;
    var x,ii,jj,throwIJ;
    var transSeqTmp = [];
    if (tlen === 0) {
	return transSeq;
    }
    for (i=0; i<cs.length; i++) {
	transSeqTmp.push([]);
    }
    
    // fill the gaps prior to building the target state
    for (j=1; j<tlen; j++) {
	for (i=0; i<cs.length; i++) {
	    if (this.toInt(cs[i][j]) === 0) {
		for (k=0; k<j; k++) {
		    if (this.toInt(cs[i][k]) > 0) {
			cs[i][k]--;
			cs[i][j] = 1;
			if (transSeqTmp[i][k] === undefined) {
			    transSeqTmp[i][k] = [[i, j-k]];
			}
			else {
			    transSeqTmp[i][k].push([i, j-k]);
			}
			break;
		    } // if
		} // for k
	    } // if
	} // for i
    } // for j
    console.log('0 transSeqTmp = ' + this.mhnToString(transSeqTmp));

    // build target state
    for (j=0; j<ts[0].length; j++) {
	for (i=0; i<ts.length; i++) {
	    k = j + tlen;
	    cs[i][k] = this.toInt(cs[i][k]);
	    x = this.toInt(ts[i][j]) - cs[i][k];
	    while (x > 0) {
		throwIJ = this.findThrow(cs, tlen);
		ii = throwIJ[0];
		jj = throwIJ[1];
		cs[ii][jj] = this.toInt(cs[ii][jj]) - 1;
		cs[i][k]++;
		console.log('From ii=' + ii + ' jj=' + jj);
		console.log('  To  i=' + i + '  k=' + k);
		if (transSeqTmp[ii][jj] === undefined) {
		    transSeqTmp[ii][jj] = [[i, k-jj]];
		}
		else {
		    transSeqTmp[ii][jj].push([i, k-jj]);
		}
		x--;
	    } // while
	} // for i
    } // for j
    console.log('1 transSeqTmp = ' + this.mhnToString(transSeqTmp));

    // append transSeqTmp to transSeq
    for (i=0; i<transSeq.length; i++) {
	transSeq[i] = transSeq[i].concat(transSeqTmp[i]);
    } // for i
    
    return transSeq;
};

/**
 * Find first prop being caught to throw 
 *
 * @method findThrow
 * @param cs {State} current state
 * @param tlen {Number} number of beats in transition
*/
JPRO.State.prototype.findThrow = function(cs, tlen) {
    var i,j;
    for (j=0; j<tlen; j++) {
	for (i=0; i<cs.length; i++) {
	    if (cs[i][j] > 0) {
		return [i, j];
	    }
	} // for i
    } // for j
    // This is an error!
    console.log('findThrow: ERROR - No balls left in cs to throw');
    return;
};
    
/**
 * Gets the height of this state
 *
 * @method getHeight
 * @return {Number} maximum state array length
*/
JPRO.State.prototype.getHeight = function() {
    var i,x,rv;
    var s = this.state;
    rv = 0;
    for (i=0; i<s.length; i++) {
	x = s[i].length;
	if (x > rv) { rv = x; }
    } // for i
    return rv;
};

/**
 * Gets the maximum throw-height of MHN matrix
 *
 * @method getMaxThrowHeight
 * @param mhn {Array} MHN matrix
 * @return {Number} maximum throw-height
*/
JPRO.State.prototype.getMaxThrowHeight = function(mhn) {
    var i,j,k,throwHeight;
    var maxTh = 0;
    for (i=0; i<mhn.length; i++) {
	for (j=0; j<mhn[i].length; j++) {
	    for (k=0; k<mhn[i][j].length; k++) {
		throwHeight = mhn[i][j][k][1];
		if (throwHeight > maxTh) {
		    maxTh = throwHeight;
		} // if
		} // for k
	} // for j
    } // for i
    return maxTh;
};

/**
 * Converts State to string
 *
 * @method toString
 * @return {String}
*/
JPRO.State.prototype.toString = function() {
    var i,j,x;
    var rv = '[';
    for (i=0; i<this.state.length; i++) {
	if (i > 0) {
	    rv = rv + ',<br>\n';
	}
	rv = rv + '[';
	for (j=0; j<this.state[i].length; j++) {
	    if (j > 0) {
		rv = rv + ', ';
	    }
	    x = this.state[i][j];
	    x = (x === undefined) ? '0' : x;
	    rv = rv + x;
	} // for j
	rv = rv + ']';
    } // for i
    rv = rv + ']';
    return rv;
};

/**
 * Converts MHN matrix to string
 *
 * @method mhnToString
 * @param mhn
 * @return {String}
*/
JPRO.State.prototype.mhnToString = function(mhn) {
    var i, j, k, rv;
    rv = '[';
    for (i=0; i<mhn.length; i++) {
	if (i > 0) {
	    rv = rv + ', ';
	}
	rv = rv + '[';
	for (j=0; j<mhn[i].length; j++) {
	    if (j > 0) {
		rv = rv + ', ';
	    }
	    rv = rv + '[';
	    for (k=0; k<mhn[i][j].length; k++) {
		if (k > 0) {
		    rv = rv + ', ';
		}
		rv = rv.concat('[');
		rv = rv.concat(mhn[i][j][k][0]);
		rv = rv.concat(',');
		rv = rv.concat(mhn[i][j][k][1]);
		rv = rv.concat(']');
	    }
	    rv = rv + ']';
	}
	rv = rv + ']';
    }
    rv = rv + ']';
    return rv;
};

/**
 * Returns copy of this state
 * 
 *
 * @method copy
 * @return {State} copy of this state
*/
JPRO.State.prototype.copy = function() {
    var i;
    var rv = new JPRO.State(this.mhn, this.props);
    rv.state = [];
    for (i=0; i<this.state.length; i++) {
	rv.state[i] = this.state[i].slice(0); // copies array
    } // for i
    return rv;
};

})();

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
(function () {

'use strict';

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
    this.pos = pos || new JPRO.Vec(); // xyz position

    /**
     * Velocity
     *
     * @property vel
     * @type Vec
     * @default (0,0,0)
     */
    this.vel = new JPRO.Vec(); // velocity

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
    if (this.inPlay === null) { return this; }
    if (this.inHand) {
	this.pos.setV(this.inHand.pos);
    }
    else {
	this.pos.acc(this.vel.acc(this.view.g)); // v=v+g; x=x+v
    }
    this.posProjected = this.view.project(this.pos); // x,y, and depth
    if ((updateTimer1 === 0) && (this.timer > 0)) {
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
 * @param origDestHand {Hand} the original destination hand
 * @param destHand {Hand} copy of the original destination hand
 * @param destBeatRel {Number} destination beat relative to current beat (aka throw-height)
 * @return {Prop} this
*/
    JPRO.Prop.prototype.throw2Hand = function(td) {
	this.destHand = td.destHand;
	this.timer = td.timer;
	this.vel.setV(td.vel);
	this.inHand = null; // release prop
	return this;
    };

 /*JPRO.Prop.prototype.throw2Hand = function(origDestHand, destHand, destBeatRel, dwell) {
    // Calculate throw time
    //var beat = this.viewer.beat;
    //var destBeat = (destHand.movementBeat + destBeatRel) % destHand.movementPeriod;
    //var dwell = destHand.getDwell(destBeat); // todo - change to get_dwell(dest_beat_rel)??
    // TODO - use clock method to find time to destBeatRel
    //var time = destBeatRel * this.viewer.clock.beatPeriod - dwell;
    var time = this.viewer.clock.timeBetweenBeats(0, destBeatRel);
    var flightTime = time - dwell;
    //var time = this.viewer.beatScheduler.timeBetweenBeats(beat, beat + destBeatRel) - dwell;
    var minTime = this.viewer.minThrowTime;
    if (flightTime < minTime) flightTime = minTime;

    var mBeat = destHand.movementBeat + destBeatRel - 1;
    var dwellRatio = destHand.getDwellRatio();
    // Calculate dest hand position
    // TODO - use clock method to calculate this
    //var timeAbs = (time + destHand.movementBeat*this.viewer.clock.beatPeriod) %
    //	(destHand.movementPeriod * this.viewer.clock.beatPeriod);
//    var destBeat1 = (destHand.movementBeat + destHand.movementPeriod + destBeatRel - 1) % destHand.movementPeriod;
//    var timeAbs = destBeat1 + 1 - dwell
    this.destHand = origDestHand;
    console.log('JPRO.Prop.throw2Hand: throw prop to ' + origDestHand.name + ' in time ' + flightTime);
    //var pa = destHand.fpos(timeAbs, this.viewer.beatPeriod); // position array
    //console.log('dwell ratio = ' + dwellRatio);
    var pa = destHand.hFunc.getPos(dwellRatio, mBeat); // position array
    //console.log('cp1');
    var pos = this.view.transform(pa[0]);
    console.log('JPRO.Prop.throw2Hand: pos = ' + pos.toString());
    return this.throw2Pos(pos, flightTime);
};
 */

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
    if (updateHandN1 === 0) hand.catchProp(this, 1);
    this.pos.setV(hand.pos); // the ball should land in this hand
    return this;
};

})();

/**
 * @author Ed Carstens
 */

/**
 * A Ball extends Prop, having a list of sprites associated
 * with it for drawing the ball in the animation.
 *
 * @class Ball
 * @extends Prop
 * @constructor
 * @param viewer {Viewer} the viewer object
 * @param pos {Vec} optional initial position
 * @param color {Number} 24-bit RGB color
 * @param radius {Number} radius of ball in pixels
 *
 */

(function () {
'use strict';

JPRO.Ball = function(viewer, pos, color, radius) {
    // Call superclass
    JPRO.Prop.call(this, viewer, pos || new JPRO.Vec());

    /**
     * Radius of ball in pixels
     *
     * @property radius
     * @type Number
     */
    this.radius = radius || 40;

    /**
     * Color of ball in 24-bit RGB format
     *
     * @property color
     * @type Number
     */
    this.color = color || 0xffffff;

    /**
     * Pointer to graphics PIXI object
     *
     * @property grfx
     * @type PIXI.Graphics
     */
    this.grfx = this.viewer.grfx;

    /**
     * Last depth index. As the ball position moves toward or
     * away from the viewer, its size or depth index changes.
     * This is used to keep track of the previous setting, so
     * that only a change in ball size results in swapping
     * sprites.
     *
     * @property lastDidx
     * @type Number
     */
    this.lastDidx = -1;
    
    function _drawme(grfx, r, c) {
	var rv = []; // return array of sprites
	var rvSize = 20;
	var s, i, center, sx, sy, rd, depth;
	// Light hits ball from top left
	var light = [0.75, 0.65, 0.55, 0.35, 0.20, 0.13, 0.08, 0.03, 0.02]; // intensity of spotlight
	var radf =  [0.09, 0.11, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45]; // alpha
	for (depth=0; depth<rvSize; depth++) {
	    rd = r - depth; //Math.round(r * 6/(depth+1));
	    center = rd+1;
	    sx = Math.round(center - rd*0.3);
	    sy = Math.round(center - rd*0.3);
	    //sx = Math.round(center);
	    //sy = Math.round(center);
	    grfx.clear();
	    grfx.beginFill(c);
	    grfx.drawCircle(center, center, rd);
	    grfx.endFill();
	    for (i=8; i>=0; i--) {
		grfx.beginFill(c);
		grfx.drawCircle(sx, sy, rd*radf[i]);
		grfx.endFill();
		grfx.beginFill(0xffffff, light[i]);
		grfx.drawCircle(sx, sy, rd*radf[i]);
		grfx.endFill();
	    } // end for
	    s = new JPRO.Sprite3D(grfx.generateTexture());
	    //s.depth_idx = depth;
	    s.anchor.x = 0;
	    s.anchor.y = 0;
	    rv.push(s);
	} // end for
	return rv;
    }
    
    /**
     * Array of sprite PIXI objects stores different sizes of
     * this ball as the actual size is scaled based on depth when
     * projected to 2D view screen. This method might be replaced
     * by the PIXI scaling function as long as it doesn't affect
     * quality and speed.
     *
     * @property mySprites
     * @type Array
     */
    this.mySprites = _drawme(this.grfx, this.radius, this.color);

};

JPRO.Ball.prototype = Object.create( JPRO.Prop.prototype );
JPRO.Ball.prototype.constructor = JPRO.Ball;

/**
 * This updates the position of the ball
 *
 * @method update
 * @return {Ball} this
*/
JPRO.Ball.prototype.update = function() {
    var x,y,scaledRadius,didx,spriteOfs;
    if (this.inPlay === null) {
	if (this.lastDidx >= 0) {
	    this.viewer.stage.removeChild(this.mySprites[this.lastDidx]);
	    //console.log('removed sprite from stage gracefully');
	}
	this.lastDidx = -1;
	return this;
    }
    this.updatePos();
    x = this.posProjected.getX();
    y = this.posProjected.getY();
    scaledRadius = this.posProjected.getZ() * this.radius;
    didx = Math.round(this.radius - scaledRadius);
    if (didx > 19) didx = 19;
    this.mySprites[didx].depth = this.posProjected.getZ();

    // use depth to show different size ball
    spriteOfs = this.radius + 1 - didx;
    this.mySprites[didx].position.x = x - spriteOfs;
    this.mySprites[didx].position.y = y - spriteOfs;
    // remove last sprite and add new sprite if depth changed
    if (didx !== this.lastDidx) {
	if (this.lastDidx >= 0)
	    this.viewer.stage.removeChild(this.mySprites[this.lastDidx]);
	if (didx >= 0) {
	    this.mySprites[didx].add2Stage(this.viewer.stage);
	    //console.log('added sprite to stage');
	}
	this.lastDidx = didx;
    }
    return this;
};

/**
 * This removes the ball sprite from the viewer stage.
 *
 * @method removeMe
 * @return Nothing returned.
*/
JPRO.Ball.prototype.removeMe = function() {
    if (this.lastDidx >= 0) {
	this.viewer.stage.removeChild(this.mySprites[this.lastDidx]);
    }
};

})();

/**
 * @author Ed Carstens
 */

/**
 * Sprite3D extends PIXI.Sprite so that the 3D
 * depth defines the order of drawing the sprites
 * on the stage
 *
 * @class Sprite3D
 * @extends PIXI.Sprite
 * @constructor
 * @param texture {PIXI.Texture} the texture object
 */

(function () {
    'use strict';

    JPRO.Sprite3D = function(texture) {
	PIXI.Sprite.call( this, texture ); // call superclass
    
    /**
     * The depth of the sprite (into the screen)
     *
     * @property depth
     * @type Number
     */
	this.depth = 0;
    };
    
    JPRO.Sprite3D.prototype = Object.create( PIXI.Sprite.prototype );
    JPRO.Sprite3D.prototype.constructor = JPRO.Sprite3D;
    

/**
 * Inserts this 3D sprite to stage children list at the
 * index based on its depth so that sprite closest to viewer
 * is drawn last and the sprite furthest from viewer is
 * drawn first.
 *
 * @method add2Stage
 * @param stage {PIXI.Stage} the stage
 */
    JPRO.Sprite3D.prototype.add2Stage = function(stage) {
	stage.addChildAt(this, this.add2StageGetIdx(stage));
    };

/**
 * Returns index to children list in the stage based on
 * value of depth of this 3D sprite.
 *
 * @method add2StageGetIdx
 * @param stage {PIXI.Stage} the stage
 * @return {Number} index to children list in the stage
 */
    JPRO.Sprite3D.prototype.add2StageGetIdx = function(stage) {
	var sz = stage.children.length;
	var depth = this.depth;
	var i = 0;
	while (i < sz) {
	    if (depth < stage.children[i].depth) {
		return i;
	    }
	    i++;
	} // while
	return sz;
    };

/**
 *
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @method fromImage
 * @static
 * @param imageId {String} The image url of the texture
 * @return {Sprite3D} A new Sprite using a texture from the texture cache matching the image id
 */
    JPRO.Sprite3D.fromImage = function(imageId, crossorigin, scaleMode)
    {
	var texture = PIXI.Texture.fromImage(imageId, crossorigin, scaleMode);
	return new JPRO.Sprite3D(texture);
    };

})();

/**
 * @author Ed Carstens
 */

/**
 * Clock is used to provide a rhythm or even a
 * composition of different rhythms. By default
 * the rhythm is simply a constant beat.
 * All beat periods are some integral multiple of basePeriod.
 * By default the basePeriod is 20.
 *
 * @class Clock
 * @constructor
 * @param basePeriod {Number} the juggling base period
 * @param rhythm {Rhythm} the rhythm of beats
 * @param name {String} name of this Clock
 * @param beatPeriod {Number} current beat's period
 */
JPRO.ID.Clock = 0;
JPRO.Clock = function(basePeriod, rhythm, name, beatPeriod) {

    // Call superclass
    this.className = this.className || 'Clock';
    JPRO.Base.call(this, name);

    /**
     * Base period
     * The base period is a small time interval which is
     * multiplied by rhythm sequence numbers to calculate
     * the beat periods (duration of each beat).
     *
     * @property basePeriod
     * @type Number
     */
    this.basePeriod = basePeriod || 20;

    /**
     * Top rhythm
     * The top rhythm prescribes the entire sequence
     * of rhythms for the entire juggling routine.
     * The top rhythm is often a sequence of
     * repeated rhythms, but it could just be a
     * simple repeating rhythm. 
     *
     * @property rhythm
     * @type Rhythm
     */
    this.rhythm = rhythm || new JPRO.Rhythm();

    /**
     * Time counter within a beat
     *
     * @property t
     * @type Number
     */
    this.t = 0;
    // total time

    /**
     * Time to current beat
     * This is the time to the current beat relative to
     * the start of animation. The current time or total
     * time since the start of animation is (tt + t).
     *
     * @property tt
     * @type Number
     */
    this.tt = 0;

    /**
     * Upper bound on time counter, tt
     * If and when tt ever exceeds maxTime, it will
     * be adjusted down by maxTime and all timestamps
     * will also be adjusted down by the same.
     *
     * @property maxTime
     * @type Number
     */
    this.maxTime = 30000;

    /**
     * Timestamps hash
     *
     * @property timeStamps
     * @type Object
     */
    this.timeStamps = {}; // hash

    /**
     * 
     *
     * @property 
     * @type 
     */
    // Get current beat period (and move forward a beat)
    if (beatPeriod === undefined) {
	this.beatPeriod = this.rhythm.nextBeat()*this.basePeriod;
    }
    else {
	this.beatPeriod = beatPeriod;
    }

};

JPRO.Clock.prototype = Object.create(JPRO.Base.prototype);
JPRO.Clock.prototype.constructor = JPRO.Clock;

/**
 * Copy
 *
 * @method copy
 * @param objHash {Object} tracks all copied objects
 * @param cFunc {Function} constructor function
 * @return {Clock} copied Clock
 */
JPRO.Clock.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    pFuncs.timeStamps = JPRO.Common.copyHash;
    cFunc = cFunc || function() {
	return new JPRO.Clock(null, 1, null, 1);
    };
    return this.copyOnce(objHash, cFunc, {}, pFuncs);
};

/**
 * This method should be called once for each frame
 * of the animation (typically 30 frames/second).
 * When it returns 1, props should be thrown (soon);
 * otherwise, props are either in flight or being
 * held by hands.
 *
 * @method update
 * @return {Number} 1 when there is a new beat, otherwise null
*/
JPRO.Clock.prototype.update = function() {
    if (this.t >= this.beatPeriod-1) {
	this.t = 0;
	this.tt += this.beatPeriod; // used for total time method
	//console.log('tt=' + this.tt);
	if (this.tt >= this.maxTime) {  // total time rollover!
	    //alert('Time Rollover!');
	    this.tt -= this.maxTime;
	    this.adjustTimeStamps(this.maxTime);
	}
	this.beatPeriod = this.rhythm.nextBeat()*this.basePeriod;
	console.log('beatPeriod = ' + this.beatPeriod);
	return 1; // new beat
    }
    else {
	this.t++; // increment time (once per animation frame)
	//console.log('t=' + this.t + ' beatPeriod=' + this.beatPeriod);
	return null;
    }
};

/**
 * @method totalTime
 * @return {Number} total time since starting this clock
*/
JPRO.Clock.prototype.totalTime = function() {
    return this.tt + this.t;
};

/**
 * @method adjustTimeStamps
 * @param t {Number} time to be subtracted from all timestamps
*/
JPRO.Clock.prototype.adjustTimeStamps = function(t) {
    var ts;
    for (ts in this.timeStamps) {
	this.timeStamps[ts] -= t;
    }
};

/**
 * @method timeStamp
 * @param name {String}
 * @return {Number} 
*/
JPRO.Clock.prototype.timeStamp = function(name) {
    this.timeStamps[name] = this.totalTime();
    return this.timeStamps[name];
};

/**
 * @method getTimeStamp
 * @param name
 * @return {Number} 
*/
JPRO.Clock.prototype.getTimeStamp = function(name) {
    if (this.timeStamps[name] === undefined) {
	//console.log('name='+name+' ts undefined');
	return 0;
    }
    else {
	return this.timeStamps[name];
    }
};

/**
 * @method duration
 * @param name
 * @return {Number} 
*/
JPRO.Clock.prototype.duration = function(name) {
    if (this.timeStamps[name] === undefined) {
	//console.log('name='+name+' ts undefined');
	return 0;
    }
    else {
	return this.totalTime() - this.timeStamps[name];
    }
};

/**
 * @method deleteTimeStamp
 * @param name
 * @return {Number} 
*/
JPRO.Clock.prototype.deleteTimeStamp = function(name) {
    delete this.timeStamps[name];
};

/**
 * @author Ed Carstens
 */

/**
 * Rhythm implements percussive rhythms with a list
 * of numbers and/or other rhythm objects. A number in
 * this list represents a time delay, usually a
 * positive integer.
 *
 * @class Rhythm
 * @constructor
 * @param rhythms {Array} array of Rhythms or delays
 * @param iters {Number} iterations of this rhythm
 * @param idx {Number} index into rhythms
 * @param iter {Number} iteration number
 * @param name {String} name of this Rhythm
 *
 */
JPRO.ID.Rhythm = 0;
JPRO.Rhythm = function(rhythms, iters, idx, iter, name) {

    // Call superclass
    this.className = this.className || 'Rhythm';
    JPRO.Base.call(this, name);

    /**
     * Array of Rhythms objects or numbers
     * The numbers, commonly positive integers,
     * represent delays. The actual delay is
     * calculated externally by multiplying by
     * a base period. Hence 1 will be a delay of
     * precisely one base period. For example,
     * suppose a musical composition has quarter
     * notes, eighth notes, and a few sixteenth
     * notes, but nothing shorter. Then 1 should
     * correspond to the duration of the sixteenth
     * note. An eighth note would be 2, and a
     * quarter note would be 4.
     *
     * @property rhythms
     * @type Array
     */
    this.rhythms = rhythms || [1];

    /**
     * Iterations of the sequence
     * This rhythm may or may not be repeated any
     * number of times. For example, if it is to
     * be repeated once, set iters=2.
     *
     * @property iters
     * @type Number
     */
    this.iters = (iters === undefined) ? -1 : iters;

    /**
     * Index into rhythms array
     *
     * @property idx
     * @type Number
     */
    this.idx = idx || 0;

    /**
     * Iteration
     *
     * @property iter
     * @type Number
     */
    this.iter = iter || 0;
};

JPRO.Rhythm.prototype = Object.create(JPRO.Base.prototype);
JPRO.Rhythm.prototype.constructor = JPRO.Rhythm;

/**
 * Copy
 *
 * @method copy
 * @param objHash {Object} tracks all copied objects
 * @param cFunc {Function} constructor function
 * @return {Rhythm} copied Rhythm
 */
JPRO.Rhythm.prototype.copy = function (objHash, cFunc) {
    var i,x,typ,rhythms;
    rhythms = [];
    var skip = {};
    skip.rhythms = 1;
    var rv = this.copyOnce(objHash, cFunc, skip);
    for (i in this.rhythms) {
	x = this.rhythms[i];
	typ = typeof x;
	if (typ === 'object') {
	    rhythms.push(x.copy(objHash));
	}
	else if (typ === 'number') {
	    rhythms.push(x);
	}
	else {
	    throw 'Array element neither a number nor an object';
	}
    }
    rv.rhythms = rhythms;
    return rv;
};

/**
 * Steps to the next beat in the rhythm
 *
 * @method nextBeat
 * @param depth {Number} tracks number of recursions 
 * @return {Number} N, where delay=N*basePeriod, and
 *                  basePeriod is defined externally.
 */
JPRO.Rhythm.prototype.nextBeat = function(depth) {
    depth = depth || 0;
    if (depth > 99) {
	throw 'Exceeded recursive limit of 99';
    }
    var rv = null;
    if ((this.iters >= 0) && (this.iter >= this.iters)) {
	this.iter = 0;
	return null; // done
    }
    var x = this.rhythms[this.idx];
    var typ = typeof x;
    if (typ === 'number') {
	this.nextIdx();
	return x;
    }
    else if (typ === 'object') {
	rv = x.nextBeat(depth+1);
	if (rv) {
	    return rv;
	}
	return this.nextIdx().nextBeat(depth+1);
    }
    else {
	throw 'Array element neither a number nor an object';
    }
};

/**
 * Steps to the next index into rhythms array
 *
 * @method nextIdx
 * @return {Rhythm} this 
 */
JPRO.Rhythm.prototype.nextIdx = function () {
    if (this.idx >= this.rhythms.length-1) {
	this.idx = 0;
	if (this.iters >= 0) {
	    this.iter++;
	}
    }
    else {
	this.idx++;
    }
    return this;
};

/**
 * Converts this Rhythm to a string
 *
 * @method toString
 * @return {String} this Rhythm converted to a string 
 */
JPRO.Rhythm.prototype.toString = function () {
    var i, x, typ, rv;
    rv = '{';
    //console.log(this.rhythms);
    for (i in this.rhythms) {
	x = this.rhythms[i];
	//console.log(x);
	typ = typeof x;
	//console.log(typ);
	if (typ === 'number') {
	    rv = rv + x + ',';
	}
	else if (typ === 'object') {
	    rv = rv + '{' + x.toString() + '},';
	}
	else {
	    throw 'Array element neither a number nor an object';
	}
    }
    rv = rv.slice(0,rv.length-1);
    rv = rv + '}x' + this.iters;
    return rv;
};

/**
 * @author Ed Carstens
 */

/**
 * Configuration for JugglePro Viewer
 *
 * @class Config
 * @constructor
 *
 */

JPRO.ID.Config = 0;
JPRO.Config = function(name) {
    // Call superclass
    this.className = this.className || 'Config';
    JPRO.Base.call(this, name);
};

JPRO.Config.prototype = Object.create(JPRO.Base.prototype);
JPRO.Config.prototype.constructor = JPRO.Config;

JPRO.Config.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    pFuncs.jugglers = JPRO.Common.copyObjVector;
    var scalars = [
	'dwellRatio', 'basePeriod',
	'minThrowTime', 'viewWidth', 'viewHeight', 'view',
	'viewAngle', 'zoomDistance', 'zoomIn', 'zoomOut'
    ];
    var objects = [
	'clock', 'gravity', 'view', 'aerialTurn', 'routine',
	'pattern'
    ];
    return this.directedCopy(objHash, cFunc, pFuncs, scalars, objects);
};

JPRO.Config.prototype.setDefaults = function() {
    /**
     * Pixi stage (background) color
     *
     * @property stageColor
     * @type {Color}
     */
    if (this.stageColor === undefined) { this.stageColor = 0x000000; }

    /**
     * Pixi stage
     *
     * @property stage
     * @type {PIXI.Stage}
     */
    // create a new instance of a pixi stage
    if (this.stage === undefined) {
	this.stage = new PIXI.Stage(this.stageColor);
    }

    /**
     * Graphics
     *
     * @property grfx
     * @type {PIXI.Graphics} 
     */
    if (this.grfx === undefined) {
	this.grfx = new PIXI.Graphics();
	this.grfx.setStageReference(this.stage);
	this.stage.addChild(this.grfx);
    }
    
    /**
     * Dwell ratio
     *
     * @property dwellRatio
     * @type {Number}
     */
    if (this.dwellRatio === undefined) { this.dwellRatio = 0.5; }

    /**
     * Base period for beat scheduler
     *
     * @property basePeriod
     * @type {Number}
     */
    if (this.basePeriod === undefined) { this.basePeriod = 40; }

    /**
     * Clock provides timing of throws
     *
     * @property clock
     * @type {Clock}
     */
    if (this.clock === undefined) {
	this.clock = new JPRO.Clock(this.basePeriod);
    }
    else {
	this.basePeriod = this.clock.basePeriod;
    }
    this.minThrowTime = (this.clock.basePeriod >> 1) + 1; // 1/2 smallest beat period

    /**
     * Acceleration of gravity vector
     *
     * @property gravity
     * @type {Vec}
     */
    if (this.gravity === undefined) { this.gravity = new JPRO.Vec(0,0,-8); }

    /**
     * GUI (graphical user interface)
     *
     * @property gui
     * @type {Gui}
     */
    if (this.gui === undefined) { this.gui = new JPRO.Gui(this); }

    /**
     * View window width
     *
     * @property viewWidth
     * @type {Number}
     */
    if (this.viewWidth === undefined) { this.viewWidth = 800; }
    
    /**
     * View window height
     *
     * @property viewHeight
     * @type {Number}
     */
    if (this.viewHeight === undefined) { this.viewHeight = 600; }
    
    /**
     * View window
     *
     * @property view
     * @type {View}
     */
    if (this.view === undefined) { this.view = new JPRO.View(this); }

    if (this.viewAngle === undefined) { this.viewAngle = 0; }

    if (this.zoomDistance === undefined) { this.zoomDistance = 4500; }
    
    if (this.jugglers === undefined) {
	this.jugglers = [new JPRO.Juggler(this)];
    }

    /**
     * Juggling routine
     *
     * @property routine
     * @type {Routine}
     */
    if (this.routine === undefined) {
	var rhMap = new JPRO.RowHandMapper(null,
					   [[this.jugglers[0].hands[0], this.jugglers[0].hands[1]]]);
	//console.log('rhMap=' + rhMap);
	//console.log('rhMap.tpm=' + rhMap.tpm[0][0]);
	//console.log('rhMap.entryTpm=' + rhMap.entryTpm[0][1]);
	var pat = new JPRO.Pattern([[ [[0,3]] ]], rhMap, 1, 'pat');
	this.routine = new JPRO.Routine([pat], -1, 'topRoutine');
    }

};

/**
 * @author Ed Carstens
 */

/**
 * ThrowData is a class for storing precalculated data for future throws.
 *
 * @class ThrowData
 * @constructor
 *
 */

JPRO.ThrowData = function(pos, destRow, th) {
    this.pos = pos;
    this.destHand = null;
    this.destRow = destRow;
    this.throwHeight = th;
    this.vel = new JPRO.Vec();
    this.timer = 0;
    this.catchTime = 0;
};

JPRO.ThrowData.prototype.constructor = JPRO.ThrowData;

/**
 * 
 *
 * @method 
 * @param  {} 
 * @return {} 
 */
JPRO.ThrowData.prototype.nextBeat = function() {
    if (this.throwHeight >= 0) {
	this.throwHeight--;
    }
    return this.throwHeight;
};

/**
 * 
 *
 * @method 
 * @param  {} 
 * @return {} 
 */
JPRO.ThrowData.prototype.setVel = function(dest, g) {
    var time = this.timer;
    var p = this.pos;
    var rx = (dest.x-p.x)/time - time*g.x/2;
    var ry = (dest.y-p.y)/time - time*g.y/2;
    var rz = (dest.z-p.z)/time - time*g.z/2;
    this.vel.set(rx,ry,rz);
};

/**
 * @author Ed Carstens
 */

/**
 * LookAhead is a class which calculates future throws.
 *
 * @class LookAhead
 * @constructor
 *
 */

JPRO.LookAhead = function(viewer) {
    
    /**
     * Pointer to viewer
     *
     * @property viewer
     * @type Viewer
     */
    this.viewer = viewer; // original viewer
    this.tdm = [];
    this.tbt = [];
    // First copy of viewer
    // Work with a copy of viewer so as not to
    // corrupt the original viewer. An object hash
    // keeps track of references to existing objects,
    // so that there is only one copy per object.
    this.objHash1 = {};
    this.v1 = viewer.copy(this.objHash1);
};

JPRO.LookAhead.prototype.constructor = JPRO.LookAhead;

/**
 * @method preCalculate
 */
JPRO.LookAhead.prototype.preCalculate = function() {
    var i, pairs, rowHand, k, destRow;
    var throwHeight;
    var destHand;
    //var hFuncs = {}; // hash
    var flightTime;
    var dwellRatio;
    var dwell;
    var minTime;
    var mBeat;
    var pa;
    var pos;
    var td;
    var origRowHandName;
    var timeBetweenThrows = {};
    var tbtDone = {};
    var handName;
    var x;
    
    if (this.tdm.length > 2) {
	return;
    }
    // sort all throws by throw-height times lo-to-hi
    // look-ahead to throw-1, store hFunc's for hand positions
    // look-ahead to throw, store dest hands
    // calc and store init velocities
    //
    // get beats to next throws for each hand
    //
    // Work with a copy of v1 so as not to
    // corrupt the original viewer. An object hash
    // keeps track of references to existing objects,
    // so that there is only one copy per object.

    // initialize tdm with ThrowData objs
    var p1 = this.v1.pattern;
    var newTDM = [];
    for (i=0; i<p1.rows; i++) {
	pairs = p1.mhn[i][p1.beat];
	rowHand = p1.rhMap.getHand(i);
	origRowHandName = this.objHash1[rowHand.name].name;
	this.v1.clock.timeStamp(origRowHandName);
	//	p0.tdm[i][p1.beat] = [];
	newTDM.push([]);
	for (k=0; k<pairs.length; k++) {
	    if (pairs[k][1] > 0) {
		destRow = pairs[k][0];
		throwHeight = pairs[k][1];
		// push info into tdm (throw data matrix)
		newTDM[i].push(new JPRO.ThrowData(rowHand.pos, destRow, throwHeight));
	    }
	}
    }
    this.tdm.push(newTDM);

    // Make a copy of v1 (v2); initialize tbtDone hash to all null
    this.objHash2 = {};
    var v2 = this.v1.copy(this.objHash2);
    v2.clock.timeStamp('current');
    var p2 = v2.pattern;
    for (i=0; i<v2.jugglers.length; i++) {
	for (k=0; k<v2.jugglers[i].hands.length; k++) {
	    tbtDone[v2.jugglers[i].hands[k].name] = null;
	}
    }
    for (i=0; i<p2.rows; i++) {
	rowHand = p2.rhMap.getHand(i);
	origRowHandName = this.origObj(rowHand).name;
	v2.clock.timeStamp(origRowHandName);
	//hFuncs[rowHand.name] = rowHand.hFunc.copy();
    } // for

    // increment beat, decrement ThrowData throw-heights
    // keep track of hFunc's
    var tbtFinalDone = null;
    var initVelDone = null;
    while (!tbtFinalDone || !initVelDone) {
	initVelDone = 1;
	v2.nextBeat();
	p2 = v2.pattern;
	for (i=0; i<newTDM.length; i++) {
	    for (k=0; k<newTDM[i].length; k++) {
		td = newTDM[i][k];
		throwHeight = td.nextBeat();
		if (throwHeight > 0) {
		    initVelDone = null;
		}
		else if (throwHeight === 0) {
		    // get dest hand
		    destHand = p2.rhMap.getHand(td.destRow);
		    //td.destHand = this.objHash1[this.objHash2[destHand.name].name];
		    td.destHand = this.origObj(destHand);
		    // calc flight time
		    flightTime = v2.clock.duration('current');
		    dwellRatio = destHand.dwellRatio;
		    //dwellRatio = 0.32;
		    x = v2.clock.duration(td.destHand.name);
		    
		    //alert("LA " + v2.clock.tt + ":" + v2.clock.t + " " + td.destHand.name + " duration=" + x + " ft=" + flightTime);
		    dwell = dwellRatio * x;
		    //dwell = dwellRatio * 40;
		    flightTime -= dwell;
		    minTime = v2.minThrowTime;
		    if (flightTime < minTime) flightTime = minTime;
		    td.timer = flightTime;
		    td.catchTime = v2.clock.getTimeStamp('current') + flightTime;
		}
	    } // for
	} // for
	for (i=0; i<p2.rows; i++) {
	    pairs = p2.mhn[i][p2.beat];
	    rowHand = p2.rhMap.getHand(i);
	    origRowHandName = this.origObj(rowHand).name;
	    if (! tbtDone[rowHand.name]) {
//		if (p2.isThrowing(rowHand)) {
		    timeBetweenThrows[origRowHandName] = v2.clock.duration(origRowHandName);
		    tbtDone[rowHand.name] = 1;
//		}
	    }
	    v2.clock.timeStamp(origRowHandName);
	    //hFuncs[rowHand.name] = rowHand.hFunc.copy();
	} // for

	// Determine if done with timeBetweenThrows hash
	tbtFinalDone = 1;
	for (i=0; i<v2.jugglers.length; i++) {
	    for (k=0; k<v2.jugglers[i].hands.length; k++) {
		handName = v2.jugglers[i].hands[k].name;
		if (! tbtDone[handName]) {
		    tbtFinalDone = null;
		}
	    }
	}
    } // while

    // push onto tbt FIFO
    this.tbt.push(timeBetweenThrows);

    // Final loop to determine destination hand positions and calculate
    // initial throw velocities
    this.objHash2 = {};
    v2 = this.v1.copy(this.objHash2);
    v2.clock.timeStamp('current');
    p2 = v2.pattern;
    initVelDone = null;
    while (!initVelDone) {
	initVelDone = 1;
	for (i=0; i<newTDM.length; i++) {
	    for (k=0; k<newTDM[i].length; k++) {
		td = newTDM[i][k];
		if (td.catchTime < v2.clock.tt + v2.clock.beatPeriod) {
		    // found beat in which catch occurs
		    destHand = this.objHash2[this.objHash1[td.destHand.name].name];
		    mBeat = destHand.movementBeat;
		    //mBeat = 0;
		    dwellRatio = destHand.dwellRatio;
		    console.log('EWC: mBeat=' + mBeat + ' dwellRatio=' + dwellRatio);
		    console.log('EWC: destHand=' + destHand.name + ' hFunc=' + destHand.hFunc.name);
		    console.log('EWC: tt=' + v2.clock.tt + ' i=' + i);
		    pa = destHand.hFunc.getPos(1-dwellRatio, mBeat); // position array
		    pos = v2.view.transform(pa[0]);
		    console.log('EWC: pos=' + pos.toString());

		    // calc and store initial velocity and flight time in throw data matrix
		    td.setVel(pos, v2.view.g);
		}
		else {
		    initVelDone = null;
		}
	    } // for k
	} // for i
	v2.nextBeat();
    } // while
    
    // Now move v1 to next beat
    this.v1.nextBeat();
};

JPRO.LookAhead.prototype.origObj = function(obj) {
    return this.objHash1[this.objHash2[obj.name].name];
};

JPRO.LookAhead.prototype.getTimeBetweenThrows = function() {
    return this.tbt.shift();
};

JPRO.LookAhead.prototype.getThrowDataMatrix = function() {
    return this.tdm.shift();
};

/**
 * @author Ed Carstens
 */

/**
 * A View keeps track of orientation (or rotations) of vectors in
 * a "world" of objects. 
 * @class View
 * @constructor
 * @param viewer {Viewer} the viewer object
 * @param width {Number} the width of the view screen
 * @param height {Number} the height of the view screen
 * @param scale {Number} log2 of scaling factor
 *
 */

/* jshint strict:false */
(function () {
"use strict";

JPRO.View = function(viewer) {

    /**
     * Pointer to the Viewer object
     *
     * @property viewer
     * @type Viewer
     */
    this.viewer = viewer;

    this.name = "view";
    
    /**
     * Width of view screen
     *
     * @property width
     * @type Number
     */
    this.width = viewer.width || 800;

    /**
     * Height of view screen
     *
     * @property height
     * @type Number
     */
    this.height = viewer.height || 600;

    /**
     * Origin of 3D coordinate in projection frame,
     * translates the position prior to projection
     *
     * @property origin
     * @type Vec
     */
    this.origin = new JPRO.Vec(this.width/2, 0, this.height/2);

    /**
     * World rotation
     *
     * @property rot
     * @type Matrix
     */
    this.rot = new JPRO.Matrix();

    /**
     * World translation
     *
     * @property translation
     * @type Vec
     */
    this.translation = new JPRO.Vec();
    
    /**
     * Scaling factor - coordinates are scaled up by 2^scale
     *
     * @property scale
     * @type Number
     */
    this.scale = viewer.scale || 4;

    /**
     * Gravity vector (actually acceleration of gravity)
     *
     * @property g
     * @type Vec
     */
    this.g = viewer.gravity || new JPRO.Vec(0,0,-4);
    
    /**
     * List of vectors subject to rotation only,
     * namely, accelerations and velocities
     *
     * @property worldRot
     * @type Array
     */
    this.worldRot = [this.g];

    /**
     * List of position vectors subject to both rotation and
     * translation
     *
     * @property worldPos
     * @type Array
     */
    this.worldPos = [];
    
    /**
     * Represents zoom position of observer
     *
     * @property depthOffset
     * @type Number
     */
    this.depthOffset = 400;

    /**
     * Distance from focus (eye) to 2D projection screen
     *
     * @property focalDistance
     * @type Number
     */
    this.focalDistance = 1000;
};

// constructor
JPRO.View.prototype.constructor = JPRO.View;

/**
 * Copy this view
 *
 * @method copy
 * @param objHash {Object} object hash
 * @return {View} copied View object
*/
JPRO.View.prototype.copy = function(objHash) {
    if (objHash === undefined) { objHash = {}; }
    if (objHash[this.name] !== undefined) { return objHash[this.name]; }
    var rv = new JPRO.View(this.viewer.copy(objHash));
    rv.name = this.name + "_copy";
    objHash[this.name] = rv;
    objHash[rv.name] = this;
    rv.width = this.width;
    rv.height = this.height;
    rv.origin = this.origin;
    rv.rot = this.rot.copy(objHash);
    rv.translation = this.translation.copy(objHash);
    rv.scale = this.scale;
    rv.g = this.g.copy(objHash);
    rv.worldRot = JPRO.Common.copyObjVector(this.worldRot, objHash);
    rv.worldPos = JPRO.Common.copyObjVector(this.worldPos, objHash);
    rv.depthOffset = this.depthOffset;
    rv.focalDistance = this.focalDistance;
    return rv;
};

/**
 * Transform 3D vector to this view
 *
 * @method transform
 * @param v {Vec} vector to be transformed
 * @return {Vec} result of rotation and translation
*/
JPRO.View.prototype.transform = function(v) {
    return this.rot.xVec(v).acc(this.translation);
};

/**
 * Rotate this view with rotation matrix r
 *
 * @method rotateMe
 * @param r {Matrix} rotation matrix
 * @return {View} this view
*/ 
JPRO.View.prototype.rotateMe = function(r) {
    var i;
    this.rot.xMatrix(r);
    // Rotate all vectors in world list
    for (i=0; i<this.worldRot.length; i++) {
	r.xV(this.worldRot[i]);
    }
    for (i=0; i<this.worldPos.length; i++) {
	r.xV(this.worldPos[i]);
    }
    return this;
};

/**
 * Translate this view with translation vector v
 *
 * @method translateMe
 * @param v {Vec} translation vector
*/
JPRO.View.prototype.translateMe = function(v) {
    var i;
    this.translation.acc(v);
    // Translate all vectors in world list
    for (i=0; i<this.worldPos.length; i++) {
	this.worldPos[i].acc(v);
    }
};
    
/**
 * Project 3D (transformed) position onto 2D screen
 *
 * @method project
 * @param pos {Vec} 3D position to be projected
 * @return {Vec} returns vector <x,y,dscale> - dscale is depth scale factor
*/
JPRO.View.prototype.project = function(pos) {
    var dscale =  this.depth2Dscale(this.origin.getY() + (pos.getY() >> this.scale));
    var x = this.origin.getX() + (pos.getX() >> this.scale) * dscale;
    var y = this.height - (this.origin.getZ() + (pos.getZ() >> this.scale) * dscale);
    return new JPRO.Vec(x, y, dscale);
};

/**
 * Appends vector v to the world rotation list
 *
 * @method pushRvec
 * @param v {Vec} vector to add to world rotation list
 * @return {View} this view
*/
JPRO.View.prototype.pushRvec = function(v) {
    this.worldRot.push(v);
    return this;
};

/**
 * Appends a vector v to the world position list
 *
 * @method pushPvec
 * @param v {Vec} vector to add to world position list
 * @return {View} this view
*/
JPRO.View.prototype.pushPvec = function(v) {
    this.worldPos.push(v);
    return this;
};

/**
 * Appends position and velocity of prop
 *
 * @method pushProp
 * @param p {Prop} juggling prop to add to world lists
 * @return {View} this view
*/
JPRO.View.prototype.pushProp = function(p) {
    this.pushPvec(p.pos).pushRvec(p.vel);
    return this;
};

/**
 * Depth to depth scale factor conversion function
 *
 * @method depth2Dscale
 * @param depth {Number}
 * @return {Number} depth scale factor
*/
JPRO.View.prototype.depth2Dscale = function(depth) {
    var dscale;
    var tdepth = depth + this.depthOffset; // translate
    if (tdepth < 0) tdepth = 0;
    dscale = this.focalDistance/(this.focalDistance + tdepth);
    return dscale;
};

}());

/**
 * @author Ed Carstens
 */

/**
 * Viewer is the juggling pattern viewer
 *
 * @class Viewer
 * @constructor
 *
 */
/* global $:true */
JPRO.ID.Viewer = 0;
JPRO.Viewer = function(name) {
    // Call superclass
    this.className = this.className || 'Viewer';
    JPRO.Config.call(this, name);
    this.initVars();

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.testVar = 0; // for experimentation
};

JPRO.Viewer.prototype = Object.create( JPRO.Config.prototype );
JPRO.Viewer.prototype.constructor = JPRO.Viewer;

/**
 *
 *
 * @method copy
 */

/*JPRO.Viewer.prototype.copy = function(objHash, obj) {
    if (objHash === undefined) { objHash = {}; }
    if (objHash[this.name] !== undefined) { return objHash[this.name]; }
    var rv = (obj === undefined) ? new JPRO.Viewer() : obj;
    // Use call method to have its 'this' point to this viewer obj
    return JPRO.Config.prototype.copy.call(this, objHash, rv);
};*/

/**
 *
 *
 * @method initVars
*/
JPRO.Viewer.prototype.initVars = function() {
    this.renderer = null;
    this.pattern = null;
    this.ballColors = [0xbb11bb, 0x1111dd, 0x11bb11, 0xdddd00, 0xee9900, 0xdd1111];
//	    0xdd2222, 0x22dd22, 0x2222dd, 0xbb22bb,
//			    0x22bbbb, 0xbbbb22, 0x888888, 0x1155bb,
//			    0xeeee00, 0xffaa00, 0xaaff00, 0x22aaff];
    this.ballSize = 40; // best not to change this anymore
    //this.hands = [];
    this.props = []; // list of available props not being juggled
    this.allProps = []; // complete list of props
    this.nprops = 0; // total number of props
//    this.t = 0; // time (iteration)
//    this.beat = 0; // beat number (when throws occur)
    //this.renderer = null;
    this.enable = 1;
    //this.pattern = null;
    //this.npropsNotThrown = 0; // number of props not yet thrown
    this.rotEnable = null; // enable view rotation
    this.rotPeriod = 5; // used to slow down view rotation
    this.rotDeg = 180;
    this.rotCnt = 0;
    this.aerialTurn = null;
    this.zoomIn = null;
    this.zoomOut = null;
    this.lookAhead = null;
    this.timeBetweenThrows = null; // array
};
    
/**
 *
 *
 * @method init
*/
JPRO.Viewer.prototype.init = function() {
    this.initRotationMatrix();
    //this.initHands(hands);
    this.initProps();
    this.pattern = this.routine.nextPat(this); // init routine.viewer=this
    
    //if (this.pattern) {
//	console.log('pattern exists');
//    }
    this.view.rotateMe(this.r1);
    this.view.translateMe(this.zoomOut);
//    this.t = 0; // clear time
//    this.beat = 0; // and beat
    //this.beatPeriod = this.pattern.getBeatPeriod(this.beat, this.baseBeatPeriod);

    // Init LookAhead and precalculate first throws
    this.lookAhead = new JPRO.LookAhead(this);
    this.lookAhead.preCalculate();
    this.timeBetweenThrows = this.lookAhead.getTimeBetweenThrows();
    //this.timeBetweenThrows = this.lookAhead.tbt[0]; // init
    this.throwProps(this.pattern); // make first throws
    this.gui.init();
    this.initAnimation();
    console.log('finished init');
    return this;
};

/**
 *
 *
 * @method initRotationMatrix
*/
JPRO.Viewer.prototype.initRotationMatrix = function() {
    // Precompute rotation matrix to be used
    // by optional view rotation code during
    // animation
    //var rotx = new JPRO.Rmatrix(-1,0);
    //var roty = new JPRO.Rmatrix(1,1);
    var rotz = new JPRO.Rmatrix(1,2);
    this.r1 = new JPRO.Rmatrix(-this.viewAngle,0);
    var r1i = new JPRO.Rmatrix(this.viewAngle,0);
    this.aerialTurn = new JPRO.Matrix();
    this.aerialTurn.xMatrix(this.r1).xMatrix(rotz).xMatrix(r1i);
    this.zoomOut = new JPRO.Vec(0, this.zoomDistance, 0);
    this.zoomIn = new JPRO.Vec(0, -this.zoomOut.y, 0);
    return this;
};
    
/**
 *
 *
 * @method initHands
 * @return {Viewer} this viewer
*/
//JPRO.Viewer.prototype.initHands = function(hands) {
//    this.hands = hands;
//    return this;
//};

/**
 *
 *
 * @method initProps
 * @return this viewer
*/
JPRO.Viewer.prototype.initProps = function() {
    var i;
    var b;
    this.nprops = 30;
    for (i=0; i<this.nprops; i++) {
	b = new JPRO.Ball(this, new JPRO.Vec(),
			  this. ballColors[i % this. ballColors.length],
			  this.ballSize); //.caughtBy(this.hands[i % this.hands.length]);
	this.props.push(b);
	this.allProps.push(b);
	this.view.pushProp(b); // push this ball to the view world list
    }
    this.grfx.clear();
    return this;
};

/**
 *
 *
 * @method initAnimation
 * @return this viewer
*/
JPRO.Viewer.prototype.initAnimation = function() {
	
    // create a renderer instance
    this.renderer = PIXI.autoDetectRenderer(this.view.width, this.view.height);

    // add the renderer view element to the DOM
    document.body.appendChild(this.renderer.view);

    return this;
};

/**
 *
 *
 * @method grabNewProp
*/
JPRO.Viewer.prototype.grabNewProp = function() {
    var p;
    console.log('grabbing new prop');
    if (this.props.length === 0) {
	console.log('No props left to grab!');
	alert('No props left');
	return null;
    }
    else {
	p = this.props.pop();
	p.inPlay = 1;
	return p;
    }
};

/**
 *
 *
 * @method dropProp
*/
JPRO.Viewer.prototype.dropProp = function(p) {
    console.log('dropping a prop');
    p.inPlay = null;
    p.inHand = null;
    this.props.push(p);
};
    
/**
 *
 *
 * @method updateJugglers
 * @return this viewer
*/
JPRO.Viewer.prototype.updateJugglers = function() {
    var i;
    for (i=0; i<this.jugglers.length; i++) {
	this.jugglers[i].update(this.timeBetweenThrows);
    }
    return this;
};

/**
 *
 *
 * @method updateProps
 * @return this viewer
*/
JPRO.Viewer.prototype.updateProps = function() {
    var i;
    for (i=0; i<this.allProps.length; i++) {
	this.allProps[i].update();
    }
    return this;
};

// This is only called on viewer copies by LookAhead
JPRO.Viewer.prototype.nextBeat = function() {
    var i;
    //var clk = this.clock;
    this.clock.t = this.clock.beatPeriod; // force to next beat
    this.clock.update();
    for (i=0; i<this.jugglers.length; i++) {
	this.jugglers[i].nextBeat(); // for juggler/hand movements
    }
    if (! this.pattern.nextBeat()) {
	this.pattern = this.routine.nextPat(this, 0, 1);
    }
    // Need to update hand positions after callbacks
    for (i=0; i<this.jugglers.length; i++) {
	this.jugglers[i].updatePos(); // for juggler/hand movements
    }
};

// TODO - use LookAhead object instead
/*
JPRO.Viewer.prototype.lookAhead = function(row, beatRel) {
    this.objHash = {};
    var v = this.copy(this.objHash);
    var i = beatRel;
    var rhm = v.pattern.rhMap;
    var clk = v.clock;
    var t0 = clk.totalTime();
    while (i--) {
	clk.t = clk.beatPeriod; // force to next beat
	clk.update();
	if (! v.pattern.nextBeat()) {
	    v.pattern = v.routine.nextPat(v, 0, 1);
	    if (v.pattern.rhMap !== rhm) {
		rhm.clearEntryDone();
		rhm = v.pattern.rhMap;
	    }
	}
    }
    v.destTime = clk.totalTime() - t0;
    v.destHand = rhm.getHand(row);
    return v;

    // this section was previously commented out
    var rh = {};
    var tmpRtn = this.routine.copy(rh);
    tmpRtn.viewer = {};
    var tmpPat = this.pattern.copy(rh);
    var rhm = tmpPat.rhMap;
    var i = beatRel;
    while (i--) {
	//console.log('i=' + i);
	if (! tmpPat.nextBeat()) {
	    //console.log('proceed to next pat in routine..');
	    tmpPat = tmpRtn.nextPat(null, 0, 1);
	    if (tmpPat.rhMap !== rhm) {
		rhm.clearEntryDone();
	    }
	}
    }
    //console.log(tmpPat);
    //console.log(tmpPat.rhMap.name);
    return tmpPat;
};
*/

//JPRO.Viewer.prototype.getHand = function(pat,row) {
//    return pat.rhMap.getHand(row);
//};

JPRO.Viewer.prototype.getDwell = function(pat,row,clock,beatRel) {
    return pat.rhMap.getDwell(pat,row,clock,beatRel);
};

/*
JPRO.Viewer.prototype.getBeatsToNextThrow = function(hand) {
    var oh = {};
    var v = this.copy(oh);
    var h = oh[hand.name];
    var i = 1;
    if (! v.pattern.nextBeat()) {
	v.pattern = v.routine.nextPat(v, 0, 1);
    }
    while (! v.pattern.isThrowing(h)) {
	if (! v.pattern.nextBeat()) {
	    v.pattern = v.routine.nextPat(v, 0, 1);
	}
	i++;
	if (i > 999) {
	    throw 'Viewer.getBeatsToNextThrow: Not finding matching hand';
	}
    }
    return i;
	
*/

/*
    var rh = {};
    var tmpRtn = this.routine.copy(rh);
    tmpRtn.viewer = {};
    var tmpPat = this.pattern.copy(rh);
    var i = 1;
    if (! tmpPat.nextBeat()) {
	tmpPat = tmpRtn.nextPat(null, 0, 1);
    }
    //console.log(tmpPat.toString());
    //console.log(tmpPat.rhMap.name);
    while (! tmpPat.isThrowing(hand)) {
	if (! tmpPat.nextBeat()) {
	    tmpPat = tmpRtn.nextPat(null, 0, 1);
	    //console.log(tmpPat.toString());
	    //console.log(tmpPat.rhMap.name);
	}
	i++;
	if (i > 999) {
	    throw 'Viewer.getBeatsToNextThrow: Not finding matching hand';
	}
    }
    return i;
};
*/

/**
 *
 *
 * @method throwProps
*/
JPRO.Viewer.prototype.throwProps = function(pattern) {
    var i,k,pairs,destRow,rowHand,unthrown;
//    var pat,v;
    var td;
    var throwDataMatrix = this.lookAhead.getThrowDataMatrix();
    
    for (i=0; i<pattern.rows; i++) {
	pairs = pattern.mhn[i][pattern.beat];
	rowHand = pattern.rhMap.getHand(i);
	//console.log('cp1');
	// timestamp this throw
	this.clock.timeStamp(rowHand.name);
	unthrown = 0;
	for (k=0; k<pairs.length; k++) {
	    if (pairs[k][1] > 0) {
		// use TDM
		td = throwDataMatrix[i][k]; // ThrowData obj
		
		destRow = pairs[k][0];
		console.log('destRow=' + destRow);
		//destHand = this.getHand(destRow, pairs[k][1]);
		//dwell = pattern.rhMap.getDwell(destRow, pairs[k][1], this.clock);

		//v = this.lookAhead(destRow, pairs[k][1]);
		//pat = v.pattern;
		//console.log(pat.toString());
//		console.log('cp2');
		//console.log(pat.rhMap);
		//destHand = this.getHand(pat, destRow);
		//destHand = v.destHand;
		//console.log('Copy hfunc=' + destHand.hFunc.name);
		//origDestHand = this.objHash[destHand.name];
		//console.log('Orig hfunc=' + origDestHand.hFunc.name);
//		console.log('cp3');
		//dwell = this.getDwell(pat, destRow, v.clock, pairs[k][1]);
		//console.log('dwell=' + dwell);
		// TODO - fix conditional (pairs[k][1] !== 2) based on RHM
		//if ((destHand !== rowHand) || (pairs[k][1] !== 2) ||
		//    (rowHand.nprops() === 0)) {
		if (1) {
		    //rowHand.throwProp(origDestHand, destHand, pairs[k][1], dwell);
		    rowHand.throwProp(td);
		}
		else {
		    // do not make unnecessary little throw
		    //console.log(rowHand.name + ' not throwing a ' + pairs[k][1] + ' to ' + destHand.name);
		    unthrown++;
		}
	    }
	}
	if (rowHand.nprops() > unthrown) {
	    rowHand.dropProp(rowHand.nprops() - unthrown); // fix the problem
	}
    }
    return this;
};

/**
 * This is called once every frame in the animation (30 frames/sec)
 *
 * @method update
*/
JPRO.Viewer.prototype.update = function() {
    var i;
    
    this.grfx.clear(); // clear graphics
    
    // Update jugglers/balls
    this.updateJugglers().updateProps();
    
    // Optional view rotation
    this.rotateViewWhenEnabled(this.aerialTurn, this.zoomIn, this.zoomOut);
    
    // Do throws once every beat
    if ( this.clock.update() ) {
	this.timeBetweenThrows = this.lookAhead.getTimeBetweenThrows();
	if (! this.pattern.nextBeat()) {
	    this.pattern = this.routine.nextPat(this, 0);
	    console.log('Viewer: New pattern is ' + this.pattern);
	    // Update MHN table in html
	    $('#div1').html(this.pattern.toHtml());
	}
	for (i=0; i<this.jugglers.length; i++) {
	    this.jugglers[i].nextBeat(); // for juggler/hand movements
	}
	this.throwProps(this.pattern);
    }
    else {
	this.lookAhead.preCalculate();
    }
    
    // render the stage
    this.renderer.render(this.stage);
    
    return this;
};

/**
 *
 *
 * @method rotateViewWhenEnabled
*/
JPRO.Viewer.prototype.rotateViewWhenEnabled = function(rot, zoomIn, zoomOut) {
    if (this.rotEnable) {
	this.rotCnt++;
	if (this.rotCnt > this.rotPeriod) {
	    this.rotCnt = 0;
	    this.rotateView(rot, zoomIn, zoomOut);
	}
    }
};
    
/**
 *
 *
 * @method rotateView
*/
JPRO.Viewer.prototype.rotateView = function(rot, zoomIn, zoomOut) {
    var handScaleLb,rotRad;
    handScaleLb = 0.3;
//    function hsbound(xx, limit) {
//	var x = xx;
//	if (Math.abs(x) < limit) {
//	    x = limit;
//	}
//	return x;
//    }
    
    this.view.translateMe(zoomIn);
    this.view.rotateMe(rot);
    this.view.translateMe(zoomOut);
    this.rotDeg++;
    if (this.rotDeg > 180) this.rotDeg -= 360;
    rotRad = this.rotDeg * PIXI.DEG_TO_RAD; // convert to radians
    //	for (i=0; i<this.hands.length; i++) {
//	    this.hands[i].my_sprite.rotation = rotRad;
//	    // Scale hands' sprites in x and y directions
//	    x = 2*Math.abs(Math.cos(rotRad))*this.hands[i].pos_projected.z;
//	    y = 2*Math.abs(Math.sin(rotRad))*this.hands[i].pos_projected.z;
//	    // Avoid the paper thin disappearing hand issue when
//	    // scale gets too close to zero
//	    x = hsbound(x, handScaleLb);
//	    y = hsbound(y, handScaleLb);
//	    this.hands[i].my_sprite.scale.x = x;
//	    this.hands[i].my_sprite.scale.y = y;
//	} // for
    return this;
};

/**
 * This is used to find the hand's throw period  
 *
 * @method getHandBeatsFromLastThrow
 * @param row {Number}     - row of RHM matrix
 * @param beatRel {Number} - beat relative to current
 * @param hand {Hand}      - specify the Hand object to search for
 * @return {Number} the number of beats for destination
 *                  hand from its last throw beat
*/
JPRO.Viewer.prototype.getHandBeatsFromLastThrow = function(row, beatRel, hand) {
    var beatRel1 = beatRel || 0;
    // determine rhMap
    
    if (hand !== undefined) {
	row = this.handToRow(hand);
    }
    var rHands = this.rhm[row];
    var i = (this.rowBeats[row] + beatRel1) % rHands.length;
    var rv = 0;
    if (hand === undefined) {
	rv = 1;
	hand = rHands[i];
    }
    while (rv < 999) {
	if (hand === rHands[(i+rHands.length-rv) % rHands.length]) {
	    return rv;
	}
	rv++;
    }
    return 0; // something went wrong
};

