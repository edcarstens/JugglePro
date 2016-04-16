/**
 * @author Ed Carstens
 */

/**
 * JugThrows is a class representing multiplex throws (JugThrow objects)
 * all of which occur at the same beat and from the same control point.
 *
 * @class JugThrows
 * @extends Base
 * @constructor
 * @param jugThrows {Array} list of JugThrow objects
 * @param preDwellRatio
 * @param postDwellRatio
 * @param name {String} name of this JugThrows object
 *
 */

(function () {

    'use strict';
    JPRO.ID.JugThrows = 0;
    JPRO.JugThrows = function(jugThrows, preDwellRatio, postDwellRatio, name) {
	// Call superclass
	this.className = this.className || 'JugThrows';
	JPRO.Base.call(this, name);

	/**
	 * list of JugThrow objects
	 *
	 * @property jugThrows
	 * @type Array
	 */
	this.jugThrows = (jugThrows === undefined) ? [] : jugThrows;
	
	/**
	 * Ratio of dwell time before destination beat
	 * after catch to (the beat time just prior
	 * to destination beat).
	 * This setting applies to each JugThrow in
	 * jugThrows, unless overridden.
	 *
	 * @property preDwellRatio
	 * @type Number
	 */
	this.preDwellRatio = preDwellRatio ? preDwellRatio : 0;

	/**
	 * Ratio of dwell time after current beat before this
	 * throw to (the time interval from current beat to
	 * the next beat).
	 * This setting applies to each JugThrow in
	 * jugThrows, unless overridden.
	 * 
	 * @property postDwellRatio
	 * @type Number
	 */
	this.postDwellRatio = postDwellRatio ? postDwellRatio : 0;

    };

    JPRO.JugThrows.prototype = Object.create(JPRO.Base.prototype);
    JPRO.JugThrows.prototype.constructor = JPRO.JugThrows;

    /**
     * Sets pre- and post-dwell ratios for all JugThrow objects
     * in jugThrows.
     *
     * @method setDwellRatios
     * @param preDwellRatio
     * @param postDwellRatio
     * @return {JugThrows} this object
     */
    JPRO.JugThrows.prototype.setDwellRatios = function(preDwellRatio, postDwellRatio) {
	var k;
	for (k=0; k<this.jugThrows.length; k++) {
	    this.jugThrows[k].preDwellRatio = preDwellRatio;
	    this.jugThrows[k].postDwellRatio = postDwellRatio;
	}
	return this;
    };
    
})();
