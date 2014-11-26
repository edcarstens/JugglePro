/**
 * @author Ed Carstens
 */

/**
 * A View keeps track of orientation (or rotations) of vectors in
 * a "world" of objects. 
 * @class View
 * @constructor
 * @param viewer {Viewer} the viewer object
 * @param width {Number} the width of the view screen
 * @param height {Number} the height of the view screen
 * @param scale {Number} log2 of scaling factor
 *
 */

"use strict";

JPRO.View = function(viewer, width, height, scale) {

    /**
     * Pointer to the Viewer object
     *
     * @property viewer
     * @type Viewer
     */
    this.viewer = viewer;

    /**
     * Width of view screen
     *
     * @property width
     * @type Number
     */
    this.width = width || 800;

    /**
     * Height of view screen
     *
     * @property height
     * @type Number
     */
    this.height = height || 600;

    /**
     * Origin of 3D coordinate in projection frame,
     # translates the position prior to projection
     *
     * @property origin
     * @type Vec
     */
    this.origin = new Vec(this.width/2, 0, this.height/2);

    /**
     * World rotation
     *
     * @property rot
     * @type Matrix
     */
    this.rot = new Matrix();

    /**
     * World translation
     *
     * @property translation
     * @type Vec
     */
    this.translation = new Vec();
    
    /**
     * Scaling factor - coordinates are scaled up by 2^scale
     *
     * @property scale
     * @type Number
     */
    this.scale = scale || 4;

    /**
     * Gravity vector (actually acceleration of gravity)
     *
     * @property g
     * @type Vec
     */
    this.g = new Vec(0,0,-4);
    
    /**
     * List of vectors subject to rotation only,
     * namely, accelerations and velocities
     *
     * @property worldRot
     * @type Array
     */
    this.worldRot = [this.g];

    /**
     * List of position vectors subject to both rotation and
     * translation
     *
     * @property worldPos
     * @type Array
     */
    this.worldPos = [];
    
    /**
     * Represents zoom position of observer
     *
     * @property depthOffset
     * @type Number
     */
    this.depthOffset = 160;

    /**
     * Distance from focus (eye) to 2D projection screen
     *
     * @property focalDistance
     * @type Number
     */
    this.focalDistance = 400;
};

// constructor
JPRO.View.prototype.constructor = JPRO.View;

/**
 * Transform 3D vector to this view
 *
 * @method transform
 * @param v {Vec} vector to be transformed
 * @return {Vec} result of rotation and translation
*/
JPRO.View.prototype.transform = function(v) {
    return this.rot.xVec(v).acc(this.translation);
};

/**
 * Rotate this view with rotation matrix r
 *
 * @method rotateMe
 * @param r {Matrix} rotation matrix
 * @return {View} this view
*/ 
JPRO.View.prototype.rotateMe = function(r) {
    var i;
    this.rot.xMatrix(r);
    // Rotate all vectors in world list
    for (i=0; i<this.worldRot.length; i++) {
	r.xV(this.worldRot[i]);
    }
    for (i=0; i<this.worldPos.length; i++) {
	r.xV(this.worldPos[i]);
    }
    return this;
};

/**
 * Translate this view with translation vector v
 *
 * @method translateMe
 * @param v {Vec} translation vector
*/
JPRO.View.prototype.translateMe = function(v) {
    var i;
    this.translation.acc(v);
    // Translate all vectors in world list
    for (i=0; i<this.worldPos.length; i++) {
	this.worldPos[i].acc(v);
    }
};
    
/**
 * Project 3D (transformed) position onto 2D screen
 *
 * @method project
 * @param pos {Vec} 3D position to be projected
 * @return {Vec} returns vector <x,y,dscale> - dscale is depth scale factor
*/
JPRO.View.prototype.project = function(pos) {
    var dscale =  this.depth2Dscale(this.origin.getY() + (pos.getY() >> this.scale));
    var x = this.origin.getX() + (pos.getX() >> this.scale) * dscale;
    var y = this.height - (this.origin.getZ() + (pos.getZ() >> this.scale) * dscale);
    return new JPRO.Vec(x, y, dscale);
};

/**
 * Appends vector v to the world rotation list
 *
 * @method pushRvec
 * @param v {Vec} vector to add to world rotation list
 * @return {View} this view
*/
JPRO.View.prototype.pushRvec = function(v) {
    this.worldRot.push(v);
    return this;
};

/**
 * Appends a vector v to the world position list
 *
 * @method pushPvec
 * @param v {Vec} vector to add to world position list
 * @return {View} this view
*/
JPRO.View.prototype.pushPvec = function(v) {
    this.worldPos.push(v);
    return this;
};

/**
 * Appends position and velocity of prop
 *
 * @method pushProp
 * @param p {Prop} juggling prop to add to world lists
 * @return {View} this view
*/
JPRO.View.prototype.pushProp = function(p) {
    this.pushPvec(p.pos).pushRvec(p.vel);
    return this;
};

/**
 * Depth to depth scale factor conversion function
 *
 * @method depth2Dscale
 * @param depth {Number}
 * @return {Number} depth scale factor
*/
JPRO.View.prototype.depth2Dscale = function(depth) {
    var dscale;
    var tdepth = depth + this.depthOffset; // translate
    if (tdepth < 0) tdepth = 0;
    dscale = this.focalDistance/(this.focalDistance + tdepth);
    return dscale;
};
