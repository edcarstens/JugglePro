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
 *
 */

(function () {

'use strict';

JPRO.ThrowSeq = function(mhn) {
    
    /**
     * Type of throw matrix object
     *
     * @property type
     * @type String
     */
    this.type = 'ThrowSeq';
    
    /**
     * MHN throw matrix
     *
     * @property mhn
     * @type Array
     */
    this.mhn = mhn ? mhn : [[[[0,0]]]];
    
    /**
     * Number of iterations
     *
     * @property iters
     * @type Number
     */
    this.iters = 1;
    
    /**
     * Iteration counter
     *
     * @property iterCnt
     * @type Number
     */
    this.iterCnt = 0;
};

JPRO.ThrowSeq.prototype.constructor = JPRO.ThrowSeq;

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
	console.log('Pattern.repeat: iterCnt=' + this.iterCnt);
	return 1; // restart pattern
    }
    else {
	this.iterCnt = 0; // reset for next time
	return null; // finished
    }
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
    console.log(mhn);
    console.log(mhnTmp);
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
