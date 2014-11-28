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
"use strict";

//JPRO.Pattern = function(mhn, rowHands, iters, get_bp_xfun, get_tbb_xfun) {
JPRO.Pattern = function(mhn, rowHands, iters) {

    // Call superclass
    JPRO.ThrowSeq.call(this, mhn);

    // Members

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.type = "Pattern";

//    this.mhn = mhn;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.rowHands = rowHands;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.iters = (iters == null) ? -1 : iters; // -1 means repeat forever

    // Unusual external functions for timing beats for throws
    //this.get_beat_period = (get_bp_xfun == null) ? get_beat_period : get_bp_xfun;
    //this.get_time_between_beats = (get_tbb_xfun == null) ? get_time_between_beats : get_tbb_xfun;
    

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
    this.rows = this.mhn.length;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.period = this.mhn[0].length;
    console.log('rows=' + this.rows + ' period=' + this.period);

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.rowBeats = this.makeArray(this.rows); // make array of length rows, all zeros

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.maxRows = 2; // limited to two hands right now

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.maxPeriod = 32;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.highThrowHeight = 9; // yellow warning threshold

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.maxThrowHeight = 19; // red warning threshold
    // Members (viewer specific vars)

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.beatPeriod = 20;

    // Members (Gui)

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.selectionOrder = 0; // numerically ordered

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.selections = 0; // number of throws selected

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.isSelected = new Object; // hash
    

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
 * Swap two throws in MHN+ matrix
 *
 * @method swap
 * @param loc1 {Array}
 * @param loc2 {Array}
 */
JPRO.Pattern.prototype.swap = function(loc1, loc2) {
    var r1 = loc1[0];
    var t1 = loc1[1];
    var ms1 = loc1[2];
    var r2 = loc2[0];
    var t2 = loc2[1];
    var ms2 = loc2[2];
    var p1 = this.mhn[r1][t1][ms1];
    var p2 = this.mhn[r2][t2][ms2];
    var p1r = p1[0]; // pair1 destination row
    var p1t = p1[1] + t1; // pair1 destination time (absolute)
    this.mhn[r2][t2][ms2] = [p1r, p1t - t2]; // time adjusted (relative)
    var p2r = p2[0];
    var p2t = p2[1] + t2;
    this.mhn[r1][t1][ms1] = [p2r, p2t - t1];
    return this;
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
    var offset1 = (offset == null) ? 1 : offset; // default to 1
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
    var mult1 = (mult == null) ? 1 : mult; // default to 1
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
    var offset1 = (offset == null) ? 1 : offset; // default offset to 1
    if (this.mhn[row1][0].length >= 4) { // button-happy kid proof this
	alert("No more than 4 multiplex slots allowed per row");
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
    var i, j, k, idx;
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
	alert("Period upper limit is " + this.maxPeriod);
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
	alert("Rows upper limit is " + this.maxRows);
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
    console.log('calcProps called');
    sum = 0;
    for (i=0; i<this.rows; i++) {
	for (j=0; j<this.period; j++) {
	    for (k=0; k<this.mhn[i][j].length; k++) {
		sum += this.mhn[i][j][k][1];
	    }
	}
    }
    console.log('sum=' + sum);
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
    var i, j, k, rows, cols, pairs, pair, item, rv, bcolor;
    var swapEnable, call, r, t;
    swapEnable = (this.selections == 2) ? '' : 'disabled';
    call = this.selections ? "JPRO._ts" : "JPRO._ta"; // translate selected by +-period or all throws by +-1
    rv = "<table><colgroup>";
    rv += "<col span=\"1\" id='first_col'>";
    rv += "<col span=\"" + this.period + "\">";
    rv += "<col span=\"1\" id='last_col'>";
    rv += "</colgroup>";
    rv += "<tr><th><button onclick=\"JPRO._ac()\">AC</button></th>"; // start heading row
    rv += "<th><button onclick=\"" + call + "(1)\">0<sup>+</sup></button></th>"; // heading col0
    for (j=1; j<this.period; j++) {
	rv += "<th><button onclick=\"JPRO._rt(" + j + ")\">" + j + "</button></th>";
    }
    rv += "<th><button onclick=\"JPRO._ep()\">" + this.period + "</button></th>";
    rv += "</tr>"; // finish heading row
    call += "(-1)";
    for (i=0; i<this.rows; i++) {
	rv += "<tr><td><button onclick=\"" + call + "\">"; // start row
	call = "JPRO._rr(" + (i+1) + ")";
	rv += toHandSymbol(i);
	if (i == 0) {
	    rv += "<sup>-</sup>";
	}
	rv += "</button></td>";
	for (j=0; j<this.period; j++) {
	    rv += "<td>";
	    for (k=0; k<this.mhn[i][j].length; k++) {
		r = this.mhn[i][j][k][0]; // destination row
		t = this.mhn[i][j][k][1]; // destination beat (relative)
		if (k > 0) rv += ",";
		bcolor = this.isSelected[i + "," + j + "," + k] ? "#0022dd" :
		    ((t > this.maxThrowHeight) || (t < 0) || (t == 0) && (r != i)) ? "red" :
		    (t > this.highThrowHeight) ? "yellow" : "black";
		rv += "<span style=\"background-color:" + bcolor +
		    "\" onclick=\"JPRO._table(" + i + "," + j + "," + k + ")\">";
		rv += toHandSymbol(r);
		rv += t;
		rv += "</span>";
	    }
	    rv += "</td>"; // finish column element
	}
	rv += "<td>";
	rv += "<button onclick=\"JPRO._mp(" + i + ")\"> Multiplex </button>";
	rv += "</td>";
	rv += "</tr>"; // finish row
    }
    // Final row
    rv += "<tr style=\"background-color:#505050\">"; // start row
    rv += "<td><button onclick=\"JPRO._er()\">";
    rv += toHandSymbol(this.rows);
    rv += "</button></td>";
    rv += "<td><button onclick=\"JPRO._swap()\"" + swapEnable + "> Swap </button></td>";
    for (j=1; j<this.period; j++) {
	rv += "<td></td>";
    }
    // bottom right cell
    rv += "<td><button onclick=\"JPRO._reset()\"> Reset </button></td>";
    rv += "</tr>"; // finish row
    rv += "</table>";
    return rv;
};

/**
 * Convert row number to capital letter
 *
 * @method toHandSymbol
 * @param row {Number}
 * @return {String} capital letter representing row number
 */
JPRO.Pattern.prototype.toHandSymbol = function(row) {
    return String.fromCharCode(65 + row); // A,B,..
};
    
/**
 * Increments rowBeats variables, which are used to
 * determine destination hands
 *
 * @method nextBeat
 */
JPRO.Pattern.prototype.nextBeat = function() {
    var i;
    for (i=0; i<this.rows; i++) {
	if (this.rowBeats[i] >= this.rowHands[i].length - 1) {
	    this.rowBeats[i] = 0;
	}
	else {
	    this.rowBeats[i]++;
	}
    }
};

/**
 * Returns the destination hand specified by row and
 * number of beats relative to current beat.
 *
 * @method getHand
 * @param row {Number}
 * @param beatRel {Number}
 * @return {Hand} the destination hand
 */
JPRO.Pattern.prototype.getHand = function(row, beatRel) {
    var beatRel1 = beatRel || 0;
    var rhands = this.rowHands[row];
    console.log('rhands=' + rhands);
    console.log('rhands.length=' + rhands.length);
    var i = (this.rowBeats[row] + beatRel1) % rhands.length;
    console.log('Pattern.getHand: rhands[' + i + '] = ' + rhands[i].name);
    return rhands[i];
};

// bp = base beat period
// beat periods are integer multiples of bp
// normally, beatPeriod = bp * 1
//    function get_beatPeriod(beat, bp) {
//	return bp;
//    }

//    function get_time_between_beats(beat1, beat2, bp) {
//	return (beat2 - beat1)*bp;
//    }
        
/**
 * 
 *
 * @method clean
 */
JPRO.Pattern.prototype.clean = function() {
    var i,j;
    for (i=0; i<this.rows; i++) {
	for (j=0; j<this.period; j++) {
	    this.mhn[i,j] = this.cleanList(this.mhn[i,j], i);
	}
    } // end for i	
};

/**
 * 
 *
 * @method cleanList
 * @param pairs {Array}
 * @param row {Number}
 * @return {Array}
 */
JPRO.Pattern.prototype.cleanList = function(pairs, row) {
    var rv = [];
    var pair;
    while (pair=pairs.shift) {
	if ((pair[1] != 0) || (pair[0] != row)) {
	    push(rv, pair);
	}
    } // end while
    return rv;
};

/**
 * Keeps track of throw selection ordered list
 *
 * @method select
 * @param row {Number}
 * @param col {Number}
 * @param ms {Number}
 */
JPRO.Pattern.prototype.select = function(row, col, ms) {
    var k = row + ',' + col + ',' + ms; // hash key
    if (this.isSelected[k]) {
	//this.isSelected[k] = 0; // deselect
	delete this.isSelected[k];
	this.selections--;
    }
    else {
	this.isSelected[k] = ++this.selectionOrder;
	this.selections++;
    }
    console.log('selections:' + this.selections);
};

/**
 * 
 *
 * @method getSelectedThrows
 * @return {Array} selected throws
 */
JPRO.Pattern.prototype.getSelectedThrows = function() {
    var a,k,aa,i;
    a = [];
    for (k in this.isSelected) {
	aa = k.split(",");
	for (i=0; i<aa.length; i++) {
	    aa[i] = parseInt(aa[i]); // convert to int
	}
	a.push(aa);
    }
    return a;
};

/**
 * 
 *
 * @method clearSelections
 */
JPRO.Pattern.prototype.clearSelections = function() {
    var k;
//	var aa;
    for (k in this.isSelected) {
//	    aa = k.split(",");
//	    if (parseInt(aa[0]) == row) {
	delete this.isSelected[k];
	this.selections--;
//	    }
    }
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
    $("#div1").html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _ta
 * @param x {Number} offset
 */
JPRO._ta = function(x) {
    viewer.pattern.translateAll(x);
    $("#div1").html(viewer.pattern.toHtml());
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
    $("#div1").html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _rt
 * @param  
 */
JPRO._rt = function(x) {
    viewer.pattern.rotateThrows(x);
    $("#div1").html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method _ep
 * @param  
 */
JPRO._ep = function() {
    viewer.pattern.extendPeriod();
    $("#div1").html(viewer.pattern.toHtml());
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
    $("#div1").html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._rr = function(x) {
    viewer.pattern.rotateRows(x);
    $("#div1").html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._er = function() {
    viewer.pattern.extendRows(0);
    $("#div1").html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._swap = function() {
    var a = viewer.pattern.getSelectedThrows();
    viewer.pattern.swap(a[0], a[1]);
    viewer.pattern.clearSelections();
    $("#div1").html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._table = function(row, col, ms) {
    viewer.pattern.select(row, col, ms);
    $("#div1").html(viewer.pattern.toHtml());
};

/**
 * 
 *
 * @method 
 * @param  
 */
JPRO._reset = function() {
    viewer.pattern.reset();
    $("#div1").html(viewer.pattern.toHtml());
};
