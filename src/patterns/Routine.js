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

JPRO.Routine = function(patterns, iters) {

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.patterns = (patterns === undefined) ? [] : patterns; // list of patterns

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.currentIdx = 0; // index to current element

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.patternIdx = 0; // index to next element in patterns

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.iters = (iters === undefined) ? -1 : iters;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.iterCnt = 0;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.viewer = null;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.enable = 1;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.type = 'Routine';
};

JPRO.Routine.prototype.constructor = JPRO.Routine;

/**
 * Copies this routine
 *
 */
JPRO.Routine.prototype.copy = function(rhmHash) {
    var rv = new JPRO.Routine();
    rv.patternIdx = this.patternIdx;
    rv.currentIdx = this.currentIdx;
    rv.iters = this.iters;
    rv.iterCnt = this.iterCnt;
    rv.viewer = this.viewer;
    rv.enable = this.enable;
    rv.type = this.type;
    var i,x,rh;
    rh = (rhmHash === undefined) ? {} : rhmHash;
    for (i=0; i<this.patterns.length; i++) {
	x = this.patterns[i];
	rv.patterns.push(x.copy(rh));
    }
    return rv;
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
    console.log('nextPat called with depth=' + depth + ' lookAhead=' + lookAhead);
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
    console.log('pattern idx = ' + i);
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
    while (x.type === 'Dynamic') {
	console.log('x is Dynamic object');
	x = x.getRoutine(this, laf);
	console.log('dynamic loop: x=' + x);
    }
    if (x.type === 'Routine') {
	pat = x.nextPat(this.viewer, d+1, laf);
	if (pat) {
	    this.currentIdx = this.patternIdx;
	    return pat;
	}
	x.enable = 1;
	console.log('finished routine');
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
	if (this.iters > 0) {
	    this.iterCnt++;
	}
    }
    this.patternIdx = i;
    if ((this.iters > 0) && (this.iterCnt >= this.iters)) {
	this.iterCnt = 0;
	this.enable = null; // disable for next time
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
