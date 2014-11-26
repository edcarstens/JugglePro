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

"use strict";

JPRO.ThrowSeq = function(mhn) {
    
    /**
     * Type of throw matrix object
     *
     * @property type
     * @type String
     */
    this.type = "ThrowSeq";
    
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
 * 
 *
 * @method 
 * @param  
 */
JPRO.ThrowSeq.prototype.repeat = function() {
    console.log('ThrowSeq.repeat: iter_cnt=' + this.iter_cnt);
    if (this.iters < 0) {
	return 1; // restart pattern indefinitely
    }
    else if (this.iter_cnt < this.iters-1) {
	this.iter_cnt++;
	console.log('Pattern.repeat: iter_cnt=' + this.iter_cnt);
	return 1; // restart pattern
    }
    else {
	this.iter_cnt = 0; // reset for next time
	return null; // finished
    }
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO.ThrowSeq.prototype.toString = function() {
    var rv, i, j, k;
    rv = '[';
    for (i=0; i<this.mhn.length; i++) {
	if (i > 0) {
	    rv = rv + ', ';
	}
	rv = rv + '[';
	for (j=0; j<this.mhn[i].length; j++) {
	    if (j > 0) {
		rv = rv + ', ';
	    }
	    rv = rv + '[';
	    for (k=0; k<this.mhn[i][j].length; k++) {
		if (k > 0) {
		    rv = rv + ', ';
		}
		rv = rv.concat('[');
		rv = rv.concat(this.mhn[i][j][k][0]);
		rv = rv.concat(',');
		rv = rv.concat(this.mhn[i][j][k][1]);
		rv = rv.concat(']');
	    }
	    rv = rv + ']';
	}
	rv = rv + ']';
    }
    rv = rv + ']';
    return rv;
};
