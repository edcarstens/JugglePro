/**
 * @author Ed Carstens
 */

/**
 * A JugThrowSeq is a sequence of arrays of JugThrow's corresponding
 * to an MHN row. It may or may not be repeatable. Use non-repeatable
 * JugThrowSeq's to connect from one state to another in between
 * patterns.
 *
 * A juggling pattern is described by an MHN throw matrix, each row
 * of which is a JugThrowSeq, having a RptSeq, a repeatable sequence
 * of JugThrow's. A routine is a sequence of juggling patterns,
 * represented by a HierRptSeq of JugPattern's.
 *
 * @class JugThrowSeq
 * @extends Base
 * @constructor
 * @param jugThrows|mhn {Seq|RptSeq|Number|Array} sequence of JugThrows or MHN row
 * @param dim {Number} dimension of MHN matrix
 * @param iters {Number} number of iterations of throw sequence
 * @param clock {Clock} clock for this JugThrowSeq
 * @param name
 */
JPRO.ID.JugThrowSeq = 0;
JPRO.JugThrowSeq = function(mhn, dim, iters, clock,
			    row, preDwellRatio,
			    postDwellRatio,
			    name) {

    // Call superclass
    this.className = this.className || 'JugThrowSeq';
    JPRO.Base.call(this, name);

    /**
     * Sequence of arrays of JugThrow's
     *
     * @property jugThrows
     * @type RptSeq
     */
    this.jugThrows = this.mhn2Seq(mhn, dim, iters);
    this.w3Colorize();
    this.period = this.jugThrows.itemList.length;
    
    /**
     * Clock for this JugThrowSeq (MHN row)
     *
     * @property clock
     * @type Clock
     */
    this.clock = (clock === undefined) ? new JPRO.Clock() : clock;

    /**
     * MHN row corresponding to this throw sequence
     *
     * @property row
     * @type Number
     */
    this.row = row || 0;
    
    /**
     * Ratio of dwell time before destination beat
     * after catch to (the beat time just prior
     * to destination beat).
     * This setting applies to each JugThrows in
     * itemList, unless overridden.
     *
     * @property preDwellRatio
     * @type Number
     */
    this.preDwellRatio = preDwellRatio ? preDwellRatio : 0;

    /**
     * Ratio of dwell time after current beat before this
     * throw to (the time interval from current beat to
     * the next beat).
     * This setting applies to each JugThrows in
     * itemList, unless overridden.
     * 
     * @property postDwellRatio
     * @type Number
     */
    this.postDwellRatio = postDwellRatio ? postDwellRatio : 0;

};

JPRO.JugThrowSeq.prototype = Object.create(JPRO.Base.prototype);
JPRO.JugThrowSeq.prototype.constructor = JPRO.JugThrowSeq;

JPRO.JugThrowSeq.prototype.mhn2Seq = function(mhn, dim, iters) {
    var cls = mhn.className;
    if ((cls === 'Seq') || (cls === 'RptSeq'))
	return mhn;
    if (dim === 0)
	return new JPRO.RptSeq([[new JPRO.JugThrow(0, mhn)]], iters);
    if (dim === 1)
	return this.ss2Seq(mhn, iters); // siteswap (one row)
    if (dim === 2)
	return this.mp2Seq(mhn, iters); // multiplex (one row)
    if (dim === 3)
	return this.mrss2Seq(mhn, iters); // simple MHN (multi-row siteswap)
    return this.mrmp2Seq(mhn, iters); // MHN+ (multi-row  multiplex)
};

JPRO.JugThrowSeq.prototype.ss2Seq = function(mhn, iters) {
    var j, rv;
    //console.log('ss2Seq called..');
    rv = [];
    for (j=0; j<mhn.length; j++) { // col
	rv.push([new JPRO.JugThrow(0, mhn[j])]);
    }
    return new JPRO.RptSeq(rv, iters);
};

JPRO.JugThrowSeq.prototype.mp2Seq = function(mhn, iters) {
    var j, k, mt, rv;
    //console.log('mp2Seq called..');
    rv = [];
    for (j=0; j<mhn.length; j++) { // col
	mt = [];
	for (k=0; k<mhn[j].length; k++) { // multiplex throw
	    mt.push([new JPRO.JugThrow(0, mhn[j][k])]);
	}
	rv.push(mt);
    }
    return new JPRO.RptSeq(rv, iters);
};

JPRO.JugThrowSeq.prototype.mrss2Seq = function(mhn, iters) {
    var j, rv, x, x2;
    //console.log('mrss2Seq called..');
    rv = [];
    for (j=0; j<mhn.length; j++) { // col
	x = mhn[j];
	x2 = 0;
	if (x.length > 2) x2 = x[2];
	rv.push([new JPRO.JugThrow(x[0], x[1], x2)]);
    }
    return new JPRO.RptSeq(rv, iters);
};

JPRO.JugThrowSeq.prototype.mrmp2Seq = function(mhn, iters) {
    var j, k, mt, rv, x, x2;
    //console.log('mrmp2Seq called..');
    rv = [];
    for (j=0; j<mhn.length; j++) { // col
	mt = [];
	for (k=0; k<mhn[j].length; k++) {
	    x = mhn[j][k];
	    x2 = 0;
	    if (x.length > 2) x2 = x[2];
	    mt.push(new JPRO.JugThrow(x[0], x[1], x2));
	}
	rv.push(mt);
    }
    return new JPRO.RptSeq(rv, iters);
};

/**
 * Copy
 *
 * @method copy
 * @param objHash {Object} tracks all copied objects
 * @param cFunc {Function} constructor function
 * @return {JugThrowSeq} copied JugThrowSeq
 */
JPRO.JugThrowSeq.prototype.copy = function(objHash, cFunc) {
//    var obj = JPRO.Seq.prototype.copy.call(this, objHash, cFunc);
    var scalars = ['preDwellRatio','postDwellRatio'];
    //var cf = function() { return obj; };
    return this.directedCopy(objHash, cFunc, {}, scalars);
};

/**
 * isZeros
 *
 * @method isZeros
 * @return {Boolean} true only if all throws are self zero
 */
JPRO.JugThrowSeq.prototype.isZeros = function() {
    var j,k,jt,jtjk,rv;
    jt = this.jugThrows.itemList;
    rv = 1;
    for (j=0; j<jt.length; j++) {
	for (k=0; k<jt[j].length; k++) {
	    jtjk = jt[j][k];
	    if ((jtjk.destRow !== this.row) || (jtjk.fltBeats !== 0) ||
		(jtjk.destBeats !== 0))
		rv = null;
	}
    }
    return rv;
};

/**
 */
JPRO.JugThrowSeq.prototype.push = function(item) {
    this.jugThrows.push(item);
    this.w3Colorize();
    this.period++;
};

/**
 */
JPRO.JugThrowSeq.prototype.w3Colorize = function() {
    var jt,j,k,colorTable,row,col;
    colorTable = [['w3-light-blue', 'w3-jp-light-blue'],
		  ['w3-khaki', 'w3-jp-khaki']];
    jt = this.jugThrows.itemList;
    row = 0;
    for (j=0; j<jt.length; j++) {
	col = 0;
	for (k=0; k<jt[j].length; k++) {
	    jt[j][k].w3Color = colorTable[row][col];
	    col = 1 - col; // brighten
	}
	row = 1 - row; // alternate hue
    }
    return this;
};

/**
 * Return JugThrow's at specified col
 *
 * @method getJugThrow
 * @param col {Number}
 * @return {Array}
 */
JPRO.JugThrowSeq.prototype.getJugThrows = function(col) {
    return this.jugThrows.itemList[col];
};

/**
 * Return JugThrow at specified col and mslot
 *
 * @method getJugThrow
 * @param col {Number}
 * @param mslot {Number}
 * @return {JugThrow}
 */
JPRO.JugThrowSeq.prototype.getJugThrow = function(col, mslot) {
    return this.jugThrows.itemList[col][mslot];
};

/**
 * Converts this sequence of throws to MHN+ row
 *
 * @method getMHN
 * @return {Array} MHN+ row (a 3-d matrix)
 */
JPRO.JugThrowSeq.prototype.getMHN = function() {
    var mhn,j,tm,mt,k,r,t,td,jt;
    mhn = [];
    for (j=0; j<this.period; j++) {
	// Get list of multiplex throws
	tm = this.jugThrows.itemList[j];
	mt = [];
	for (k=0; k<tm.length; k++) {
	    r  = tm[k].destRow;
	    t  = tm[k].fltBeats;
	    td = tm[k].destBeats;
	    jt = [r,t];
	    if (td !== 0) jt.push(td);
	    mt.push(jt);
	}
	mhn.push(mt);
    }
    return mhn;
};

/**
 * Add multiple of the period to a throw
 *
 * @method translateThrow
 * @param loc {Array} this is [t,ms]
 * @param mult {Number}
 * @return {JugThrowSeq} this object
 */
JPRO.JugThrowSeq.prototype.translateThrow = function(loc, mult) {
    var t = loc[0];
    var ms = loc[1];
    var jt = this.jugThrows.itemList[t][ms];
    var mult1 = (mult === undefined) ? 1 : mult; // default to 1
    jt.fltBeats += mult1 * this.period;
    return this;
};

/**
 * Return maximum number of multiplex throws and extend all
 * multiplex slots with zeros to the same number of throws.
 *
 * @method getMultiplex
 * @return {Number} number of multiplex throws (slots)
 */
JPRO.JugThrowSeq.prototype.getMultiplex = function() {
    var jt,i,j,mslots,rv;
    rv = 0;
    jt = this.jugThrows.itemList;
    for (j=0; j<jt.length; j++) {
	mslots = jt[j].length;
	if (mslots > rv) {
	    rv = mslots;
	}
    }
    // Extend multiplex slots with zeros where necessary
    jt = this.jugThrows.itemList;
    for (j=0; j<jt.length; j++) {
	while (jt[j].length < rv) {
	    jt[j].push(new JPRO.JugThrow(this.row, 0));
	}
    }
    return rv
};

/**
 * Add offset to all throws in MHN row
 *
 * @method translateRow
 * @param offset {Number}
 * @return {Number} add this number to the total number of props juggled
 */
JPRO.JugThrowSeq.prototype.translateRow = function(offset) {
    var j,k,tm,jt,njt;
    var offset1 = (offset === undefined) ? 1 : offset; // default to 1
    var mslots = this.getMultiplex();
    njt = [];
    jt = this.jugThrows.itemList;
    for (j=0; j<jt.length; j++) {
	idx = (j + offset1 + jt.length) % jt.length;
	tm = jt[idx];
	for (k=0; k<tm.length; k++) {
	    tm[k].fltBeats += offset1;
	}
	njt.push(tm);
    }
    this.jugThrows.itemList = njt;
    this.w3Colorize();
    return (mslots * offset1);
};

/**
 * Add new multiplex slots to this MHN row
 *
 * @method multiplexTranslate
 * @param offset {Number}
 * @return {JugThrowSeq} this object
 */
JPRO.JugThrowSeq.prototype.multiplexTranslate = function(offset) {
    var j;
    var offset1 = (offset === undefined) ? 1 : offset; // default offset to 1
    var jt = this.jugThrows.itemList;
    if (jt[0].length >= 4) { // button-happy kid proof this
	alert('No more than 4 multiplex slots allowed per row');
	return this;
    }
    for (j=0; j<jt.length; j++) {
	// new multiplex slot pair
	jt[j].push(new JPRO.JugThrow(this.row, offset1));
    }
    return this;
};

/**
 * Updates throw destination rows per MHN row permutation
 * This is called by JugPattern.permuteRows
 * @method permuteRows
 * @param mapping {Array}
 * @return {JugThrowSeq} this object
 */
JPRO.JugThrowSeq.prototype.permuteRows = function(mapping) {
    var j,jt,k;
    jt = this.jugThrows.itemList;
    for (j=0; j<jt.length; j++) {
	for (k=0; k<jt[j].length; k++) {
	    jt[j][k].destRow = mapping[jt[j][k].destRow];
	}
    }
    return this;
};

/**
 * Cleans the MHN+ matrix by removing any
 * multiplex slots that exist but are not
 * a throw (i.e. zero throw-height and to
 * the same row).
 *
 * @method clean
 * @return {JugThrowSeq} this object
 */
JPRO.JugThrowSeq.prototype.clean = function() {
    var jt,j;
    jt = this.jugThrows.itemList;
    for (j=0; j<jt.length; j++) {
	jt[j] = this.cleanList(jt[j]);
    }
    return this;
};

/**
 * Called by clean, this method returns a new (clean)
 * list of (multiplex) throws, with non-throws removed
 * except in the case that there is no throw at all,
 * the list consists of one non-throw (i.e. zero).
 *
 * @method cleanList
 * @param mt {Array} multiplex throws
 * @param row {Number}
 * @return {Array}
 */
JPRO.JugThrowSeq.prototype.cleanList = function(mt) {
    var rv = [];
    var k,t;
    for (k=0; k<mt.length; k++) {
	t = mt[k];
	if ((t.fltBeats !== 0) || (t.destRow !== this.row)) {
	    rv.push(t);
	}
    } // end for k
    // If all were removed, put one in as a placeholder
    if (rv.length === 0) {
	rv = [new JPRO.JugThrow(this.row,0)];
    }
    //console.log('cleanList returns ' + rv);
    //console.log(rv);
    return rv;
};

/**
 * Displays this MHN+ pattern in HTML as a table
 * which has a number of clickable fields.
 *
 * @method toHtml
 * @return {String} HTML tabular representation of this pattern
 */
/*JPRO.JugThrowSeq.prototype.toHtml = function() {
    var i, j, k, rv, bcolor;
    var swapEnable, r, t;
    var period = this.period;
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
    for (i=0; i<this.rows; i++) {
	rv += '<tr><td>'; // start row
	rv += this.toHandSymbol(i);
	rv += '</td>';
	for (j=0; j<period; j++) {
	    rv += '<td>';
	    //for (k=0; k<this.mhn[i][j].length; k++) {
	    for (k=0; k<this.itemList[j].throwMatrix[i].length; k++) {
		//r = this.mhn[i][j][k][0]; // destination row
		//t = this.mhn[i][j][k][1]; // destination beat (relative)
		r = this.itemList[j].throwMatrix[i][k].destRow;
		t = this.itemList[j].throwMatrix[i][k].fltTime;

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
    rv += this.toHandSymbol(this.rows);
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
*/
