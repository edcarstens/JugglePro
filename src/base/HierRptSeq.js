/**
 * @author Ed Carstens
 */

/**
 * A HierRptSeq is a hierarchical repeatable sequence,
 * which is a sequence of sequences only, not items.
 * The sequences in a HierRptSeq may be of type
 * HierRptSeq, RptSeq, or Seq.
 *
 * @class HierRptSeq
 * @extends RptSeq
 * @constructor
 * @param itemList {Array} array of sequences
 * @param iters {Number} total number of iterations
 * @param entryExit {Number} number of items in entry and exit lists
 * @param name
 */
JPRO.ID.HierRptSeq = 0;
JPRO.HierRptSeq = function(itemList, iters, entryExit, name) {

    // Call superclass
    this.className = this.className || 'HierRptSeq';
    JPRO.RptSeq.call(this, itemList, iters, entryExit, name);

    this.lookAheadList = [];
    this.nextItemReturnsLA = null;
    /**
     * Period of this expanded sequence
     *
     * @property period
     * @type Number
     */
    this.period = this.calcPeriod();

    this.currentIdxLA = 0;
    this.currentSeq = null;

    if (entryExit) {
	var items = []; // repeatable sequence of items
	itemList.map(function(x) {
	    items = items.concat(x.getSeq());
	});
	this.entrySeq = items.slice(0, entryExit);
	this.exitSeq = items.slice(items.length - entryExit);
    }
    else {
	this.entrySeq = null;
	this.exitSeq = null;
    }
};

JPRO.HierRptSeq.prototype = Object.create(JPRO.RptSeq.prototype);
JPRO.HierRptSeq.prototype.constructor = JPRO.HierRptSeq;

/**
 * Convenient class function for creating a simple repeating
 * sequence with HierRptSeq and RptSeq objects.
 *
 * @method create
 * @param itemList
 * @param iters
 * @param entryExit
 * @param name
 * @return {HierRptSeq} new sequence object
 */
JPRO.HierRptSeq.create = function(itemList, iters, entryExit, name) {
    var r = new JPRO.RptSeq(itemList, 1, entryExit);
    return new JPRO.HierRptSeq([r], iters, entryExit, name);
};

/**
 * Copies this HierRptSeq (deep copy)
 *
 * @method copy
 * @param objHash {Object} hash
 * @param cFunc {Function} constructor
 * @return {HierRptSeq} copied object
 */
JPRO.HierRptSeq.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    //pFuncs.lookAheadList = JPRO.Common.copyObjVector;
    pFuncs.itemList = JPRO.Common.copyObjVector;
    var scalars = ['entryCB', 'exitCB', 'currentIdx',
		   'iters', 'iterCnt', 'currentIdxLA',
		   'iterCntLA', 'period', 'currentSeq',
		  'nextItemReturnsLA'];
    return this.directedCopy(objHash, cFunc, pFuncs, scalars);
};

/**
 * Copies this HierRptSeq (shallow copy)
 *
 * @method copyShallow
 * @param objHash {Object} hash
 * @param cFunc {Function} constructor
 * @return {HierRptSeq} copied object
 */
JPRO.HierRptSeq.prototype.copyShallow = function(objHash, cFunc) {
    var pFuncs = {};
    //pFuncs.lookAheadList = JPRO.Common.copyObjVector;
    //pFuncs.itemList = JPRO.Common.copyObjVector;
    var scalars = ['entryCB', 'exitCB', 'currentIdx',
		   'iters', 'iterCnt', 'currentIdxLA',
		   'iterCntLA', 'period', 'currentSeq',
		   'nextItemReturnsLA', 'itemList',
		   'entrySeq', 'exitSeq'];
    return this.directedCopy(objHash, cFunc, pFuncs, scalars);
};

/**
 * Push a sequence onto itemList
 *
 * @method push
 * @param item {Seq|RptSeq|HierRptSeq}
 * @return {HierRptSeq} this HierRptSeq
 */
JPRO.HierRptSeq.prototype.push = function(item) {
    this.itemList.push(item);
    if ((item.iters < 0) && (item.period > 0)) {
	this.period = -1; // infinite period
    }
    else {
	this.period += item.period * item.iters;
    }
    return this;
};

/**
 * Increment the lookahead index to this HierRptSeq
 *
 * @method incIdxLA
 * @return {Boolean} 1=exit, 0=continue
 */
JPRO.HierRptSeq.prototype.incIdxLA = function() {
    if (this.iters === 0)
	return 1; // exit
    this.currentIdxLA++;
    if (this.currentIdxLA >= this.itemList.length) {
	this.currentIdxLA = 0;
	this.iterCntLA++;
	if (this.iterCntLA >= this.iters) {
	    this.iterCntLA = 0;
	    if (this.iters > 0) {
		this.currentIdxLA = 0; // exit
		//this.exitCB();
		return 1; // exit
	    }
	}
    }
    return 0;
};

/**
 * Synchronizes lookAheadList when next nextItem()
 * is called by shifting off the first item.
 *
 * @method syncLookAhead
 * @return {Object} item
 */
JPRO.HierRptSeq.prototype.syncLookAhead = function(item) {
    var x;
    if (this.lookAheadList.length === 0)
	return item;
    x = this.lookAheadList.shift();
    //console.log('sl la=' + this.lookAheadList);
    //if (x !== item) {
	//console.log('x=' + x);
	//console.log('item=' + item);
	//throw 'look-ahead array out of sync';
    //}
    if (this.nextItemReturnsLA)
	return x;
    else
	return item;
};

/**
 * Return next item or null to indicate completion
 * This should be called by user with no arguments.
 *
 * @method nextItem
 * @return {Object} the next item or null
 */
JPRO.HierRptSeq.prototype.nextItem = function(depth) {
    var d, item, j, x;
    d = depth || 0;
    if (d > 99) {
	throw 'exceeded recursive limit of 99';
    }
    if ((this.iters === 0) || (this.period === 0)) {
	return null;
    }
    if ((this.lookAheadList.length === 0) && (d===0)) {
	x = this.getItem(0); // for top-level call only
	//console.log('la sync x=' + x);
	//console.log('la=' + this.lookAheadList);
    }

    // Increment index if necessary
    if (this.currentIdx < 0) {
	this.entryCB(); // initial entry
	this.currentIdx = 0;
    }

    // Search for next item
    item = null;
    j = this.itemList.length + 1;
    while (item === null) {
	x = this.itemList[this.currentIdx];
	item = x.nextItem(d+1);
	if ((item === null) && (this.incIdx())) {
	    this.currentSeq = null;
	    return null; // exit
	}
	j--;
	if (j < 0) {
	    throw 'HierRptSeq contains no iterable sequence';
	}
    }
    // Keep track of current Seq or RptSeq
    if (x.className !== this.className) {
	this.currentSeq = x;
    }
    else {
	this.currentSeq = x.currentSeq;
    }
    return this.syncLookAhead(item);
};

/**
 * Return item indexed by idx
 * This should only be called at the top level.
 * The index (idx) is relative to the next item
 * that would be returned by nextItem(); idx=0
 * would return the same item as nextItem() but
 * the pointers would not be incremented. This
 * is called by nextItem() with idx=0 in
 * order to create a look-ahead array.
 *
 * @method getItem
 * @param idx {Number} the index of item desired
 * @return {Object} item indexed by idx
 */
JPRO.HierRptSeq.prototype.getItem = function(idx) {
    var idx_items_empty = [idx+10-this.lookAheadList.length, [], 1];
    if ((this.iters === 0) || (this.period === 0)) {
	throw 'no items to get';
    }
    while (idx_items_empty[0] >= 0) {
	idx_items_empty = this.itemList[this.currentIdxLA]._getItems(0, idx_items_empty[0]);
	this.lookAheadList = this.lookAheadList.concat(idx_items_empty[1]);
	if (idx_items_empty[2]) {
	    this.incIdxLA(); // force infinite repeat here
	}
    }
    return this.lookAheadList[idx];
};

JPRO.HierRptSeq.prototype._replaceFirstItems = function(items) {
    var sz0;
    if (this.entrySeq) {
	sz0 = this.entrySeq.length;
	if ((this.iterCntLA === 0) && (this.currentIdxLA === 0)) {
	    return this.entrySeq.concat(items.slice(sz0));
	}
    }
    return this.itemListCopy(items);
};

JPRO.HierRptSeq.prototype._replaceLastItems = function(items) {
    var sz, szx;
    if (this.exitSeq) {
	sz = items.length;
	szx = this.exitSeq.length;
	return items.slice(0, sz-szx).concat(this.exitSeq);
    }
    return this.itemListCopy(items);
};

JPRO.HierRptSeq.prototype._getItems = function(d, idx) {
    var idx_items_empty, rv;
    if (d > 99) throw 'more than 99 deep calls to _getItems';
    idx_items_empty = [idx, [], 1];
    if ((this.iters === 0) || (this.period === 0))
	return idx_items_empty; // empty
    rv = [];
    while (idx_items_empty[0] >= 0) {
	idx_items_empty = this.itemList[this.currentIdxLA]._getItems(d+1, idx_items_empty[0]);
	rv = rv.concat(this._replaceFirstItems(idx_items_empty[1]));
	if (idx_items_empty[2] && this.incIdxLA()) {
	    return [idx_items_empty[0],
		    this._replaceLastItems(rv), 1]; // empty
	}
    }
    return [idx_items_empty[0], rv, null]; // done, not empty
};

/**
 * Calculates period of this HierRptSeq
 *
 * @method calcPeriod
 * @return {Number} period of this HierRptSeq
*/
JPRO.HierRptSeq.prototype.calcPeriod = function() {
    var rv = 0;
    var items = this.itemList;
    var i, item;
    for (i=0; i<items.length; i++) {
	item = items[i];
	if ((item.iters < 0) && (item.period > 0)) {
	    return -1; // infinite period
	}
	rv += item.period * item.iters;
    }
    return rv;
};

/**
 * Returns sequence containing every item, including
 * entry and exit sequence items. To do this, it
 * effectively sets iters=3 for all repeatable sequences.
 * This is useful for mapping an operation to every
 * item in the entire sequence at least once while
 * maintaining the sequence ordering.
 *
 * @method getSeq
 * @return {Array} sequence containing every item 
 */
JPRO.HierRptSeq.prototype.getSeq = function() {
    var sz0 = this.entrySeq.length;
    var szx = this.exitSeq.length;
    var sz = this.itemList.length;
    var items = []; // repeatable sequence of items
    this.itemList.map(function(x) {
	items = items.concat(x.getSeq());
    });
    return this.entrySeq.concat(items.slice(sz0)).concat(
	items).concat(items.slice(0, sz-szx)).concat(this.exitSeq);
};

/**
 * Returns expanded sequence containing two of every item,
 * including entry and exit sequence items. To do this, it
 * effectively sets iters=3 for all repeatable sequences
 * and inserts copies of items, doubling the length of
 * each Seq/RptSeq object.
 * This is useful if interpolation is desired between
 * items, doubling the length. Currently, it is used by
 * PosePat.
 *
 * @method expandSeqs
 * @param copyFunc
 * @return {Array} expanded sequence
 */
JPRO.HierRptSeq.prototype.expandSeqs = function(copyFunc) {
    var sz0, szx, sz;
    var entrySeq, exitSeq;
    var expandSeq = function(seq) {
	var rv = [];
	var cf = copyFunc || function(item) {return item.copy();};
	seq.map(function(item) {
	    rv.push(item);
	    rv.push(cf(item));
	});
	return rv;
    };
    // expand entry and exit seqs
    entrySeq = expandSeq(this.entrySeq);
    exitSeq = expandSeq(this.exitSeq);
    this.entrySeq = entrySeq;
    this.exitSeq = exitSeq;
    sz0 = entrySeq.length;
    szx = exitSeq.length;
    // expand repeatable seq
    var items = []; // repeatable sequence of items
    this.itemList.map(function(x) {
	items = items.concat(x.expandSeqs(copyFunc));
    });
    sz = items.length;
    return entrySeq.concat(items.slice(sz0)).concat(items).concat(
	items.slice(0, sz-szx)).concat(exitSeq);
};

/**
 * Return string representation of this HierRptSeq
 *
 * @method toString
 * @return {String} representation of this HierRptSeq
 */
JPRO.HierRptSeq.prototype.toString = function(depth) {
    var i,d;
    var rv = '[';
    d = depth || 0;
    // stop at hierarchy depth > 3
    if (d > 3)
	return '[..' + this.name + '..]:' + this.iters;
    for (i=0; i<this.itemList.length; i++) {
	if (i > 0) {
	    rv = rv + ', ';
	}
	rv = rv + this.itemList[i].toString(d+1);
    }
    rv = rv + ']:' + this.iters;
    return rv;
};
