/**
 * @author Ed Carstens
 */

/**
 * A Vec represents a 3D vector
 *
 * @class Vec
 * @constructor
 * @param
 *
 *
 */

"use strict";

JPRO.Vec = function(x, y, z) {

    /**
     * X cartesian coordinate
     *
     * @property x
     * @type number
     */
    this.x = x || 0;

    /**
     * Y cartesian coordinate
     *
     * @property y
     * @type number
     */
    this.y = y || 0;

    /**
     * Z cartesian coordinate
     *
     * @property z
     * @type number
     */
    this.z = z || 0;
};

// constructor
JPRO.Vec.prototype.constructor = JPRO.Vec;

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
 * Adds vectors; adds another Vec to this Vec and
 * returns a new Vec.
 *
 * @method add
 * @param v {Vec} the other vector
*/
JPRO.Vec.prototype.add = function(v) {
    return new Vec(
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
