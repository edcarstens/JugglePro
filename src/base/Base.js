/**
 * @author Ed Carstens
 */

/**
 * Base Class for most JPRO Classes
 *
 * @class Base
 * @constructor
 * @param
 *
 *
 */

(function () {

    'use strict';
    JPRO.Base = function(name) {

	/**
	 * className (should be defined prior to Base construction)
	 *
	 * @property className
	 * @type String
	 */
	this.className = this.className || 'Base';

	/**
	 * Name (optional)
	 *
	 * @property name
	 * @type String
	 */
	this.name = name || this.className + '_' + JPRO.ID[this.className]++;
    };

    // constructor
    JPRO.Base.prototype.constructor = JPRO.Base;

    /**
     * Copies a JPRO object with a deep copy, meaning
     * all properties/functions of the object are copied
     * with a deep copy.
     *
     * @method copyOnce
     * @param objHash {Object}  Optional hash (object) keeps track of
     *                          every object copied by name
     * @param cFunc {Function}  Optional constructor function returning
     *                          target object
     * @param skip {Object}     Optional hash of obj properties to skip
     * @param pFuncs {Object}   Optional hash of functions to call to copy
     *                          each property; each function takes two params,
     *                          function(p,objHash), and returns copy of p.
     * @param callBacks {Array} Array of callBack functions to be copied.
     * @return {Object} the copied JPRO object
     */
    JPRO.Base.prototype.copyOnce = function(objHash, cFunc, skip, pFuncs, callBacks) {
	objHash = objHash || {};
	if (objHash[this.name] !== undefined) { return objHash[this.name]; }
	cFunc = cFunc || function() { return new JPRO[this.className](); };
	var obj,p,x;
	skip = skip || {};
	skip.name = 1; // always skip the name property
	skip.className = 1; // always skip className property
	skip.constructor = 1; // always skip constructor
	pFuncs = pFuncs || {};
	callBacks = callBacks || [];
	x = JPRO.ID[this.className];
	obj = cFunc.call(this);
	JPRO.ID[this.className] = x;
	obj.name = this.name + '_copy';
	objHash[this.name] = obj;
	objHash[obj.name] = this;
	for (p in this) {
	    if (skip[p]) continue;
	    if (pFuncs[p]) {
		obj[p] = pFuncs[p](this[p], objHash);
		continue;
	    }
	    x = typeof this[p];
	    if (x === 'function') continue;

	    if (this[p] && (x === 'object')) {
		obj[p] = this[p].copy(objHash);
	    }
	    else {
		obj[p] = this[p];
	    }
	}
	for (x in callBacks) {
	    p = callBacks[x];
	    obj[p] = this[p];
	}
	return obj;
    };

    /**
     * Copies specified properties of a JPRO object with a deep copy,
     * meaning the copy recurses objects. This should be faster than
     * the general copyOnce method, but requires the user to
     * specify every property to be copied.
     *
     * @method directedCopy
     * @param objHash {Object}  Optional hash (object) keeps track of
     *                          every object copied by name
     * @param cFunc {Function}  Optional constructor function returning
     *                          target object
     * @param pFuncs {Object}   Optional hash of functions to call to copy
     *                          each property; each function takes two params,
     *                          function(p,objHash), and returns copy of p.
     * @param scalars {Array}   Array of simple scalar properties or
     *                          callbacks to be copied.
     * @param objects {Array}   Array of parameters that are JPRO objects
     * @return {Object} copied JPRO object
     */
    JPRO.Base.prototype.directedCopy = function(objHash, cFunc, pFuncs, scalars, objects) {
	objHash = objHash || {};
	if (objHash[this.name] !== undefined) { return objHash[this.name]; }
	cFunc = cFunc || function() { return new JPRO[this.className](); };
	var obj,p,x;
	pFuncs = pFuncs || {};
	scalars = scalars || [];
	objects = objects || [];
	//x = JPRO.ID[this.className];
	obj = cFunc.call(this);
	//JPRO.ID[this.className] = x;
	//obj.name = this.name + '_copy';
	objHash[this.name] = obj;
	objHash[obj.name] = this;
	for (p in pFuncs) {
	    obj[p] = pFuncs[p](this[p], objHash);
	}
	for (x in scalars) {
	    p = scalars[x];
	    obj[p] = this[p];
	}
	for (x in objects) {
	    p = objects[x];
	    obj[p] = this[p].copy(objHash);
	}
	return obj;
    };

/**
 * Copy (default)
 * Modify this method in your derived class to set
 * your own cFunc constructor function. Otherwise, the
 * default cFunc will be JPRO[this.className](). If
 * there are property types such as arrays you will
 * also have to modify this method in order to make
 * deep copies of arrays properly. Hashes (objects)
 * are another special case. These exceptions must be
 * added to the skip hash in copyOnce. Functions are
 * not copied unless put into the callBacks array.
 *
 * @method copy
 * @return {Base} copied JPRO object
 */
JPRO.Base.prototype.copy = function(objHash, cFunc) {
    return this.copyOnce(objHash, cFunc);
};

})();
