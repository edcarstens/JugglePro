/**
 * @author Ed Carstens
 */

/**
 * A Pattern is a periodic (repeatable) sequence of throws.
 *
 * @class Pattern
 * @extends ThrowSeq
 * @constructor
 * @param mhn {Array} the MHN+ throw matrix
 * @param rowHands {Array} row-to-hand mapping
 * @param iters {Number} number of iterations of pattern to be executed
 *
 */
(function () {

'use strict';
JPRO.ID.Pattern = 0;
/* global $:true, viewer:true */
JPRO.Pattern = function(mhn, rhMap, iters, name) {

    // Call superclass
    this.className = this.className || 'Pattern';
    JPRO.ThrowSeq.call(this, mhn, rhMap, name);

    /**
     * Type string
     *
     * @property type
     * @type String
     */
    //this.type = 'Pattern';

    /**
     * Iterations
     *
     * @property iters
     * @type Number
     */
    this.iters = (iters === undefined) ? -1 : iters; // -1 means repeat forever

    /**
     * Iteration
     *
     * @property iterCnt 
     * @type Number
     */
    this.iterCnt = 0;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.props = this.calcProps();

};

JPRO.Pattern.prototype = Object.create( JPRO.ThrowSeq.prototype );
JPRO.Pattern.prototype.constructor = JPRO.Pattern;

/**
 * 
 *
 * @method setPeriodRows
 * @param period {Number}
 * @param rows {Number} 
 */
JPRO.Pattern.prototype.setPeriodRows = function(period, rows) {
    if (period) {
	this.period = period;
    }
    if (rows) {
	this.rows = rows;
    }
    this.mhn = this.genMhn(this.rows, this.period);
    this.props = this.calcProps();
    this.rowBeats = this.makeArray(this.rows); // make array of length rows, all zeros
    return this;
};

/**
 * 
 *
 * @method genMhn
 * @param rows {Number} 
 * @param period {Number}
 */
// generate MHN+ matrix (+ is multiplex-capable)
JPRO.Pattern.prototype.genMhn = function(rows, period) {
    var pairs; // list of hand/throw pairs (multiplex-capable)
    //var pair;
    var mhnRow;
    var i,j;
    var mhn = [];
    for (i=0; i<rows; i++) {
	//console.log('i=' + i);
	mhnRow = [];
	for (j=0; j<period; j++) {
	    pairs = [[i, 0]];
	    //console.log('j=' + j);
	    mhnRow.push(pairs);
	}
	mhn.push(mhnRow);
    }
    return mhn;
};

/**
 * 
 *
 * @method makeArray
 * @param sz {Number}
 * @param val {Number}
 */
JPRO.Pattern.prototype.makeArray = function(sz, val) {
    var val1 = val || 0;
    var i;
    var rv = [];
    for (i=sz-1; i>=0; i--) {
	rv[i] = val1;
    }
    return rv;
};

/**
 * Adds an offset to all throws in the throw matrix
 *
 * @method translateAll
 * @param offset {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.translateAll = function(offset) {
    var i,j,k;
    var offset1 = (offset === undefined) ? 1 : offset; // default to 1
    var sum = 0;
    for (i=0; i<this.rows; i++) {
	for (j=0; j<this.period; j++) {
	    for (k=0; k<this.mhn[i][j].length; k++) {
		this.mhn[i][j][k][1] += offset1;
		sum += offset1;
	    }
	}
    }
    this.props += Math.round(sum/this.period);
    return this;
};

/**
 * Adds multiple of the period to a throw
 *
 * @method translateThrow
 * @param loc {Array}
 * @param mult {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.translateThrow = function(loc, mult) {
    var r = loc[0];
    var t = loc[1];
    var ms = loc[2];
    var mult1 = (mult === undefined) ? 1 : mult; // default to 1
    this.mhn[r][t][ms][1] += mult1*this.period;
    this.props += mult1;
    return this;
};

/**
 * Adds multiple of the period to selected throws
 *
 * @method translateThrowsSelected
 * @param mult {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.translateThrowsSelected = function(mult) {
    var a,i;
    a = this.getSelectedThrows();
    for (i=0; i<a.length; i++) {
	this.translateThrow(a[i], mult);
    }
    return this;
};
    
/**
 * 
 *
 * @method multiplexTranslate
 * @param row {Number}
 * @param offset {Number}
 */
JPRO.Pattern.prototype.multiplexTranslate = function(row, offset) {
    var j;
    var row1 = row || 0; // default row to zero
    var offset1 = (offset === undefined) ? 1 : offset; // default offset to 1
    if (this.mhn[row1][0].length >= 4) { // button-happy kid proof this
	alert('No more than 4 multiplex slots allowed per row');
	return this;
    }
    for (j=0; j<this.period; j++) {
	this.mhn[row1][j].push([row1,offset1]); // new multiplex slot pair
    }
    this.props += offset1;
    return this;
};

/**
 * Rotates throws so that column x becomes column 1
 *
 * @method rotateThrows
 * @param x {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.rotateThrows = function(x) {
    var i;
    for (i=0; i<this.rows; i++) {
	this.mhn[i] = this.rotateRow(x, this.mhn[i]);
    }
    return this;
};

/**
 * Rotates throws only in specified row so that column x
 * of that row becomes column 1 of that row
 *
 * @method rotateRow
 * @param x {Number}
 * @param mhnRow {Array}
 * @return {Array} new rotated row
 */
JPRO.Pattern.prototype.rotateRow = function(x, mhnRow) {
    var j, idx;
    var rv = [];
    for (j=mhnRow.length-1; j>=0; j--) {
	idx = (j + x) % mhnRow.length;
	rv[j] = mhnRow[idx];
    }
    return rv;
};
    
/**
 * Rotates rows in MHN+ so that row x becomes the
 * first row
 *
 * @method rotateRows
 * @param x {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.rotateRows = function(x) {
    var i, idx;
    if (this.rows < 2) {
	return this;
    }
    var mhn = this.mhn.slice(0); // shallow clone
    for (i=0; i<this.rows; i++) {
	idx = (i + x + this.rows) % this.rows;
	this.mhn[i] = this.rotateRowsAdjust(mhn[idx], i-idx, this.rows);
    }
    return this;
};

/**
 * Adjusts all throws in a given row so that the relative
 * row destination stays the same when rotating rows.
 *
 * @method rotateRowsAdjust
 * @param row {Array}
 * @param adjustment {Number}
 * @param rows {Number}
 * @return {Array} adjusted row
 */
JPRO.Pattern.prototype.rotateRowsAdjust = function(row, adjustment, rows) {
    var j, k;
    for (j=0; j<row.length; j++) {
	for (k=0; k<row[j].length; k++) {
	    row[j][k][0] = (row[j][k][0] + adjustment + rows) % rows;
	}
    }
    return row;
};

/**
 * Extends period by one, choosing legal throw-heights
 *
 * @method extendPeriod
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.extendPeriod = function() {
    //console.log('extendPeriod called');
    var j,i,k,tAbs,x,msThrows,adjust;
    var sum = 0;
    var n = 0; // amount subtracted from each throw
    if (this.period >= this.maxPeriod) { // kid proofed
	alert('Period upper limit is ' + this.maxPeriod);
	return this;
    }
    while (sum < this.props*this.period) {
	for (j=0; j<this.period; j++) {
	    for (i=0; i<this.rows; i++) {
		for (k=0; k<this.mhn[i][j].length; k++) {
		    this.mhn[i][j][k][1] -= 1;
		    sum++;
		}
	    } // for i
	} // for j
	n++;
    } // while
    if (sum > this.props*this.period) {
	adjust = 1;
    }
    else {
	adjust = 0;
    }
    for (j=0; j<this.period; j++) {
	for (i=0; i<this.rows; i++) {
	    for (k=0; k<this.mhn[i][j].length; k++) {
		tAbs = this.mhn[i][j][k][1] + j + adjust; // absolute beat time
		x = Math.floor(tAbs/this.period); // adjusted for extra column
		this.mhn[i][j][k][1] += x + n; // add n back in to each throw
	    } // for k
	} // for i
    } // for j
    
    // Extend the period by one column
    for (i=0; i<this.rows; i++) {
	msThrows = [];
	for (k=0; k<this.mhn[i][0].length; k++) {
	    msThrows.push([i, n-adjust]);
	} // for k
	this.mhn[i].push(msThrows); // new column
    } // for i
    this.period++; // increment period
    return this;
};

/**
 * Extends rows by one, using specified throw-height
 *
 * @method extendRows
 * @param throwHeight {Number}
 * @return {Pattern} this pattern
 */
JPRO.Pattern.prototype.extendRows = function(throwHeight) {
    var t = throwHeight || 0;
    var row = [];
    var j;
    if (this.rows >= this.maxRows) { // kid proofed
	alert('Rows upper limit is ' + this.maxRows);
	return this;
    }
    for (j=0; j<this.period; j++) {
	row.push([[this.rows, t]]);
    }
    this.mhn.push(row); // append new row
    this.rows++; // increment rows
    return this;
};

/**
 * Resets the pattern to [[[[0,0]]]]
 *
 * @method reset
 */
JPRO.Pattern.prototype.reset = function() {
    this.period = 1;
    this.rows = 1;
    this.mhn = [[ [[0,0]] ]];
    this.props = 0;
};
    
/**
 * Calculate and return number of props juggled
 * in this pattern.
 *
 * @method calcProps
 * @return {Number} calculated number of props
 */
JPRO.Pattern.prototype.calcProps = function() {
    var i,j,k,sum,rv;
    //console.log('calcProps called');
    sum = 0;
    for (i=0; i<this.rows; i++) {
	for (j=0; j<this.period; j++) {
	    for (k=0; k<this.mhn[i][j].length; k++) {
		sum += this.mhn[i][j][k][1];
	    }
	}
    }
    //console.log('sum=' + sum);
    rv = sum/this.period;
    // todo - check for error if rv is not an integer
    return Math.round(rv);
};

/**
 * Displays this MHN+ pattern in HTML as a table
 * which has a number of clickable fields.
 *
 * @method toHtml
 * @return {String} HTML tabular representation of this pattern
 */
JPRO.Pattern.prototype.toHtml = function() {
    var i, j, k, rv, bcolor;
    var swapEnable, call, r, t;
    swapEnable = (this.selections === 2) ? '' : 'disabled';
    call = this.selections ? 'JPRO._ts' : 'JPRO._ta'; // translate selected by +-period or all throws by +-1
    rv = '<table><colgroup>';
    rv += '<col span=\'1\' id="first_col">';
    rv += '<col span=\'' + this.period + '\'>';
    rv += '<col span=\'1\' id="last_col">';
    rv += '</colgroup>';
    rv += '<tr><th><button onclick=\"JPRO._ac()\">AC</button></th>'; // start heading row
    rv += '<th><button onclick=\"' + call + '(1)\">0<sup>+</sup></button></th>'; // heading col0
    for (j=1; j<this.period; j++) {
	rv += '<th><button onclick=\"JPRO._rt(' + j + ')\">' + j + '</button></th>';
    }
    rv += '<th><button onclick=\"JPRO._ep()\">' + this.period + '</button></th>';
    rv += '</tr>'; // finish heading row
    call += '(-1)';
    for (i=0; i<this.rows; i++) {
	rv += '<tr><td><button onclick=\'' + call + '\'>'; // start row
	call = 'JPRO._rr(' + (i+1) + ')';
	rv += this.toHandSymbol(i);
	if (i === 0) {
	    rv += '<sup>-</sup>';
	}
	rv += '</button></td>';
	for (j=0; j<this.period; j++) {
	    rv += '<td>';
	    for (k=0; k<this.mhn[i][j].length; k++) {
		r = this.mhn[i][j][k][0]; // destination row
		t = this.mhn[i][j][k][1]; // destination beat (relative)
		if (k > 0) rv += ',';
		bcolor = this.isSelected[i + ',' + j + ',' + k] ? '#0022dd' :
		    ((t > this.maxThrowHeight) || (t < 0) || (t === 0) && (r !== i)) ? 'red' :
		    (t > this.highThrowHeight) ? 'yellow' : 'black';
		rv += '<span style=\"background-color:' + bcolor +
		    '\" onclick=\"JPRO._table(' + i + ',' + j + ',' + k + ')\">';
		rv += this.toHandSymbol(r);
		rv += t;
		rv += '</span>';
	    }
	    rv += '</td>'; // finish column element
	}
	rv += '<td>';
	rv += '<button onclick=\"JPRO._mp(' + i + ')\"> Multiplex </button>';
	rv += '</td>';
	rv += '</tr>'; // finish row
    }
    // Final row
    rv += '<tr style=\"background-color:#505050\">'; // start row
    rv += '<td><button onclick=\"JPRO._er()\">';
    rv += this.toHandSymbol(this.rows);
    rv += '</button></td>';
    rv += '<td><button onclick=\"JPRO._swap()\"' + swapEnable + '> Swap </button></td>';
    for (j=1; j<this.period; j++) {
	rv += '<td></td>';
    }
    // bottom right cell
    rv += '<td><button onclick=\"JPRO._reset()\"> Reset </button></td>';
    rv += '</tr>'; // finish row
    rv += '</table>';
    return rv;
};

/**
 * Finds a minimum throw sequence to transition from
 * this pattern to the specified one.
 *
 * @method getTranstion
 * @param destPat {Pattern}
 * @return {ThrowSeq} throw sequence to get from this pattern
 *     to destination pattern
 */
JPRO.Pattern.prototype.getTransition = function(destPat) {
    var destState = new JPRO.State(destPat.mhn, destPat.props);
    var myState = new JPRO.State(this.mhn, this.props);
    return myState.getTransition(destState);
};

// Global functions for onclick events

/**
 * 
 *
 * @method _ac
 */
JPRO._ac = function() {
    viewer.pattern.clearSelections();
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _ta
 * @param x {Number} offset
 */
JPRO._ta = function(x) {
    viewer.pattern.translateAll(x);
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _ts
 * @param  
 */
JPRO._ts = function(x) {
    viewer.pattern.translateThrowsSelected(x);
    viewer.pattern.clearSelections();
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _rt
 * @param  
 */
JPRO._rt = function(x) {
    viewer.pattern.rotateThrows(x);
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _ep
 * @param  
 */
JPRO._ep = function() {
    viewer.pattern.extendPeriod();
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._mp = function(row) {
    viewer.pattern.multiplexTranslate(row, 1);
    viewer.pattern.clearSelections();
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._rr = function(x) {
    viewer.pattern.rotateRows(x);
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._er = function() {
    viewer.pattern.extendRows(0);
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _swap
 * @param  
 */
JPRO._swap = function() {
    var a = viewer.pattern.getSelectedThrows();
    viewer.pattern.swap(a[0], a[1]);
    viewer.pattern.clearSelections();
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _table
 * @param  
 */
JPRO._table = function(row, col, ms) {
    viewer.pattern.select(row, col, ms);
    $('#div1').html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _reset
 * @param  
 */
JPRO._reset = function() {
    viewer.pattern.reset();
    $('#div1').html(viewer.pattern.toHtml());
};

})();
