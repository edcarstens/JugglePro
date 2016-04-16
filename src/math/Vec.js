/**
 * @author Ed Carstens
 */

/**
 * A Vec represents a 3D vector
 *
 * @class Vec
 * @constructor
 * @param x
 * @param y
 * @param z
 *
 *
 */

(function () {

'use strict';
JPRO.ID.Vec = 0;
JPRO.Vec = function(x, y, z) {

    // Call superclass
    this.className = this.className || 'Vec';
    JPRO.Base.call(this);

    /**
     * X cartesian coordinate
     *
     * @property x
     * @type Number
     */
    this.x = x || 0;

    /**
     * Y cartesian coordinate
     *
     * @property y
     * @type Number
     */
    this.y = y || 0;

    /**
     * Z cartesian coordinate
     *
     * @property z
     * @type Number
     */
    this.z = z || 0;

};

// constructor
JPRO.Vec.prototype = Object.create(JPRO.Base.prototype);
JPRO.Vec.prototype.constructor = JPRO.Vec;
    
/**
 * Copy
 *
 * @method copy
 * @return {Vec} copied vector
 */
//JPRO.Vec.prototype.copy = function(objHash, obj) {
//JPRO.Vec.prototype.copy = function(objHash, cFunc) {
    //cFunc = cFunc || function() { return new JPRO.Vec(); };
//    return this.copyOnce(objHash, cFunc);
//};
    
/**
 * Getter function for X coordinate
 *
 * @method getX
 * @return {Number} X coordinate
*/
JPRO.Vec.prototype.getX = function() {
    return this.x;
};
    
/**
 * Getter function for Y coordinate
 *
 * @method getY
 * @return {Number} Y coordinate
*/
JPRO.Vec.prototype.getY = function() {
    return this.y;
};
    
/**
 * Getter function for Z coordinate
 *
 * @method getZ
 * @return {Number} Z coordinate
*/
JPRO.Vec.prototype.getZ = function() {
    return this.z;
};

/**
 * Setter function for X,Y,Z coordinates
 *
 * @method set
 * @param x {number} the X coordinate
 * @param y {number} the Y coordinate
 * @param z {number} the Z coordinate
*/
JPRO.Vec.prototype.set = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
};
    
/**
 * Setter function for X,Y,Z coordinates from Vec
 *
 * @method setV
 * @param v {Vec} Vec object from which coordinates are copied
*/
JPRO.Vec.prototype.setV = function(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
};

/**
 * Calculates manhattan distance from this point to another point.
 *
 * @method mDist
 * @param v {Vec} the other point
*/
JPRO.Vec.prototype.mDist = function(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
};

/**
 * Calculates manhattan distance from this point to another point
 * using only the X and Y coordinates.
 *
 * @method mDist2
 * @param v {Vec} the other point
*/
JPRO.Vec.prototype.mDist2 = function(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
};

/**
 * Scales all three coordinates by some power of 2
 *
 * @method scale
 * @param sc {number} Coordinates are scaled by 2^sc
*/
JPRO.Vec.prototype.scale = function(sc) {
    this.x = this.x << sc;
    this.y = this.y << sc;
    this.z = this.z << sc;
};

/**
 * Returns new Vec = 1/2 this Vec
 *
 * @method half
 * @return {Vec}
 */
JPRO.Vec.prototype.half = function() {
    return new JPRO.Vec(
	this.x >> 1,
	this.y >> 1,
	this.z >> 1
    );
};

/**
 * Negates all three coordinates
 *
 * @method neg
 * @param sc {number} Coordinates are all negated
*/
JPRO.Vec.prototype.neg = function() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
};

/**
 * Adds vectors; adds another Vec to this Vec and
 * returns a new Vec.
 *
 * @method add
 * @param v {Vec} the other vector
*/
JPRO.Vec.prototype.add = function(v) {
    return new JPRO.Vec(
	this.x + v.x,
	this.y + v.y,
	this.z + v.z
    );
};

/**
 * Adds vectors; adds another Vec to this Vec,
 * stores the result in this Vec and returns this Vec.
 *
 * @method
 * @param v {Vec} the other vector
*/
JPRO.Vec.prototype.acc = function(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
};

/**
 * Returns string representing this Vec object.
 *
 * @method toString
*/
JPRO.Vec.prototype.toString = function() {
    return '(' + this.x + ',' + this.y + ',' + this.z + ')';
};

})();
