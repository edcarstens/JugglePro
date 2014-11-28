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

"use strict";

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
	console.log("maxThrowHeight=" + maxThrowHeight);
	for (i=0; i<mhn.length; i++) {
	    // proceed from end of pattern backwards in time
	    // repeating the pattern until all props accounted for
	    timeIdx = 1; // beats relative to final state
	    while (n > 0) {
		if (timeIdx > maxThrowHeight) {
		    console.log("State: ERROR - Unable to determine state for MHN pattern");
		    return;
		}
		for (j=mhn[i].length-1; j>=0; j--) {
		    for (k=0; k<mhn[i][j].length; k++) {
			destRow = mhn[i][j][k][0];
			destTimeRel = mhn[i][j][k][1];
			scol = destTimeRel - timeIdx;
			console.log("i=" + i + " j=" + j + " k=" + k + " th=" + destTimeRel + " scol=" + scol);
			if (scol >= 0) {
			    if ((state[destRow] == undefined) || (state[destRow][scol] == undefined)) {
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
    if (this.state[row] == undefined) {
	this.state[row] = [];
	this.state[row][col] = 1;
	return;
    }
    if (this.state[row][col] == undefined) {
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
    console.log("makeThrow called with row=" + row + " destRow=" + destRow + " th=" + th);
    var b = this.state[row][0];
    if ((b == undefined) || (b == 0)) {
	if (th > 0) {
	    console.log("makeThrow: ERROR - throw-height must be 0 for row " + row);
	    return;
	}
    }
    else {
	if (th == 0) {
	    console.log("makeThrow: ERROR - throw-height must be positive for row " + row);
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
    if (state == null) { state = this.state; }
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
    if (state == null) { state = this.state; }
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
    if (s1.length != s2.length) {
	console.log("rows not equal:" + s1.length + " != " + s2.length);
	return 0;
    }
    for (i=0; i<s1.length; i++) {
	if (s1[i].length != s2[i].length) {
	    console.log("cols not equal:" + s1[i].length + " != " + s2[i].length + " for row " + i);
	    return 0;
	}
	for (j=0; j<s1[i].length; j++) {
	    if (s1[i][j] == undefined) { s1[i][j] = 0; }
	    if (s2[i][j] == undefined) { s2[i][j] = 0; }
	    if (s1[i][j] != s2[i][j]) {
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
    console.log("0 transSeq = " + this.mhnToString(transSeq));
    // Compare state heights
    var csh = this.getHeight();
    var tsh = tso.getHeight();
    var tlen = csh - tsh; // transition seq length
    if (tlen < 0) {
	tlen = 1;
    }
    console.log("csh=" + csh + " tsh=" + tsh + " tlen=" + tlen);
    // Find number of beats (tlen) from current state for which
    // target state is reachable
    csi = csh - 1; // max index of a prop in current state
    tsi = csi - tlen;
    while ((tlen <= csi) && this.unreachable(cs, csi, ts, tsi)) {
	tlen++;
	tsi = csi - tlen;
    } // while
    console.log("tlen=" + tlen);
    // push transition seq throws
    transSeq = this.pushTransThrows(transSeq, cs, ts, tlen);
    console.log("1 transSeq = " + this.mhnToString(transSeq));
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
    console.log("target state is reachable without having to go through ground state");
    return 0;
};

/**
 * Converts undefined to 0 (in state matrix)
 * 
 * @method toInt
 * @param x {Number}
 * @return {Number} 0 if x==undefined, otherwise returns x
*/
JPRO.State.prototype.toInt = function(x) {
    if (x == undefined) {
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
    if (tlen == 0) {
	return transSeq;
    }
    for (i=0; i<cs.length; i++) {
	transSeqTmp.push([]);
    }
    
    // fill the gaps prior to building the target state
    for (j=1; j<tlen; j++) {
	for (i=0; i<cs.length; i++) {
	    if (this.toInt(cs[i][j]) == 0) {
		for (k=0; k<j; k++) {
		    if (this.toInt(cs[i][k]) > 0) {
			cs[i][k]--;
			cs[i][j] = 1;
			if (transSeqTmp[i][k] == undefined) {
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
    console.log("0 transSeqTmp = " + this.mhnToString(transSeqTmp));

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
		console.log("From ii=" + ii + " jj=" + jj);
		console.log("  To  i=" + i + "  k=" + k);
		if (transSeqTmp[ii][jj] == undefined) {
		    transSeqTmp[ii][jj] = [[i, k-jj]];
		}
		else {
		    transSeqTmp[ii][jj].push([i, k-jj]);
		}
		x--;
	    } // while
	} // for i
    } // for j
    console.log("1 transSeqTmp = " + this.mhnToString(transSeqTmp));

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
    console.log("findThrow: ERROR - No balls left in cs to throw");
    return;
};
    
/**
 * Gets the height of this state
 *
 * @method getHeight
 * @return {Number} maximum state array length
*/
JPRO.State.prototype.getHeight = function() {
    var i,j,x,rv;
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
    var rv = "[";
    for (i=0; i<this.state.length; i++) {
	if (i > 0) {
	    rv = rv + ",<br>\n";
	}
	rv = rv + "[";
	for (j=0; j<this.state[i].length; j++) {
	    if (j > 0) {
		rv = rv + ", ";
	    }
	    x = this.state[i][j];
	    x = (x == undefined) ? "0" : x;
	    rv = rv + x;
	} // for j
	rv = rv + "]";
    } // for i
    rv = rv + "]";
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
    var i,j;
    var rv = new JPRO.State(this.mhn, this.props);
    rv.state = [];
    for (i=0; i<this.state.length; i++) {
	rv.state[i] = this.state[i].slice(0); // copies array
    } // for i
    return rv;
};
