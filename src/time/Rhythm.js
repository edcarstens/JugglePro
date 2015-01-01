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
 * @param 
 *
 */
JPRO.Rhythm = function(rhythms, iters, idx, iter) {
    this.rhythms = rhythms || [1];
    this.iters = (iters === undefined) ? -1 : iters;
    this.idx = idx || 0;
    this.iter = iter || 0;
};

JPRO.Rhythm.prototype.constructor = JPRO.Rhythm;

JPRO.Rhythm.prototype.copy = function () {
    var i,x,typ,rhythms;
    rhythms = [];
    for (i in this.rhythms) {
	x = this.rhythms[i];
	typ = typeof x;
	if (typ === "object") {
	    rhythms.push(x.copy());
	}
	else if (typ === "number") {
	    rhythms.push(x);
	}
	else {
	    throw "Array element neither a number nor an object";
	}
    }
    return new JPRO.Rhythm(rhythms, this.iters, this.idx, this.iter);
};

JPRO.Rhythm.prototype.nextBeat = function (depth) {
    depth = depth || 0;
    if (depth > 99) {
	throw "Exceeded recursive limit of 99";
    }
    var rv = null;
    if ((this.iters >= 0) && (this.iter >= this.iters)) {
	this.iter = 0;
	return null; // done
    }
    var x = this.rhythms[this.idx];
    var typ = typeof x;
    if (typ === "number") {
	this.nextIdx();
	return x;
    }
    else if (typ === "object") {
	rv = x.nextBeat(depth+1);
	if (rv) {
	    return rv;
	}
	return this.nextIdx().nextBeat(depth+1);
    }
    else {
	throw "Array element neither a number nor an object";
    }
};

JPRO.Rhythm.prototype.timeBetweenBeats = function (beat1, beat2) {
    var i, rv;
    rv = 0;
    var r = this.copy();
    for (i=1; i<=beat1; i++) {
	r.nextBeat();
    }
    for (i=beat1; i<beat2; i++) {
	rv = rv + r.nextBeat();
    }
    return rv;
};

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

JPRO.Rhythm.prototype.toString = function () {
    var i, x, typ, rv;
    rv = "{";
    //console.log(this.rhythms);
    for (i in this.rhythms) {
	x = this.rhythms[i];
	//console.log(x);
	typ = typeof x;
	//console.log(typ);
	if (typ === "number") {
	    rv = rv + x + ",";
	}
	else if (typ === "object") {
	    rv = rv + "{" + x.toString() + "},";
	}
	else {
	    throw "Array element neither a number nor an object";
	}
    }
    rv = rv.slice(0,rv.length-1);
    rv = rv + "}x" + this.iters;
    return rv;
};
