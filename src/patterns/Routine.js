/**
 * @author Ed Carstens
 */

/**
*** OBSOLETE ***
*** Now just use HierRptSeq consisting of RptSeq's and Seq's of JugPattern objects



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
