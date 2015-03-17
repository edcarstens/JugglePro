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
