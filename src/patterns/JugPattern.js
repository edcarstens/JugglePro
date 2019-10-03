/**
 * @author Ed Carstens
 */

/**
 * A JugPattern is a juggling pattern, a set of  periodic (repeatable)
 * sequences of throws involving one or more jugglers. It could represent
 * a non-repeatable sequence of throws, in which case the isRepeatable
 * flag is null and iters is either 0 or 1.
 *
 * @class JugPattern
 * @extends Base
 * @constructor
 * @param mhn {Number|Array} siteswap, multiplex, MHN, or MHN+ throw matrix
 * @param clocks {Array} array of Clock objects (one for each MHN row)
 * @param cpm {ControlPointMapper} maps each beat to a control point
 * @param iters {Number} number of iterations of pattern to be executed
 * @param name {String} name of this object
 *
 */
(function () {

    'use strict';
    JPRO.ID.JugPattern = 0;
    JPRO.JugPattern = function(mhn, clocks, cpm, iters, name) {

	// Call superclass
	this.className = this.className || 'JugPattern';
	JPRO.Base.call(this, name);
	
	/**
	 * Array of clocks for this pattern
	 *
	 * @property clocks
	 * @type Array
	 */
	if (clocks) {
	    this.clocks = clocks;
	}
	//this.clocks = clocks || [];
	
	/**
	 * Array of jugThrowSeq's for this pattern (MHN rows)
	 *
	 * @property jugThrowSeqs
	 * @type Array
	 */
	this.jugThrowSeqs = [];
	
	/**
	 * Control point mapper
	 *
	 * @property cpMapper
	 * @type Array
	 *
	 */
	this.cpMapper = cpm || [];

	/**
	 * Iterations
	 *
	 * @property iters
	 * @type Number
	 */
	if (iters === undefined) {
	    this.iters = 1;
	    this.isRepeatable = null;
	}
	else if (iters === null) {
	    this.iters = 0;
	    this.isRepeatable = null;
	}
	else {
	    this.iters = iters;
	    this.isRepeatable = 1;
	}
	
	mhn = mhn || 0;
	// Convert MHN by using JugThrowSeq constructor
	// for each row of MHN
	var clk;
	var dim = this.dimensionOf(mhn);
	if (dim < 3) { // only one MHN row
	    this.setJugThrowSeqs1(mhn, dim, iters, clocks, cpm);
	}
	else { // multiple MHN rows
	    this.setJugThrowSeqsN(mhn, dim, iters, clocks, cpm);
	}

	/**
	 * Maximum number of rows
	 *
	 * @property maxRows
	 * @type Number
	 */
	this.maxRows = 10; // limit to 10 rows
	
	/**
	 * Maximum period
	 *
	 * @property maxPeriod
	 * @type Number
	 */
	this.maxPeriod = 32;
	
	/**
	 * Used in ordering selected throws
	 *
	 * @property selectionOrder
	 * @type Number
	 */
	//this.selectionOrder = 0;

	/**
	 * Number of throws selected
	 *
	 * @property selections
	 * @type Number
	 */
	//this.selections = 0;

	this.throwRep = 0; // 1=show flight times, 0=show beats.dbeats.offset
	this.states = [];
	this.undoIdx = 0;
	// inherit some stuff from JugThrowSeq
	//this.rows = tmp.rows;
	//this.getMHN = tmp.getMHN;

	// methods
	//this.swap = tmp.swap;
	//this.clean = tmp.clean;
	//this.cleanList = tmp.cleanList;
	//this.select = tmp.select;
	//this.getSelectedThrows = tmp.getSelectedThrows;
	//this.clearSelections = tmp.clearSelections;
	//this.toHandSymbol = tmp.toHandSymbol;
	//this.period = tmp.period;
	
	/**
	 * number of props juggled
	 *
	 * @property props
	 * @type Number
	 */
	this.props = this.calcProps();
	//this.props = JPRO.JugPattern.prototype.calcProps.call(this);
	this.calcFlightTimes();
    };

    JPRO.JugPattern.prototype = Object.create( JPRO.Base.prototype );
    JPRO.JugPattern.prototype.constructor = JPRO.JugPattern;

    JPRO.JugPattern.prototype.dimensionOf = function(x, dim) {
	var typ, d;
	typ = typeof(x);
	d = dim || 0;
	if (typ === 'number') {
	    return d;
	}
	else {
	    return this.dimensionOf(x[0], d+1);
	}
    };

    JPRO.JugPattern.prototype.setJugThrowSeqs1 = function(mhn, dim, iters, clocks, cpm) {
	var clk,beatLst,j,r;
	this.rows = 1;
	if (clocks) {
	    clk = clocks[0];
	    clk.mhnRows = [0];
	}
	else {
	    //clk = new JPRO.Clock();
	    beatLst = [];
	    if (dim === 0) {
		beatLst.push(12);
	    }
	    else {
		for (j=0; j<mhn.length; j++) {
		    beatLst.push(12);
		}
	    }
	    r = JPRO.HierRptSeq.create(beatLst, -1);
	    clk = new JPRO.Clock(1, r);
	    this.clocks = [clk];
	    clk.mhnRows.push(0);
	}
	if (!cpm) {
	    this.cpMapper = [JPRO.HierRptSeq.create([0,1], -1)];
	}
	this.jugThrowSeqs.push(new JPRO.JugThrowSeq(mhn, dim, iters,
						    clk, 0, this.cpMapper[0]));
    };

    JPRO.JugPattern.prototype.setJugThrowSeqsN = function(mhn, dim, iters, clocks, cpm) {
	var i,jts,p2c,pd,maxPd,basePeriod,totalTime;
	var t,err,j,rt,beatLst,r,clk;
	var slowFast = null;
	var bp0 = mhn[0].length;
	this.rows = mhn.length;
	// Find maximum period
	// Is any MHN row beat period different?
	maxPd = 0;
	basePeriod = 12;
	for (i=0; i<this.rows; i++) {
	    if (mhn[i].length !== bp0) slowFast = 1;
	    if (mhn[i].length > maxPd) maxPd = mhn[i].length;
	}
	totalTime = basePeriod * maxPd;
	// Is the destination throw-height specified?
	if ((dim === 3) && (mhn[0][0].length > 2)) {
	    slowFast = 1;
	}
	if ((dim === 4) && (mhn[0][0][0].length > 2)) {
	    slowFast = 1;
	}
	if (!cpm) {
	    for (i=0; i<this.rows; i++) {
		this.cpMapper.push(JPRO.HierRptSeq.create([0,1], -1));
	    }
	}
	if (clocks) {
	    // Clocks specified
	    for (i=0; i<this.rows; i++) {
		clocks[i].mhnRows.push(i);
		jts = new JPRO.JugThrowSeq(mhn[i], dim, iters, clocks[i], i, this.cpMapper[i]);
		this.jugThrowSeqs.push(jts);
	    }
	}
	else if (slowFast) {
	    // If the MHN indicates a slow-fast pattern, create clocks
	    // with different periods as needed for each row.
	    p2c = {};
	    this.clocks = [];
	    for (i=0; i<this.rows; i++) {
		pd = mhn[i].length;
		if (p2c[pd]) {
		    p2c[pd].mhnRows.push(i);
		}
		else {
		    beatLst = [];
		    //basePeriod = 120/pd; // only handles pd=1 up to 6
		    t = totalTime/pd;
		    err = 0;
		    for (j=0; j<pd; j++) {
			rt = Math.round(t + err);
			err = t - rt;
			beatLst.push(rt);
		    }
		    r = JPRO.HierRptSeq.create(beatLst, -1);
		    p2c[pd] = new JPRO.Clock(1, r);
		    p2c[pd].mhnRows = [i];
		    this.clocks.push(p2c[pd]);
		}
		jts = new JPRO.JugThrowSeq(mhn[i], dim, iters, p2c[pd], i, this.cpMapper[i]);
		this.jugThrowSeqs.push(jts);
	    }
	    //console.log('jugThrowSeqs');
	    //console.log(this.jugThrowSeqs);
	}
	else {
	    // If the MHN does not indicate a slow-fast pattern, use
	    // just one clock for all rows
	    //clk = new JPRO.Clock();
	    beatLst = [];
	    for (j=0; j<mhn[0].length; j++) {
		beatLst.push(12);
	    }
	    r = JPRO.HierRptSeq.create(beatLst, -1);
	    clk = new JPRO.Clock(1, r);
	    this.clocks = [clk];
	    this.clocks.push(clk);
	    for (i=0; i<this.rows; i++) {
		clk.mhnRows.push(i);
		jts = new JPRO.JugThrowSeq(mhn[i], dim, iters, clk, i, this.cpMapper[i]);
		this.jugThrowSeqs.push(jts);
	    }
	}
    };
    
    /**
     * Copies this JugPattern
     *
     * @method copy
     * @param objHash {Object} hash
     * @param cFunc {Function} constructor
     * @return {JugPattern} copied object
     */
    JPRO.JugPattern.prototype.copy = function(objHash, cFunc) {
	var scalars = ['iters', 'isRepeatable', 'maxRows', 'maxPeriod', 'undoIdx', 'rows'];
	var pFuncs = {'cpMapper':JPRO.Common.copyObjVector,
		      'jugThrowSeqs':JPRO.Common.copyObjVector,
		      'states':function(p,objHash) {return p.slice(0)},
		      'clocks':JPRO.Common.copyObjVector};
	var objects = null; //['cpMapper'];
	return this.directedCopy(objHash, cFunc, pFuncs, scalars, objects);
    };
    
    /**
     * Facilitates MHN operations (outer loop on MHN rows)
     *
     * @method forI
     * @param h {Object} hash used as scope container
     * @param f {Function} f(h), operation to be applied inside loop
     * @return {Object} scope container
     */
    JPRO.JugPattern.prototype.forI = function(a1,a2) {
	var f = a2 || a1;
	var h = a2 ? a1 : {};
	h.parent = this;
	for (h.i=0; h.i<this.jugThrowSeqs.length; h.i++) {
	    h.jts = this.jugThrowSeqs[h.i];
	    h.clk = h.jts.clock;
	    h.jt = h.jts.jugThrows.itemList;
	    f(h);
	}
	return h;
    };
    
    /**
     * Facilitates MHN operations (inner loop on MHN cols)
     *
     * @method forJ
     * @param h {Object} hash used as scope container
     * @param f {Function} f(h), operation to be applied inside loop
     * @return {Object} scope container
     */
    JPRO.JugPattern.prototype.forJ = function(a1,a2) {
	var f = a2 || a1;
	var h = a2 ? a1 : {};
	for (h.j=0; h.j<h.jt.length; h.j++) {
	    h.jtj = h.jt[h.j];
	    f(h);
	}
	return h;
    };

    /**
     * Facilitates MHN operations (innermost loop on MHN multiplexed throws)
     *
     * @method forK
     * @param h {Object} hash used as scope container
     * @param f {Function} f(h), operation to be applied inside loop
     * @return {Object} scope container
     */
    JPRO.JugPattern.prototype.forK = function(a1,a2) {
	var f = a2 || a1;
	var h = a2 ? a1 : {};
	for (h.k=0; h.k<h.jtj.length; h.k++) {
	    h.jtjk = h.jtj[h.k];
	    f(h);
	}
	return h;
    };

    JPRO.JugPattern.prototype.forIJ = function(a1,a2) {
	var f = a2 || a1;
	var h = a2 ? a1 : {};
	return this.forI(h, function(h) {
	    h.parent.forJ(h, f);
	});
    };
    
    JPRO.JugPattern.prototype.forIJK = function(a1,a2) {
	var f = a2 || a1;
	var h = a2 ? a1 : {};
	return this.forIJ(h, function(h) {
	    h.parent.forK(h, f);
	});
    };
    
    /**
     * Converts this pattern of throws to MHN+ matrix
     *
     * @method getMHN
     * @return {Array} MHN+ (a 4-d matrix)
     */
    JPRO.JugPattern.prototype.getMHN = function() {
	var h = {};
	h.mhn = [];
	this.forI(h, function(h) {
	    h.mhn.push(h.jts.getMHN());
	});
	return h.mhn;
    };

    /**
     * Set a null pattern with specified period and number of rows
     *
     * @method setPeriodRows
     * @param period {Number}
     * @param rows {Number}  If omitted, rows=1
     */
    JPRO.JugPattern.prototype.setPeriodRows = function(period, rows) {
	var i,j,r,s,clk,beatLst;
	beatLst = [];
	for (j=0; j<period; j++) {
	    beatLst.push(12);
	}
	r = JPRO.HierRptSeq.create(beatLst, -1);
	clk = new JPRO.Clock(1, r);
	this.jugThrowSeqs = [];
	this.rows = rows || 1;
	for (i=0; i<this.rows; i++) {
	    r = [];
	    for (j=0; j<period; j++) {
		r.push([new JPRO.JugThrow(i,0)]);
	    }
	    s = new JPRO.RptSeq(r, this.iters);
	    this.jugThrowSeqs.push(
		new JPRO.JugThrowSeq(s, 0, this.iters, clk, i, 0.5)
	    );
	}
	this.props = 0;
	return this;
    };
    
    /**
     * Return JugThrow at specified row, col, and mslot
     *
     * @method getJugThrow
     * @param row {Number}
     * @param col {Number}
     * @param mslot {Number}
     * @return {JugThrow}
     */
    JPRO.JugPattern.prototype.getJugThrow = function(row, col, mslot) {
	return this.jugThrowSeqs[row].jugThrows.itemList[col][mslot];
    };

    /**
     * Return array of JugThrow's at specified row and col
     *
     * @method getJugThrows
     * @param row {Number}
     * @param col {Number}
     * @return {Array}
     */
    JPRO.JugPattern.prototype.getJugThrows = function(row, col) {
	return this.jugThrowSeqs[row].jugThrows.itemList[col];
    };

    JPRO.JugPattern.prototype.calcFlightTime = function(loc1, jt) {
	//console.log('calcFlightTime called..');
	var r1 = loc1[0];
	var t1 = loc1[1];
	var p1 = jt || this.getJugThrow(r1, t1, loc1[2]);
	var p1SyncOffset = p1.syncOffset || 0;
	if (this.jugThrowSeqs[r1].clock.rhythm.getItem(0) < 0)
	    t1--; // this row starts with a split beat
	var p1r = p1.destRow;
	var p1t = p1.fltBeats - p1.destBeats + t1; // absolute sync/dest beat
	var p1td = p1.destBeats; // plus destination beats
	var p1tt = this.jugThrowSeqs[r1].clock.getInterval(0, p1t) + p1SyncOffset; // p1t converted to base time
	var s = this.jugThrowSeqs[p1r].clock.findSync(p1tt);
	var p1s = s.b; // src-dest sync point in dest beats
	var p1dta = p1s + p1td; // absolute dest beat
	var p1dtt = this.jugThrowSeqs[p1r].clock.getInterval(0, p1dta) + s.ofs; // p1dta converted to base time
	//var p1dtt = this.jugThrowSeqs[p1r].clock.getInterval(0, p1dta); // p1dta converted to base time

	// calculate flight time
	p1.fltTime = p1dtt - this.jugThrowSeqs[r1].clock.getInterval(0, t1);
	return p1.fltTime;
    };
    
    JPRO.JugPattern.prototype.calcFlightTimes = function() {
	var h = {};
	h.JugPatternObj = this;
	this.forIJK(h, function(h) {
	    h.JugPatternObj.calcFlightTime([h.i, h.j, h.k], h.jtjk);
	});
    };
    
    /**
     * Swap two throws in MHN+ matrix
     *
     * @method swap
     * @param loc1 {Array}
     * @param loc2 {Array}
     * @return {JugPattern} this object
     */
    JPRO.JugPattern.prototype.swap = function(loc1, loc2) {
	var r1 = loc1[0];
	var t1 = loc1[1];
	var ms1 = loc1[2];
	var f1 = this.jugThrowSeqs[r1].period;
	var r2 = loc2[0];
	var t2 = loc2[1];
	var ms2 = loc2[2];
	var f2 = this.jugThrowSeqs[r2].period;
	var p1 = this.getJugThrow(r1, t1, ms1);
	var p2 = this.getJugThrow(r2, t2, ms2);
	var p1SyncOffset = p1.syncOffset || 0;
	var p2SyncOffset = p2.syncOffset || 0;
	//console.log('p1=');
	//console.log(p1);
	if (this.jugThrowSeqs[r1].clock.rhythm.getItem(0) < 0)
	    t1--; // this row starts with a split beat
	if (this.jugThrowSeqs[r2].clock.rhythm.getItem(0) < 0)
	    t2--; // this row starts with a split beat
	var p1r = p1.destRow;
	var p1t = p1.fltBeats - p1.destBeats + t1; // absolute sync/dest beat
	var p1td = p1.destBeats; // plus destination beats
	var p1f = this.jugThrowSeqs[p1r].period;
	var p2r = p2.destRow;
	var p2t = p2.fltBeats - p2.destBeats + t2; // absolute sync/dest beat
	var p2td = p2.destBeats; // plus destination beats
	var p2f = this.jugThrowSeqs[p2r].period;
	// Swap destination rows
	p1.destRow = p2r;
	p2.destRow = p1r;

	if (1) {
	    // New approach
	    var p1tt = this.jugThrowSeqs[r1].clock.getInterval(0, p1t) + p1SyncOffset; // p1t converted to base time
	    var s = this.jugThrowSeqs[p1r].clock.findSync(p1tt);
	    var p1s = s.b; // src-dest sync point in dest beats
	    var p1dta = p1s + p1td; // absolute dest beat
	    var p1dtt = this.jugThrowSeqs[p1r].clock.getInterval(0, p1dta) + s.ofs; // p1dta converted to base time
	    // if destination is the same clock as loc2's row (r2)
	    if (this.jugThrowSeqs[r2].clock === this.jugThrowSeqs[p1r].clock) {
		//console.log('same clock2');
		p2.destBeats = 0;
		s = this.jugThrowSeqs[r2].clock.findSync(p1dtt);
		p2.fltBeats = s.b - t2;
		p2.syncOffset = s.ofs;
	    }
	    else {
		// find a good sync point for p1dta relative to the row r2 clock
		var x = this.jugThrowSeqs[r2].clock.findBestSync(this.jugThrowSeqs[p1r].clock, p1dta);
		p2.destBeats = x.dBeats;
		p2.fltBeats = x.sBeats - t2 + x.dBeats;
		p2.syncOffset = x.sOffset;
		//console.log('t2=' + t2);
		//console.log(x);
		//console.log(p2);
	    }
	    
	    var p2tt = this.jugThrowSeqs[r2].clock.getInterval(0, p2t) + p2SyncOffset; // p2t converted to base time
	    s = this.jugThrowSeqs[p2r].clock.findSync(p2tt);
	    var p2s = s.b; // src-dest sync point in dest beats
	    var p2dta = p2s + p2td; // absolute dest beat
	    var p2dtt = this.jugThrowSeqs[p2r].clock.getInterval(0, p2dta) + s.ofs; // p2dta converted to base time
	    //console.log('p2tt=' + p2tt + ' p2s=' + p2s + ' p2dta=' + p2dta + ' p2dtt=' + p2dtt);
	    // if destination is the same clock as loc1's row (r1)
	    if (this.jugThrowSeqs[r1].clock === this.jugThrowSeqs[p2r].clock) {
		//console.log('same clock1');
		p1.destBeats = 0;
		s = this.jugThrowSeqs[r1].clock.findSync(p2dtt);
		p1.fltBeats = s.b - t1;
		p1.syncOffset = s.ofs;
		//console.log('p2dtt=' + p2dtt + ' b=' + s.b);
	    }
	    else {
		var x = this.jugThrowSeqs[r1].clock.findBestSync(this.jugThrowSeqs[p2r].clock, p2dta);
		p1.destBeats = x.dBeats;
		p1.fltBeats = x.sBeats - t1 + x.dBeats;
		p1.syncOffset = x.sOffset;
		//console.log('t1=' + t1);
		//console.log(x);
		//console.log(p1);
	    }
	    // Update flight times
	    this.calcFlightTime(loc1, p1);
	    this.calcFlightTime(loc2, p2);
	}
	else {
	    // Old approach
	    
	    // Convert p2 self beats into (N periods + T self beats)
	    var n2 = 0;
	    while (p2t >= f2) {
		p2t -= f2;
		n2++;
	    }
	    while (p2t < 0) {
		p2t += f2;
		n2--;
	    }
	    //console.log('r2 = ' + r2 + 't2 = ' + t2);
	    //console.log('n2 = ' + n2);
	    //console.log('p2t = ' + p2t);
	    //console.log('p2td = ' + p2td);
	    p1.destBeats = (p2td === 0) ? p2t : p2td;
	    p1.fltBeats = p1.destBeats + n2*f1 - t1;
	    //console.log('destBeats = ' + p1.destBeats);
	    //console.log('fltBeats = ' + p1.fltBeats);
	    // If destination clock is the same, then the destination beats
	    // are the same as self beats, so clear destBeats
	    if (this.jugThrowSeqs[r1].clock === this.jugThrowSeqs[p2r].clock) {
		p1.destBeats = 0;
	    }
	    // Choose to minimize destination beats
	    while (p1.destBeats > p2f/2) {
		p1.destBeats -= p2f;
		p1.fltBeats += f1-p2f;
	    }
	    while (p1.destBeats < -p2f/2) {
		p1.destBeats += p2f;
		p1.fltBeats += p2f-f1;
	    }
	    
	    // Do the same with throw p2
	    // Convert p1 self beats into (N periods + T self beats)
	    var n1 = 0;
	    //console.log('p1t = ' + p1t);
	    //console.log('f1 = ' + f1);
	    while (p1t >= f1) {
		p1t -= f1;
		n1++;
	    }
	    while (p1t < 0) {
		p1t += f1;
		n1--;
	    }
	    //console.log('n1 = ' + n1);
	    //console.log('p1t = ' + p1t);
	    //console.log('p1td = ' + p1td);
	    p2.destBeats = (p1td === 0) ? p1t : p1td;
	    p2.fltBeats = p2.destBeats + n1*f2 - t2;
	    //console.log('destBeats = ' + p2.destBeats);
	    //console.log('fltBeats = ' + p2.fltBeats);
	    // If destination clock is the same, then the destination beats
	    // are the same as self beats, so clear destBeats
	    if (this.jugThrowSeqs[r2].clock === this.jugThrowSeqs[p1r].clock) {
		p2.destBeats = 0;
	    }
	    // Choose to minimize destination beats
	    while (p2.destBeats > p1f/2) {
		p2.destBeats -= p1f;
		p2.fltBeats += f2-p1f;
	    }
	    while (p2.destBeats < -p1f/2) {
		p2.destBeats += p1f;
	    p2.fltBeats += p1f-f2;
	    }
	}
	return this;
    };

    /**
     * 
     */
    JPRO.JugPattern.prototype.modDestBeat = function(loc1, x) {
	var r1 = loc1[0];
	var t1 = loc1[1];
	var ms1 = loc1[2];
	var p1 = this.getJugThrow(r1, t1, ms1);
	var f1 = this.jugThrowSeqs[r1].period;
	var p1r = p1.destRow;
	var p1f = this.jugThrowSeqs[p1r].period;
	var p1td = p1.destBeats;
	if (this.jugThrowSeqs[r1].clock.rhythm.getItem(0) < 0)
	    t1--;
	var spd = f1;
	var p1t = p1.fltBeats - p1td + t1 + spd; // absolute self beat
	var p1SyncOffset = p1.syncOffset || 0;
	if (1) {
	    // New approach
	    var p1tt = this.jugThrowSeqs[r1].clock.getInterval(0, p1t) + p1SyncOffset; // p1t converted to base time
	    var s = this.jugThrowSeqs[p1r].clock.findSync(p1tt);
	    //var p1s = s.b; // src-dest sync point in dest beats
	    var p1dta = s.b + p1td; // absolute dest beat
	    var p1dtt = this.jugThrowSeqs[p1r].clock.getInterval(0, p1dta); // p1dta converted to base time
	    p1td += x; // modify the # of dest beats
	    if (p1dta > p1td) {
		var p1stt = this.jugThrowSeqs[p1r].clock.getInterval(0, p1dta - p1td); // new self-beat base time
		console.log('p1td=' + p1td + ' p1tt=' + p1tt + ' p1dta=' + p1dta + ' p1dtt=' + p1dtt + ' p1stt=' + p1stt);
		var ns = this.jugThrowSeqs[r1].clock.findSync(p1stt,1); // round down if in middle of self beat
		console.log(ns);
		p1.destBeats = p1td;
		p1.fltBeats = p1td + ns.b - t1 - spd;
		p1.syncOffset = ns.ofs;
	    }
	    else {
		console.log('too few self beats');
	    }
	}
	else {
	    // old approach
	    p1t -= x*f1;
	    p1td += x*p1f;
	    p1.destBeats = p1td;
	    p1.fltBeats = p1t + p1td;
	}
	return this;
    };
    
    /**
     * Return maximum number of multiplex throws and extend all
     * multiplex slots with zeros to the same number of throws.
     *
     * @method getMultiplex
     * @return {Number} number of multiplex throws (slots)
     */
    JPRO.JugPattern.prototype.getMultiplex = function() {
	var i,mslots,rv;
	rv = 0;
	for (i=0; i<this.jugThrowSeqs.length; i++) {
	    mslots = this.jugThrowSeqs[i].getMultiplex();
	    if (mslots > rv) {
		rv = mslots;
	    }
	}
	return rv;
    };
    
    /**
     * Add offset to all throws in MHN row
     *
     * @method translateRow
     * @param offset {Number}
     * @return {JugPattern} this pattern
     */
    JPRO.JugPattern.prototype.translateRow = function(row, offset) {
	this.props += this.jugThrowSeqs[row].translateRow(offset);
	this.calcFlightTimes();
	return this;
    };

    /**
     * Adds an offset to all throws in the throw matrix
     *
     * @method translateAll
     * @param offset {Number}
     * @return {JugPattern} this pattern
     */
    JPRO.JugPattern.prototype.translateAll = function(offset) {
	var i;
	for (i=0; i<this.jugThrowSeqs.length; i++) {
	    this.translateRow(i, offset);
	}
	return this;
    };

    /**
     * Add multiple of the period to a throw
     *
     * @method translateThrow
     * @param loc {Array}
     * @param mult {Number}
     * @return {JugPattern} this pattern
     */
    JPRO.JugPattern.prototype.translateThrow = function(loc, mult) {
	var r = loc.shift();
	var jtSeq = this.jugThrowSeqs[r];
	var mult1 = (mult === undefined) ? 1 : mult; // default to 1
	jtSeq.translateThrow(loc, mult1);
	this.props += mult1;
	this.calcFlightTime([r, loc[0], loc[1]]);
	return this;
    };

    /**
     * Adds multiple of the period to selected throws
     *
     * @method translateThrowsSelected
     * @param mult {Number}
     * @return {JugPattern} this pattern
     */
    JPRO.JugPattern.prototype.translateThrowsSelected = function(mult) {
	var a,i;
	a = this.getSelectedThrows();
	for (i=0; i<a.length; i++) {
	    this.translateThrow(a[i], mult);
	}
	return this;
    };
    
    /**
     * Add new multiplex slots to specified MHN row
     *
     * @method multiplexTranslate
     * @param row {Number}
     * @param offset {Number}
     */
    JPRO.JugPattern.prototype.multiplexTranslate = function(row, offset) {
	var j;
	var row1 = row || 0; // default row to zero
	var offset1 = (offset === undefined) ? 1 : offset; // default offset to 1
	this.jugThrowSeqs[row1].multiplexTranslate(offset1);
	this.props += offset1;
	this.jugThrowSeqs[row1].w3Colorize();
	this.calcFlightTimes();
	return this;
    };

    /**
     * Rotates throws so that column x becomes column 0.
     * This is not valid (so not allowed) for slow-fast patterns.
     * It may be possible to change the sync point for slow-fast patterns
     * to rotate throws.
     *
     * @method rotateThrows
     * @param x {Number}
     * @return {JugPattern} this pattern
     */
    JPRO.JugPattern.prototype.rotateThrows = function(x) {
	//console.log('rotateThrows called');
	if (this.clocks.length > 1) return this.rotateThrowsSF(x);
	var h = this.forI(function(h) {
	    h.njt = [];
	    h.parent.forJ(h, function(h) {
		var idx = (h.j + h.jt.length + x) % h.jt.length;
		h.njt.push(h.jt[idx]);
	    });
	    h.parent.jugThrowSeqs[h.i].jugThrows.itemList = h.njt;
	    h.parent.jugThrowSeqs[h.i].w3Colorize();
	});
	this.calcFlightTimes();
	return this;
    };

    JPRO.JugPattern.prototype.rotateThrowsSF = function(x) {
	//console.log('rotateThrowsSF called');
	var h = this.forI(function(h) {
	    h.njt = [];
	    h.parent.forJ(h, function(h) {
		// if destRow < 0, idx=0 is not rotated
		//console.log('j=' + h.j + ' destRow=' + h.jt[0][0].destRow);
		if (h.jt[0][0].destRow < 0) {
		    if (h.j !== 0) {
			var pd = h.jt.length - 1;
			var idx = ((h.j - 1 + pd + x) % pd) + 1;
			h.jtj = h.jt[idx];
			//console.log('idx=' + idx + ' j=' + h.j);
		    }
		}
		else {
		    var idx = (h.j + h.jt.length + x) % h.jt.length;
		    h.jtj = h.jt[idx]; // change h.jtj
		}
		h.parent.forK(h, function(h) {
		    var r = h.jtjk.destRow;
		    if (r >= 0) {
			if (h.parent.jugThrowSeqs[r].clock !== h.clk) {
			    var db = h.jtjk.destBeats;     // dest beats
			    var sb = h.jtjk.fltBeats - db; // self beats
			    db -= x;
			    sb += x;
			    var df1 = h.parent.jugThrowSeqs[r].period;
			    var sf1 = h.jts.period;
			    //while (db > df1/2) {
			    while (db >= df1 - 1) {
				//console.log('df1=' + df1 + ' db=' + db);
				db -= df1;
				sb += sf1;
			    }
			    //while (db <= -df1/2) {
			    while (db <= -2) {
				db += df1;
				sb -= sf1;
			    }
			    h.jtjk.destBeats = db;
			    h.jtjk.fltBeats = sb+db;
			}
		    }
		});
		h.njt.push(h.jtj);
	    });
	    h.parent.jugThrowSeqs[h.i].jugThrows.itemList = h.njt;
	    h.parent.jugThrowSeqs[h.i].w3Colorize();
	});
	this.calcFlightTimes();
	return this;
    };
    
    /**
     * Permutes (remaps) rows in MHN+
     *
     * @method permuteRows
     * @param mapping {Array}
     * @return {JugPattern} this pattern
     */
    JPRO.JugPattern.prototype.permuteRows = function(mapping) {
	var i,idx,njts;
	//console.log('permuteRows called..');
	if (this.rows < 2) {
	    return this;
	}
	njts = [];
	for (i=0; i<this.jugThrowSeqs.length; i++) {
	    idx = mapping[i];
	    njts[idx] = this.jugThrowSeqs[i].permuteRows(mapping);
	    njts[idx].row = idx;
	}
	this.jugThrowSeqs = njts;
	this.calcFlightTimes();
	return this;
    };

    /**
     * Swaps rows in MHN+
     *
     * @method swapRows
     * @param row1 {Number}
     * @param row2 {Number}
     * @return {JugPattern} this pattern
     */
    JPRO.JugPattern.prototype.swapRows = function(row1, row2) {
	var mapping, i;
	//console.log('swapRows called..');
	mapping = [];
	for (i=0; i<this.jugThrowSeqs.length; i++) {
	    mapping[i] = i;
	}
	mapping[row1] = row2;
	mapping[row2] = row1;
	return this.permuteRows(mapping);
    };

    JPRO.JugPattern.prototype.createBeats = function(pd, totalTime) {
	var err, j, rt, t, rv;
	t = totalTime/pd;
	//console.log('t=' + t);
	err = 0;
	rv = [];
	for (j=0; j<pd; j++) {
	    rt = Math.round(t + err);
	    err = t - rt;
	    rv.push(rt);
	}
	return rv;
    };
    
    JPRO.JugPattern.prototype.setClock = function(row) {
	var clk,idx,pd,jts,beatLst,i,maxPd,basePeriod;
	var totalTime,r;
	// remove row from its clock's mhnRows list
	clk = this.jugThrowSeqs[row].clock;
	idx = clk.mhnRows.indexOf(row);
	clk.mhnRows.splice(idx, 1); // remove
	
	// if mhnRows list is empty, remove clock
	if (clk.mhnRows.length === 0) {
	    idx = this.clocks.indexOf(clk);
	    this.clocks.splice(idx, 1); // remove
	}
	
	// search rows for a matching period
	pd = this.jugThrowSeqs[row].period;
	jts = null;
	this.jugThrowSeqs.forEach(function(x,i) {
	    if ((i !== row) && (x.period === pd)) {
		jts = x;
	    }
	});
	
	// if found, set row's clock and add row to clock's mhnRows
	if (jts) {
	    this.jugThrowSeqs[row].clock = jts.clock;
	    jts.clock.mhnRows.push(row);
	}
	// otherwise, create clock with mhnRows, add to clocks
	else {
	    maxPd = 0;
	    for (i=0; i<this.rows; i++) {
		if (this.jugThrowSeqs[i].period > maxPd) maxPd = this.jugThrowSeqs[i].period;
	    }
	    
	    console.log('maxPd=' + maxPd + ' pd=' + pd + ' rows=' + this.rows);
	    basePeriod = 12;
	    totalTime = basePeriod * maxPd;
	    beatLst = this.createBeats(pd, totalTime);
	    r = JPRO.HierRptSeq.create(beatLst, -1);
	    clk = new JPRO.Clock(1, r);
	    clk.mhnRows = [row];
	    this.clocks.push(clk);
	    this.jugThrowSeqs[row].clock = clk;
	    // recalculate the other clocks' rhythms
	    for (i=0; i<this.clocks.length; i++) {
		pd = this.clocks[i].rhythm.itemList[0].itemList.length;
		beatLst = this.createBeats(pd, totalTime);
		r = JPRO.HierRptSeq.create(beatLst, -1);
		this.clocks[i].rhythm = r;
	    }
	}
    };
    
    /**
     * @method decPeriod
     * @param row {Number} MHN row
     * @return {JugPattern} this pattern
     */
    JPRO.JugPattern.prototype.decPeriod = function(row) {
	if ((this.jugThrowSeqs[row].period > 1) && (this.jugThrowSeqs[row].isZeros())) {
	    this.jugThrowSeqs[row].jugThrows.itemList.pop();
	    this.jugThrowSeqs[row].period--;
	    this.setClock(row);
	    this.calcFlightTimes();
	}
	return this;
    };
    
    /**
     * Extends period by one, choosing legal throw-heights
     *
     * @method extendPeriod
     * @param row {Number} optional MHN row
     * @return {JugPattern} this pattern
     */
    JPRO.JugPattern.prototype.extendPeriod = function(row) {
	//console.log('extendPeriod called');
	var period,adjust,i,mslots,jt,msThrows,k;
	var n = 0; // amount subtracted from each throw
	var h = {};
	if (row !== undefined) {
	    if (this.jugThrowSeqs[row].isZeros()) {
		msThrows = [];
		mslots = this.jugThrowSeqs[row].getMultiplex();
		for (k=0; k<mslots; k++) {
		    msThrows.push(new JPRO.JugThrow(row, 0, 0, 0.5));
		}
		this.jugThrowSeqs[row].push(msThrows);
		this.setClock(row);
		//console.log(this);
		this.calcFlightTimes();
	    }
	    return this;
	}
	if (this.clocks.length > 1) return this;
	period = this.jugThrowSeqs[0].period;
	if (period >= this.maxPeriod) { // kid proofed
	    alert('Period upper limit is ' + this.maxPeriod);
	    return this;
	}

	//console.log('props = ' + this.props);
	//console.log('period = ' + period);
	h.sum = 0;
	while (h.sum < this.props*period) {
	    this.forIJK(h, function(h) {
		h.jtjk.fltBeats--;
		h.sum++;
	    });
	    n++;
	} // while
	//console.log('sum = ' + h.sum);
	if (h.sum > this.props*period) {
	    adjust = 1;
	}
	else {
	    adjust = 0;
	}
	this.forIJK(h, function(h) {
	    h.t = h.jtjk.fltBeats + h.j + adjust; // absolute beat time
	    h.x = Math.floor(h.t/period); // adjusted for extra column
	    h.jtjk.fltBeats += h.x + n; // add n back in to each throw
	});

	// Extend the period by one column
	this.forI(h, function(h) {
	    var k;
	    var mslots = h.parent.jugThrowSeqs[h.i].getMultiplex();
	    var msThrows = [];
	    for (k=0; k<mslots; k++) {
		msThrows.push(new JPRO.JugThrow(h.i, n-adjust, 0, 0.5));
	    } // for k
	    h.parent.jugThrowSeqs[h.i].push(msThrows);	    
	});

	// Extend the clock's rhythm by one beat
	this.clocks[0].rhythm.itemList[0].push(12);
	this.calcFlightTimes();
	return this;
    };

    /**
     * Extends rows by one, using specified throw-height
     *
     * @method extendRows
     * @param rowIdx {Number} match this MHN row's period
     * @param throwHeight {Number}
     * @return {JugPattern} this pattern
     */
    JPRO.JugPattern.prototype.extendRows = function(rowIdx, throwHeight) {
	//console.log('extendRows called..');
	var r = rowIdx || 0;
	var t = throwHeight || 0;
	var row = [];
	var j,s;
	var period = this.jugThrowSeqs[r].period;
	var clk = this.jugThrowSeqs[r].clock;
	if (this.rows >= this.maxRows) { // kid proofed
	    alert('Rows upper limit is ' + this.maxRows);
	    return this;
	}
	for (j=0; j<period; j++) {
	    row.push([new JPRO.JugThrow(this.rows, t)]);
	}
	s = new JPRO.RptSeq(row, this.iters);
	this.jugThrowSeqs.push(
	    new JPRO.JugThrowSeq(s, 0, this.iters, clk, this.rows, null, 0.5)
	);
	clk.mhnRows.push(this.rows);
	this.rows++; // increment rows
	this.calcFlightTimes();
	return this;
    };

    /**
     * Resets the pattern to the single row, period=1, null pattern
     *
     * @method reset
     */
    JPRO.JugPattern.prototype.reset = function() {
	var s,clk,r;
	this.rows = 1;
	//s = new JPRO.RptSeq([[new JPRO.JugThrow(0,0)]], this.iters);
	r = JPRO.HierRptSeq.create([12], -1);
	clk = new JPRO.Clock(1, r);
	clk.mhnRows = [0];
	this.jugThrowSeqs = [new JPRO.JugThrowSeq(0, 0, this.iters, clk, 0)];
	this.clocks = [this.jugThrowSeqs[0].clock];
	this.jugThrowSeqs[0].preDwellRatio = 0.5;
	this.props = 0;
	this.calcFlightTimes();
	//console.log(this.jugThrowSeqs);
    };
    
    /**
     * Cleans the MHN+ matrix by removing any
     * multiplex slots that exist but are not
     * a throw (i.e. zero throw-height and to
     * the same row).
     *
     * @method clean
     * @return {JugPattern} this object
     */
    JPRO.JugPattern.prototype.clean = function() {
	var i;
	for (i in this.jugThrowSeqs) {
	    this.jugThrowSeqs[i].clean().w3Colorize();
	}
	return this;
    };

    /**
     * Calculate and return number of props juggled
     * in this pattern.
     *
     * @method calcProps
     * @return {Number} calculated number of props
     */
    JPRO.JugPattern.prototype.calcProps = function() {
	var h,i,rv,rvInt;
	//console.log('calcProps called');
	h = {};
	h.sum = []; // keep a sum for each row
	for (i in this.jugThrowSeqs) {
	    h.sum.push(0);
	}
	this.forIJK(h, function(h) {
	    var x = h.jtjk;
	    h.sum[h.i] += x.fltBeats - x.destBeats;
	    h.sum[x.destRow] += x.destBeats;
	});
	
	rv = 0;
	for (i=0; i<this.jugThrowSeqs.length; i++) {
	    rv += h.sum[i]/this.jugThrowSeqs[i].period;
	}
	rvInt = Math.round(rv);
	if (Math.abs(rv - rvInt) > 0.01) {
	    console.log('WARNING from calcProps: Number of props not an integer (' + rv + ')');
	}
	return rvInt;
    };

    /**
     * Finds a minimum throw sequence to transition from
     * this pattern to the specified one.
     *
     * @method getTransition
     * @param destPat {JugPattern}
     * @return {JugPattern} throw sequence to get from this pattern
     *     to destination pattern
     */
    JPRO.JugPattern.prototype.getTransition = function(destPat) {
	var destState = new JPRO.State(destPat.getMHN(), destPat.props, destPat.name + '_state');
	var myState = new JPRO.State(this.getMHN(), this.props, this.name + '_state');
	return myState.getTransition(destState);
    };

    /**
     * Returns list of selected throws
     *
     * @method getSelectedThrows
     * @return {Array} selected throws
     */
    JPRO.JugPattern.prototype.getSelectedThrows = function() {
	var h = this.forIJK({a:[]}, function(h) {
	    if (h.jtjk.w3IsSelected) {
		h.a.push([h.i, h.j, h.k]);
	    }
	});
	return h.a;
    };

    /**
     * Clears all throw selections
     *
     * @method clearSelections
     */
    JPRO.JugPattern.prototype.clearSelections = function() {
	this.forIJK(function(h) {
	    h.jtjk.w3IsSelected = 0;
	});
    };

})();
