/**
 * @author Ed Carstens
 */

/**
 * Performance object consists of everything necessary
 * for a Viewer to represent a juggling performance.
 *
 * @class Performance
 * @constructor
 *
 */

JPRO.ID.Performance = 0;
JPRO.Performance = function(viewer, name) {
    // Call superclass
    this.className = this.className || 'Performance';
    JPRO.Base.call(this, name);

    /**
     * Pointer to the Viewer object
     *
     * @property viewer
     * @type {Viewer}
     */
    this.viewer = viewer;
};

JPRO.Performance.prototype = Object.create(JPRO.Base.prototype);
JPRO.Performance.prototype.constructor = JPRO.Performance;

/*
JPRO.Performance.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    pFuncs.jugglers = JPRO.Common.copyObjVector;
    pFuncs.controlPoints = JPRO.Common.copyObjVector;
    var scalars = [
	'drc', 'drt', 'basePeriod', 'minThrowTime',
	'viewWidth', 'viewHeight', 'view',
	'viewAngle', 'zoomDistance', 'zoomIn', 'zoomOut'
    ];
    var objects = [
	'clock', 'aerialTurn',
	'routine', 'pattern'
    ];
    return this.directedCopy(objHash, cFunc, pFuncs, scalars, objects);	
};
*/

JPRO.Performance.prototype.setDefaults = function() {
    if (this.defaultsSet) return;
    this.defaultsSet = 1;
    /**
     * drc (dwell ratio for catch) = (time from catch to destination beat)/(beats since last throw beat)
     *
     * @property drc
     * @type {Number}
     */
    //if (this.drc === undefined) { this.drc = 0.5; }

    /**
     * drt (dwell ratio for throw) = (time from destination beat to throw)/beats since last throw beat)
     *
     * @property drt
     * @type {Number}
     */
    //if (this.drt === undefined) { this.drt = 0; }

    /**
     * earlyDwellRatio (ratio of earlyDwell to catching control point period; earlyDwell is the dwell time in frame ticks from catch to destination beat; catching control point period is time elapsed since catching control point's previous beat)
     *
     * @property earlyDwellRatio
     * @type {Number}
     */
    if (this.earlyDwellRatio === undefined) { this.earlyDwellRatio = 0.5; }

    /**
     * lateDwellRatio (ratio of lateDwell to throwing control point period; lateDwell is dwell time in frame ticks from current beat to throw; throwing control point period is time from current beat to throwing control point's next beat)
     *
     * @property lateDwellRatio
     * @type {Number}
     */
    if (this.lateDwellRatio === undefined) { this.lateDwellRatio = 0; }
    
    /**
     * Performance clock may be used to synchronize music with juggling
     * (REMOVED because now the jugPattern has 1 clock per row)
     * @property clock
     * @type {Clock}
     */
    //if (this.clock === undefined) {
//	this.clock = new JPRO.Clock();
    //}
    
    /**
     * Minimum throw flight time
     *
     * @property minThrowFlightTime
     * @type {Number}
     */
    if (this.minThrowFlightTime === undefined) {
	//this.minThrowTime = (this.clock.basePeriod >> 1) + 1; // 1/2 smallest beat period
	this.minThrowFlightTime = 6; // 0.2 sec
    }

    /**
     * List of jugglers
     *
     * @property jugglers
     * @type {Array}
     */
    if (this.jugglers === undefined) {
	this.jugglers = [new JPRO.Juggler(this.viewer)];
    }

    /**
     * Juggling routine
     *
     * @property routine
     * @type {HierRptSeq}
     */
    if (this.routine === undefined) {
	// Default to simple 3-ball cascade for each juggler.
	var cpm = JPRO.ControlPointMapper.create(this);
	var pat = new JPRO.JugPattern(3, 1, cpm, 'pat');
	this.routine = new JPRO.HierRptSeq.create([pat]);
	this.routine.name = 'topRoutine';
    }

    /**
     * Ball colors
     *
     * @property ballColors
     * @type {Array}
     */
    if (this.ballColors === undefined) {
	this.ballColors = [0xbb11bb, 0x1111dd, 0x11bb11, 0xdddd00, 0xee9900, 0xdd1111];
    }

    /**
     *
     *
     * @property ballSize
     * @type {Number}
     */
    this.ballSize = this.ballSize || 40;
    
    /**
     * Total number of props (balls)
     *
     * @property nprops
     * @type {Number}
     */
    this.nprops = this.nprops || 30;

    /**
     * Complete list of props (balls)
     *
     * @property allProps
     * @type {Array}
     */
    this.allProps = this.initProps();
    
    /**
     * List of available props (balls) not being juggled
     *
     * @property props
     * @type {Array}
     */
    this.props = this.allProps; // shallow copy?
        
    /**
     * Control points
     *
     * @property controlPoints
     * @type {Array}
     */
    this.controlPoints = [];
    
    /**
     *
     *
     * @property
     * @type {}
     */
    this.patIdx = 0;
    this.mhnRow = 0;
    this.mhnCol = 0;
    this.mhnMpx = 0;
};

/**
 * Create all props and return as a list
 *
 * @method initProps
 * @return {Array} list of all props
*/
JPRO.Performance.prototype.initProps = function() {
    var i;
    var b;
    var rv = [];
    for (i=0; i<this.nprops; i++) {
	b = new JPRO.Ball(this.viewer, new JPRO.Vec(),
			  this.ballColors[i % this. ballColors.length],
			  this.ballSize); //.caughtBy(this.hands[i % this.hands.length]);
	rv.push(b);
	this.view.pushProp(b); // push this ball to the view world list
    }
    this.viewer.grfx.clear();
    return rv;
};

JPRO.Performance.prototype.update = function() {
    var i;
    
    // Update jugglers/balls every frame tick
    this.updateJugglers().updateProps();

    // NEW CODE (see viewer update method)
    // production (cameras) update every 6 frame ticks (0.2 sec)
    // calculate throws the other 5 frame ticks
    
// OLD CODE
    // Do throws once every beat
/*
    if ( this.clock.update() ) {
	if (! this.pattern.nextItem()) {
	    this.pattern = this.routine.nextItem();
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
	//this.lookAhead.preCalculate();
	// TODO: compile or precalculate throws
    }
*/
    
};

/**
 *
 *
 * @method calculateThrows
 * @param n {Number} number of throws to calculate
 * @return this viewer
*/
JPRO.Performance.prototype.calculateThrows = function(n) {
    var pat, i, jts;
    for (i=0; i<n; i++) {
	pat = this.routine.getItem(this.patIdx); // gets pattern of routine
	while (pat.iters === 0) {
	    pat = this.routine.getItem(++this.patIdx);
	}
	this.mhnIter = 0;
	jts = pat.jugThrowSeqs[this.mhnRow];
	this.calculateThrowsForRow(pat, jts);
	if (this.mhnRow >= pat.jugThrowSeqs.length) {
	    this.mhnRow = 0;
	    this.mhnIter++;
	    if (this.mhnIter >= pat.iters) {
		this.patIdx++;
		this.mhnIter = 0;
	    }
	}
    }
};

JPRO.Performance.prototype.calculateThrowsForRow = function(pat, jts) {
    var col = this.mhnIter * jts.period + this.mhnCol;
    var jtj = jts.getItem(col);
    var jt = jtj[this.mhnMpx++]; // jugThrow
    this.calculateThrow(pat, jts, jt, col);
    if (this.mhnMpx >= jtj.length) {
	this.mhnMpx = 0;
	this.mhnCol++;
	if (this.mhnCol >= jts.period) {
	    this.mhnCol = 0;
	    this.mhnRow++;
	}
    }
};

JPRO.Performance.prototype.calculateThrow = function(pat, jts, jt, col) {
    var cpid = jts.cpm.getItem(col); // control point ID
    var tcp = this.controlPoints[cpid]; // control point making throw
    var djts = pat.jugThrowSeqs[jt.destRow];
    var sb = jt.fltBeats - jt.destBeats + col; // absolute self beat (sync point)
    var syncOffset = jt.syncOffset || 0;
    var sbt = jts.clock.getInterval(0,sb) + syncOffset;
    // find dest beat corresponding to sync point
    var s = djts.clock.findSync(sbt);
    var db = s.b + jt.destBeats; // absolute destination beat (column)
    var dcpid = djts.cpm.getItem(db); // destination control point ID
    var dcp = this.controlPoints[dcpid]; // control point making catch
    // calculate flight time in frame ticks
    var ft = djts.clock.getInterval(0, db) - jts.clock.getInterval(0, col);
    var throwPos = tcp.getPos(col, 0); // fix me (lateDwell)
    var catchPos = dcp.getPos(db, 0); // fix me (earlyDwell)
    var g = -this.viewer.gravity.z; // positive acceleration of gravity
    var v0 = JPRO.Calculator.calcInitVel(ft, throwPos, catchPos,
					 g, jt.bounces, jt.forceThrow,
					 jt.earlyCatch);
    jt.pos = [throwPos];
    jt.destControlPoint = dcp;
    jt.dest = catchPos;
    jt.vel = [v0];
    jt.timer = [ft];
    jt.countdown = 0; // fix me (lateDwell)
};

/**
 *
 *
 * @method updateJugglers
 * @return this viewer
*/
JPRO.Performance.prototype.updateJugglers = function() {
    var i;
    for (i=0; i<this.jugglers.length; i++) {
	//this.jugglers[i].update(this.timeBetweenThrows);
	this.jugglers[i].update(); // TODO: find time to next throw for each control point
    }
    return this;
};

/**
 *
 *
 * @method updateProps
 * @return this viewer
*/
JPRO.Performance.prototype.updateProps = function() {
    var i;
    for (i=0; i<this.allProps.length; i++) {
	this.allProps[i].update();
    }
    return this;
};
