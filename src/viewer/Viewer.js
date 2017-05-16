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
    JPRO.Base.call(this, name);
    //this.initVars();

    /**
     * performance
     *
     * @property performance
     * @type {Performance}
     */
    this.performance = new JPRO.Performance(this, 'performance');

    /**
     * production
     *
     * @property production
     * @type {Production}
     */
    this.production = new JPRO.Production(this, 'production');

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.testVar = 0; // for experimentation
};

//JPRO.Viewer.prototype = Object.create( JPRO.Config.prototype );
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

JPRO.Viewer.prototype.setDefaults = function() {
    if (this.defaultsSet) return;
    this.defaultsSet = 1;
    /**
     * Production 
     *
     * @property production
     * @type Production
     */
    if (this.production === undefined) {
	this.production = new JPRO.Production(this);
    }
    this.production.setDefaults();
    
    /**
     * Performance list
     *
     * @property performances
     * @type Array
     */
    if (this.performances === undefined) {
	this.performances = [new JPRO.Performance(this)];
    }
    this.performances.map(function(i) {i.setDefaults();});
    
    /**
     * GUI (graphical user interface)
     *
     * @property gui
     * @type {Gui}
     */
    //if (this.gui === undefined) { this.gui = new JPRO.Gui(this); }

    /**
     * Acceleration of gravity vector
     *
     * @property gravity
     * @type {Vec}
     */
    if (this.gravity === undefined) {
	this.gravity = new JPRO.Vec(0,0,-8);
    }

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
     * 
     *
     * @property 
     * @type 
     */

};

/**
 *
 *
 * @method init
*/
JPRO.Viewer.prototype.init = function() {
    this.setDefaults();
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
    //this.timeBetweenThrows = this.lookAhead.getTimeBetweenThrows();
    //this.timeBetweenThrows = this.lookAhead.tbt[0]; // init
    //this.throwProps(this.pattern); // make first throws
    this.throwProps(this.routine); // make first throws
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
 * Throw all props at current beat
 *
 * @method throwProps
*/
JPRO.Viewer.prototype.throwProps = function(routine) {
    // NEW CODE
    // TODO - drt (hold time from beat to throw)
    var i,k,cp;
    var jugThrows = routine.nextItem();
    var cpm = routine.currentSeq.cpMapper;
    var tm = jugThrows.throwMatrix;
    for (i=0; i<tm.length; i++) {
	cp = cpm.cpSeqs[i].nextItem();
	for (k=0; k<tm[i].length; k++) {
	    cp.throwProp(tm[k]);
	}
    }

    // OLD CODE
    /*
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
*/
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

    // update the juggling performance
    this.performance.update();

    // update the production (cameras, lighting, etc)
    // when not doing a production update,
    // use the time for calculating throws
    this.production.update() || this.performance.calculateThrows();
    
    // render the stage
    this.renderer.render(this.stage);
    
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

