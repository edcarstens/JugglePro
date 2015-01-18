/**
 * @author Ed Carstens
 */

/**
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
    JPRO.Dynamic = function(routine) {
	this.routine = routine;
	this.type = 'Dynamic';
    };
    JPRO.Dynamic.prototype.constructor = JPRO.Dynamic;

    JPRO.Dynamic.prototype.copy = function(rhmHash) {
	return new JPRO.Dynamic(this.routine.copy(rhmHash));
    };

    JPRO.Dynamic.prototype.getRoutine = function(parentRoutine, laf) {
	return this.routine;
    };

    JPRO.Dynamic.prototype.toString = function() {
	return this.routine.toString;
    };
}());
