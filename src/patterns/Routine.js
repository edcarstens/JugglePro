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

JPRO.Routine = function(patterns) {

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.patterns = (patterns == null) ? [] : patterns; // list of patterns

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.patternIdx = 0; // index to patterns

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.iters = -1;

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
    this.type = "Routine";
};

JPRO.Routine.prototype.constructor = JPRO.Routine;

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
JPRO.Routine.prototype.nextPat = function(viewer, depth) {
    var i,j,x,pat,d;
    console.log('nextPat called with depth=' + depth);
    if (this.enable == null) {
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
    if (this.iters == 0) {
	this.enable = null;
	return null;
    }
    j = 0;
    i = this.patternIdx;
    console.log('pattern idx = ' + i);
    // Find first pattern with iters>0
    while ((j < this.patterns.length) && (this.patterns[i].iters == 0)) {
	i++;
	if (i >= this.patterns.length) {
	    i = 0;
	    if (this.iters > 0) {
		this.iterCnt++;
	    }
	}
	j++;
    }
    if (j == this.patterns.length) {
	throw "pattern has no iterable pattern in it"
    }
    // Set viewer pattern and other viewer vars
    x = this.patterns[i];
    this.patternIdx = i;
    if (x.type == "Routine") {
	if (x.nextPat(this.viewer, d+1)) {
	    return 1;
	}
	//x.enable = 1;
	console.log('finished routine');
	pat = null;
    }
    else {
	pat = x;
	this.viewer.pattern = pat;
	this.viewer.beatPeriod = pat.beatPeriod;
	//this.viewer.beatPeriod = this.patterns[i].get_beatPeriod(this.viewer.beat, this.viewer.base_beatPeriod);
	// Update MHN table in html
	$("#div1").html(this.viewer.pattern.toHtml());
    }
    
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
	if (pat == null) {
	    return null;
	}
	else {
	    return 1;
	}
    }
    if (pat == null) {
	return this.nextPat(this.viewer, d+1);
    }
    else {
	return this.enable;
    }
};
