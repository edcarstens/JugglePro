/**
 * @author Ed Carstens
 */

// Common Functions
/**
 * A library of common generic functions,
 *
 * @class Common
 * @static
 */
 
(function () {

    'use strict';
    
    JPRO.Common = {};

    /* jshint unused:false */
    // The objHash is here to conform to a standard
    // argument list for property copy functions
    JPRO.Common.copyHash = function(h, objHash) {
	var rv = {};
	var x;
	for (x in h) {
	    rv[x] = h[x];
	}
	return rv;
    };
    /* jshint unused:true */

    // This function does not conform to the
    // standard argument list (p, objHash) for
    // property copy functions.
    // Call makeCopyMatrix(d) to create a
    // conforming property copy function.
    JPRO.Common.copyMatrix = function(m, d) {
	if (d === 0) {
	    return m;
	}
	var i;
	var rv = [];
	for (i=0; i<m.length; i++) {
	    rv.push(JPRO.Common.copyMatrix(m[i], d-1));
	}
	return rv;
    };
    
    JPRO.Common.makeCopyMatrix = function(d) {
	/* jshint unused:false */
	return function(p, objHash) {
	    return JPRO.Common.copyMatrix(p, d);
	};
	/* jshint unused:true */
    };
    
    JPRO.Common.copyObjMatrix = function(m, objHash) {
	var i;
	var rv = [];
	for (i=0; i<m.length; i++) {
	    rv.push(JPRO.Common.copyObjVector(m[i], objHash));
	}
	return rv;
    };
    
    JPRO.Common.copyObjVector = function(v, objHash) {
	var i;
	var rv = [];
	for (i=0; i<v.length; i++) {
	    rv.push(v[i].copy(objHash));
	}
	return rv;
    };

})();

