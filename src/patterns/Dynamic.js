/**
 * @author Ed Carstens
 */

/**
*** OBSOLETE ***
*** This was problematic so currently dynamic pattern modification will not be supported


 * Abstract base class for dynamic pattern modification
 * The getRoutine method can perform dynamic modification and returns a Routine.
 * The copy method is called when creating a copy for lookahead.
 * Usually just getRoutine will be customized to do desired dynamic modification(s).
 * A reference to the containing (parent) Routine is provided and the
 * look-ahead flag (laf) is provided to indicate when the look-ahead function is
 * being performed.
 *
 * @class Dynamic
 * @constructor
 * @param routine {Routine}
 */
(function () {
    'use strict';
    JPRO.ID.Dynamic = 0;
    JPRO.Dynamic = function(routine, name) {

	// Call superclass
	this.className = this.className || 'Dynamic';
	JPRO.Base.call(this, name);

	this.routine = routine;
	this.type = 'Dynamic';
    };
    JPRO.Dynamic.prototype = Object.create(JPRO.Base.prototype);
    JPRO.Dynamic.prototype.constructor = JPRO.Dynamic;

    /**
     * Copy
     *
     * @method copy
     * @param objHash {Object} tracks all copied objects
     * @param cFunc {Function} constructor function
     * @return {Dynamic} copied Dynamic
     */
    JPRO.Dynamic.prototype.copy = function(objHash, cFunc) {
	var callBacks = ['getRoutine'];
	return this.copyOnce(objHash, cFunc, {}, {}, callBacks);
    };

    /* jshint unused:false */
    JPRO.Dynamic.prototype.getRoutine = function(parentRoutine, laf) {
	return this.routine;
    };
    /* jshint unused:true */
    JPRO.Dynamic.prototype.toString = function() {
	return this.routine.toString;
    };
}());
