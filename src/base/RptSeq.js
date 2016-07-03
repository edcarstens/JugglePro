/**
 * @author Ed Carstens
 */

/**
 * A RptSeq is a repeatable sequence of items.
 * The items are all of the same type, either scalars
 * or objects of the same class or base class. Items
 * are not to be sequences. Use HierRptSeq for that. 
 *
 * @class RptSeq
 * @extends Seq
 * @constructor
 * @param itemList {Array} array of items
 * @param iters {Number} total number of iterations
 * @param entryExit {Number} number of items in entrySeq and exitSeq lists
 * @param name
 */
JPRO.ID.RptSeq = 0;
JPRO.RptSeq = function(itemList, iters, entryExit, name) {

    // Call superclass
    this.className = this.className || 'RptSeq';
    JPRO.Seq.call(this, itemList, name);

    /**
     * Iterations
     *
     * @property iters
     * @type Number  (-1 => repeat forever, 0 => disable)
     */
    this.iters = (iters === undefined) ? -1 : iters;

    /**
     * Iteration count
     *
     * @property iterCnt
     * @type Number
     */
    this.iterCnt = 0;

    /**
     * Iteration count for lookahead
     *
     * @property iterCntLA
     * @type Number
     */
    this.iterCntLA = 0;

    /**
     * Sequence of items in this list
     * 
     * @property itemList
     * @type Array
     */
    //this.itemList = (itemList === undefined) ? [] : itemList;

    /**
     * Index to current item of itemList
     *
     * @property currentIdx
     * @type Number
     */
    //this.currentIdx = -1; // index to current item

    /**
     * Callback called on entry of this RptSeq
     *
     * @property entryCB
     * @type Function
     */
    /* jshint unused:false */
    //this.entryCB = function() {};
    /* jshint unused:true */

    /**
     * Callback called on exit of this RptSeq
     *
     * @property exitCB
     * @type Function
     */
    /* jshint unused:false */
    //this.exitCB = function() {};
    /* jshint unused:true */

    if (entryExit) {
	this.entrySeq = itemList.slice(0, entryExit);
	this.exitSeq = itemList.slice(itemList.length - entryExit);
    }
    else {
	this.entrySeq = null;
	this.exitSeq = null;
    }
};

JPRO.RptSeq.prototype = Object.create(JPRO.Seq.prototype);
JPRO.RptSeq.prototype.constructor = JPRO.RptSeq;

/**
 * Copies this RptSeq (deep copy)
 *
 * @method copy
 * @param objHash {Object} hash
 * @param cFunc {Function} constructor
 * @return {RptSeq} copied object
 */
JPRO.RptSeq.prototype.copy = function(objHash, cFunc) {
    // Call to super's copy method
    // Be sure to redefine this copy method when extending
    // the sequence classes.
    var obj = JPRO.Seq.prototype.copy.call(this, objHash, cFunc);
    obj.iterCnt = this.iterCnt;
    obj.iterCntLA = this.iterCntLA;
    if (this.entrySeq)
	obj.entrySeq = this.entrySeq.copy(objHash);
    else
	obj.entrySeq = null;
    if (this.exitSeq)
	obj.exitSeq = this.exitSeq.copy(objHash);
    else
	obj.exitSeq = null;
    return obj;
};

/**
 * Copies this RptSeq (shallow copy)
 *
 * @method copyShallow
 * @param objHash {Object} hash
 * @param cFunc {Function} constructor
 * @return {RptSeq} copied object
 */
JPRO.RptSeq.prototype.copyShallow = function(objHash, cFunc) {
    // Call to super's copy method
    // Be sure to redefine this copy method when extending
    // the sequence classes.
    var obj = JPRO.Seq.prototype.copyShallow.call(this, objHash, cFunc);
    obj.iterCnt = this.iterCnt;
    obj.iterCntLA = this.iterCntLA;
    obj.entrySeq = this.entrySeq;
    obj.exitSeq = this.exitSeq;
    return obj;
};

/**
 * Increment the index to this RptSeq
 *
 * @method incIdx
 * @return {Boolean} 1=exit, 0=continue
 */
JPRO.RptSeq.prototype.incIdx = function() {
    if (this.iters === 0)
	return 1; // exit
    this.currentIdx++;
    if (this.currentIdx >= this.itemList.length) {
	this.currentIdx = 0;
	this.iterCnt++;
	if (this.iterCnt >= this.iters) {
	    this.iterCnt = 0;
	    if (this.iters > 0) {
		this.currentIdx = -1; // exit
		this.exitCB();
		return 1; // exit
	    }
	}
    }
    return 0;
};


/**
 * Return next object or null to indicate completion
 *
 * @method nextItem
 * @return {Object} the next item or null
 */
JPRO.RptSeq.prototype.nextItem = function() {
    if (this.iters === 0)
	return null; // exit
    if (this.currentIdx < 0) {
	this.entryCB(); // initial entry
	this.currentIdx = 0;
    }
    else {
	if (this.incIdx()) {
	    return null; // exit
	}
    }
    return this.itemList[this.currentIdx];
};

JPRO.RptSeq.prototype._replaceItemList = function() {
    var sz, sz0, szx, rv;
    rv = this.itemList;
    if (this.entrySeq) {
	sz0 = this.entrySeq.length;
	if (this.iterCntLA === 0) {
	    rv = this.entrySeq.concat(rv.slice(sz0));
	}
    }
    if (this.exitSeq) {
	sz = this.itemList.length;
	szx = this.exitSeq.length;
	if ((this.iters > 0) && (this.iterCntLA + 1 >= this.iters)) {
	    rv = rv.slice(0, sz-szx).concat(this.exitSeq);
	}
    }
    return rv;
};

/**
 * Return remaining number of items still needed
 * and list of items from this RptSeq and a flag
 * which is 1 if empty, otherwise null.
 * This is a helper function for the getItems method
 *
 * @method _getItems
 * @param d {Number} calling depth
 * @param idx {Number} number of items needed
 * @return {Array} [remaining,itemList,emptyFlag]
 */
JPRO.RptSeq.prototype._getItems = function(d, idx) {
    var items = [];
    if (this.iters === 0)
	return [idx, items, 1]; // empty
    //idx = idx + this.currentIdx + 1 - this.itemList.length;
    while (idx >= 0) {
	idx = idx - this.itemList.length;
	//items = items.concat(this.itemList);
	items = items.concat(this._replaceItemList());
	if (this.iters > 0) {
	    this.iterCntLA++;
	    if (this.iterCntLA >= this.iters) {
		this.iterCntLA = 0;
		return [idx, items, 1]; // empty
	    }
	}
    }
    return [idx, items, null]; // Done, but not empty
};

JPRO.RptSeq.prototype.getSeq = function() {
    var items = this.itemList;
    var sz0 = this.entrySeq.length;
    var szx = this.exitSeq.length;
    var sz = items.length;
    return this.entrySeq.concat(items.slice(sz0)).concat(
	items).concat(items.slice(0, sz-szx)).concat(this.exitSeq);
};

/**
 * Returns expanded sequence containing two of every item,
 * including entry and exit sequence items. To do this, it
 * effectively sets iters=3 for this repeatable sequence
 * and inserts copies of items, doubling the length of
 * each sequence.
 * This is useful if interpolation is desired between
 * items, doubling the length. Currently, it is used by
 * PosePat.
 *
 * @method expandSeqs
 * @param copyFunc
 * @return {Array} expanded sequence
 */
JPRO.RptSeq.prototype.expandSeqs = function(copyFunc) {
    var sz0, szx, sz;
    var entrySeq, exitSeq, items;
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
    items = expandSeq(this.itemList);
    this.itemList = items;
    sz = items.length;
    return entrySeq.concat(items.slice(sz0)).concat(items).concat(
	items.slice(0, sz-szx)).concat(exitSeq);
};

/**
 * Return string representation of this RptSeq
 *
 * @method toString
 * @return {String} representation of this RptSeq
 */
JPRO.RptSeq.prototype.toString = function() {
    var i;
    var rv = '[';
    for (i=0; i<this.itemList.length; i++) {
	if (i > 0) {
	    rv = rv + ', ';
	}
	if (typeof(this.itemList[i]) === 'object') {
	    rv += this.itemList[i].toString();
	}
	else {
	    rv = rv + this.itemList[i];
	}
    }
    rv = rv + ']:' + this.iters;
    return rv;
};
