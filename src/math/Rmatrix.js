/**
 * @author Ed Carstens
 */

/**
 * A Rotation matrix is a special matrix used to
 * rotate a vector or another rotation matrix into
 * a new frame of reference.
 *
 * @class Rmatrix
 * @constructor
 * @param degrees {Number} the degrees of rotation
 * @param axis {Number} the axis of rotation
 *
 */

(function () {

'use strict';

JPRO.Rmatrix = function(degrees, axis) {
    this.degrees = degrees || 0;
    this.axis = axis || JPRO.XAXIS; // JPRO.XAXIS=0
    
    var radians = degrees*PIXI.DEG_TO_RAD;
    var s = Math.sin(radians);
    var c = Math.cos(radians);
    var m = [c,-s,0,s,c,0,0,0,1];
    if (axis === JPRO.XAXIS) {
	m = [1,0,0,0,c,-s,0,s,c];
    }
    else if (axis === JPRO.YAXIS) {
	m = [c,0,s,0,1,0,-s,0,c];
    }
    var r1 = new JPRO.Vec(m[0],m[1],m[2]);
    var r2 = new JPRO.Vec(m[3],m[4],m[5]);
    var r3 = new JPRO.Vec(m[6],m[7],m[8]);
    JPRO.Matrix.call(this,r1,r2,r3);
};

// constructor
JPRO.Rmatrix.prototype = Object.create( JPRO.Matrix.prototype );
JPRO.Rmatrix.prototype.constructor = JPRO.Rmatrix;

})();
