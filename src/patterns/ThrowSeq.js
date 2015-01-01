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
 * @param rhMap {RowHandMapper} row-to-hand mapping object
 *
 */

(function () {

    'use strict';

    JPRO.ThrowSeq = function(mhn, rhMap) {
    
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
	 * Row-to-hand mapper object ref
	 *
	 * @property rhMap
	 * @type RowHandMapper
	 */
	this.rhMap = rhMap;

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
	
	/**
	 * Used in ordering selected throws
	 *
	 * @property selectionOrder
	 * @type Number
	 */
	this.selectionOrder = 0;

	/**
	 * Number of throws selected
	 *
	 * @property selections
	 * @type Number
	 */
	this.selections = 0;

	/**
	 * Is the specified throw in MHN+ selected?
	 *
	 * @property isSelected
	 * @type Object
	 */
	this.isSelected = {}; // hash

	/**
	 * Yellow throw-height warning threshold
	 *
	 * @property highThrowHeight
	 * @type Number
	 */
	this.highThrowHeight = 9;
	
	/**
	 * Red throw-height warning threshold
	 *
	 * @property maxThrowHeight
	 * @type Number
	 */
	this.maxThrowHeight = 19; // red warning threshold

	this.beat = 0;
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
	    console.log('ThrowSeq.repeat: iterCnt=' + this.iterCnt);
	    return 1; // restart pattern
	}
	else {
	    this.iterCnt = 0; // reset for next time
	    return null; // finished
	}
    };
    
    /**
     * Alias for rhMap.getHand
     *
     * @method getHand
     * @param row {Number}
     * @param beatRel {Number}
     * @return {Hand} destination hand
     */
    JPRO.ThrowSeq.prototype.getHand = function (row,beatRel) {
	return this.rhMap.getHand(row,beatRel);
    };
    
    /**
     * Increments rowBeats variables, which are used to
     * determine destination hands; increments beat,
     * resetting beat to zero at pattern period.
     *
     * @method nextBeat
     * @return {Boolean} 1 when pattern repeats
     */
    JPRO.ThrowSeq.prototype.nextBeat = function () {
	this.rhMap.nextBeat();
	if (this.beat >= this.mhn[0].length-1) {
	    this.beat = 0;
	    return this.repeat();
	}
	else {
	    this.beat++;
	    return null;
	}
    };

    /**
     * Swap two throws in MHN+ matrix
     *
     * @method swap
     * @param loc1 {Array}
     * @param loc2 {Array}
     */
    JPRO.ThrowSeq.prototype.swap = function(loc1, loc2) {
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
     * Cleans the MHN+ matrix by removing any
     * multiplex slots that exist but are not
     * a throw (i.e. zero throw-height and to
     * the same row).
     *
     * @method clean
     */
    JPRO.ThrowSeq.prototype.clean = function() {
	var i,j;
	for (i=0; i<this.mhn.length; i++) {
	    for (j=0; j<this.mhn[i].length; j++) {
		this.mhn[i][j] = this.cleanList(this.mhn[i][j], i);
	    }
	} // end for i	
    };

    /**
     * Called by clean, this method returns a new (clean)
     * list of (multiplex) throws, with non-throws removed
     * except in the case that there is no throw at all,
     * the list consists of one non-throw (i.e. zero).
     *
     * @method cleanList
     * @param pairs {Array}
     * @param row {Number}
     * @return {Array}
     */
    JPRO.ThrowSeq.prototype.cleanList = function(pairs, row) {
	var rv = [];
	var pair;
	while (pair=pairs.shift) {
	    if ((pair[1] !== 0) || (pair[0] !== row)) {
		rv.push(pair);
	    }
	} // end while
	if (rv === []) {
	    rv = [row,0];
	}
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
    JPRO.ThrowSeq.prototype.select = function(row, col, ms) {
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
    JPRO.ThrowSeq.prototype.getSelectedThrows = function() {
	var a,k,aa,i;
	a = [];
	for (k in this.isSelected) {
	    aa = k.split(',');
	    for (i=0; i<aa.length; i++) {
		aa[i] = parseInt(aa[i]); // convert to int
	    }
	    a.push(aa);
	}
	return a;
    };

    /**
     * Clears all throw selections
     *
     * @method clearSelections
     */
    JPRO.ThrowSeq.prototype.clearSelections = function() {
	var k;
	for (k in this.isSelected) {
	    delete this.isSelected[k];
	    this.selections--;
	}
    };

    /**
     * Displays this MHN+ pattern in HTML as a table
     * which has a number of clickable fields.
     *
     * @method toHtml
     * @return {String} HTML tabular representation of this pattern
     */
    JPRO.ThrowSeq.prototype.toHtml = function() {
	var i, j, k, rv, bcolor;
	var swapEnable, r, t;
	var period = this.mhn[0].length;
	swapEnable = (this.selections === 2) ? '' : 'disabled';
	rv = '<table><colgroup>';
	rv += '<col span=\'1\' id="first_col">';
	rv += '<col span=\'' + period + '\'>';
	rv += '<col span=\'1\' id="last_col">';
	rv += '</colgroup>';
	rv += '<tr><th></th>'; // start heading row
	rv += '<th>0</th>'; // heading col0
	for (j=1; j<period; j++) {
	    rv += '<th>' + j + '</th>';
	}
	rv += '<th>-</th>';
	rv += '</tr>'; // finish heading row
	for (i=0; i<this.mhn.length; i++) {
	    rv += '<tr><td>'; // start row
	    rv += this.toHandSymbol(i);
	    rv += '</td>';
	    for (j=0; j<period; j++) {
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
	    rv += '</td>';
	    rv += '</tr>'; // finish row
	}
	// Final row
	rv += '<tr style=\"background-color:#505050\">'; // start row
	rv += '<td>';
	rv += this.toHandSymbol(this.mhn.length);
	rv += '</td>';
	rv += '<td><button onclick=\"JPRO._swap()\"' + swapEnable + '> Swap </button></td>';
	for (j=1; j<period; j++) {
	    rv += '<td></td>';
	}
	// bottom right cell
	rv += '<td></td>';
	rv += '</tr>'; // finish row
	rv += '</table>';
	return rv;
    };
    
    /**
     * Convert row number to capital letter
     *
     * @method toHandSymbol
     * @param row {Number}
     * @return {String} capital letter representing row number
     */
    JPRO.ThrowSeq.prototype.toHandSymbol = function(row) {
	return String.fromCharCode(65 + row); // A,B,..
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
//	console.log(mhn);
//	console.log(mhnTmp);
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
