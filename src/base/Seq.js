/**
 * @author Ed Carstens
 */

/**
 * A Seq is a non-repeatable sequence of items.
 * The items are all the same type, either scalars
 * or objects (not arrays) of the same base class.
 *
 * @class Seq
 * @extends Base
 * @constructor
 * @param itemList {Array} array of items
 * @param name
 */
JPRO.ID.Seq = 0;
JPRO.Seq = function(itemList, name) {

    // Call superclass
    this.className = this.className || 'Seq';
    JPRO.Base.call(this, name);

    /**
     * Sequence of items in this list
     * 
     * @property itemList
     * @type Array
     */
    this.itemList = (itemList === undefined) ? [] : itemList;
    /**
     * Index to current item of itemList
     *
     * @property currentIdx
     * @type Number
     */
    this.currentIdx = -1; // index to current item

    /**
     * Callback called on entry of this Seq
     *
     * @property entryCB
     * @type Function
     */
    /* jshint unused:false */
    this.entryCB = function() {};
    /* jshint unused:true */

    /**
     * Callback called on exit of this Seq
     *
     * @property exitCB
     * @type Function
     */
    /* jshint unused:false */
    this.exitCB = function() {};
    /* jshint unused:true */

    // used by HierRptSeq::calcPeriod()
    this.period = this.itemList.length;
    this.iters = 1;
};

JPRO.Seq.prototype = Object.create(JPRO.Base.prototype);
JPRO.Seq.prototype.constructor = JPRO.Seq;

JPRO.Seq.prototype.itemListCopy = function(copyGetItemsFlag, itemList) {
    console.log('itemListCopy called..');
    var f;
    var z = itemList ? itemList : this.itemList;
    var x = typeof z[0];
    if (copyGetItemsFlag === null)
	return z;
    else if (z[0].constructor === Array)
	f = JPRO.Common.copyObjMatrix;
    else if (x === 'object')
	f = JPRO.Common.copyObjVector;
    else
	return z.slice(0);
    return f(z, {});
};

/**
 * Copies this Seq (deep copy)
 *
 * @method copy
 * @param objHash {Object} hash
 * @param cFunc {Function} constructor
 * @return {Seq} copied object
 */
JPRO.Seq.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    var x = typeof this.itemList[0];
    if (this.itemList[0].constructor === Array)
	pFuncs.itemList = JPRO.Common.copyObjMatrix;
    else if (x === 'object')
	pFuncs.itemList = JPRO.Common.copyObjVector;
    var scalars = ['entryCB', 'exitCB', 'currentIdx', 'period',
		  'iters'];
    var obj = this.directedCopy(objHash, cFunc, pFuncs, scalars);
    if (pFuncs.itemList === undefined)
	obj.itemList = this.itemList.slice(0);
    return obj;
};

/**
 * Copies this Seq (shallow copy)
 *
 * @method copyShallow
 * @param objHash {Object} hash
 * @param cFunc {Function} constructor
 * @return {Seq} copied object
 */
JPRO.Seq.prototype.copyShallow = function(objHash, cFunc) {
    var pFuncs = {};
    var scalars = ['entryCB', 'exitCB', 'currentIdx', 'period',
		   'iters', 'itemList'];
    var obj = this.directedCopy(objHash, cFunc, pFuncs, scalars);
    return obj;
};

/**
 * Push an item onto itemList
 *
 * @method push
 * @param item {Object|Scalar}
 * @return {Seq} this sequence
 */
JPRO.Seq.prototype.push = function(item) {
    this.itemList.push(item);
    this.period++;
    return this;
};

/**
 * Increment the index to this Seq
 *
 * @method incIdx
 * @return {Boolean} 1=exit, 0=continue
 */
JPRO.Seq.prototype.incIdx = function() {
    this.currentIdx++;
    if (this.currentIdx >= this.itemList.length) {
	this.currentIdx = -1; // exit
	this.exitCB();
	return 1; // exit
    }
    return 0;
};


/**
 * Return next object or null to indicate completion
 *
 * @method nextItem
 * @return {Object} the next item or null
 */
JPRO.Seq.prototype.nextItem = function() {
    if (this.currentIdx < 0) {
	this.entryCB(); // initial entry
	this.currentIdx = 0;
    }
    else if (this.incIdx()) {
	return null; // exit
    }
    return this.itemList[this.currentIdx];
};

/**
 * Return remaining number of items still needed
 * and itemList.
 * This is a helper function for the getItems method
 * found in HierRptSeq.
 *
 * @method _getItems
 * @return {Array} [remaining,itemList,emptyFlag]
 */
JPRO.Seq.prototype._getItems = function(d, idx, copyGetItemsFlag) {
    //var ni = idx + this.currentIdx + 1 - this.itemList.length;
    var ni = idx - this.itemList.length;
    //return [ni, this.itemList, 1];
    return [ni, this.itemListCopy(copyGetItemsFlag), 1];
};

JPRO.Seq.prototype.getSeq = function() {
    return this.itemList;
};

JPRO.Seq.prototype.expandSeqs = function(copyFunc) {
    var expandSeq = function(seq) {
	var rv = [];
	var cf = copyFunc || function(item) {return item.copy();};
	seq.map(function(item) {
	    rv.push(item);
	    rv.push(cf(item));
	});
	return rv;
    };
    this.itemList = expandSeq(this.itemList);
    return this.itemList;
};

/**
 * Return string representation of this Seq
 *
 * @method toString
 * @return {String} representation of this Seq
 */
JPRO.Seq.prototype.toString = function() {
    var i, typ, s;
    var rv = '[';
    for (i=0; i<this.itemList.length; i++) {
	typ = typeof(this.itemList[i]);
	if (i > 0) {
	    rv = rv + ', ';
	}
	if (typ === 'object') {
	    s = this.itemList[i].toString();
	}
	else {
	    s = this.itemList[i];
	}
	rv = rv + s;
    }
    rv = rv + ']';
    return rv;
};
