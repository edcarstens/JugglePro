/**
 * @author Ed Carstens
 */

/**
 * A Matrix represents a 3x3 matrix or
 * a special 4x4 matrix for robotics kinematics math
 *
 * @class Matrix
 * @constructor
 * @param row1 {Vec} the first row of the matrix
 * @param row2 {Vec} the second row of the matrix
 * @param row3 {Vec} the third row of the matrix
 * @param col4 {Vec} optional fourth column of matrix
 *
 */

(function () {

'use strict';

JPRO.Matrix = function(row1, row2, row3, col4) {

    var r1 = row1 || new JPRO.Vec(1,0,0);
    var r2 = row2 || new JPRO.Vec(0,1,0);
    var r3 = row3 || new JPRO.Vec(0,0,1);
    
    /**
     * 3x3 matrix
     *
     * @property m
     * @type Array
     */
    this.m = [r1.getX(), r1.getY(), r1.getZ(),
	      r2.getX(), r2.getY(), r2.getZ(),
	      r3.getX(), r3.getY(), r3.getZ()];
    
    /**
     * 4th column in special 4x4 matrix
     * This column vector represents a linkage
     * translation in robotic kinematics math.
     *
     * @property col4
     * @type Array
     */
    this.col4 = (col4 === null) ? new JPRO.Vec() : col4; // 4th column
};

// constructor
JPRO.Matrix.prototype.constructor = JPRO.Matrix;

/**
 * Multiplies two matrixes
 *
 * @method xMatrix
 * @param a {Matrix} is matrix to multiply this matrix by
 * @return {Matrix} result
*/
JPRO.Matrix.prototype.xMatrix = function(a) {
    var m0,m1,m2,m3,m4,m5,m6,m7,m8;
    m0 = this.m[0]*a.m[0] + this.m[1]*a.m[3] + this.m[2]*a.m[6];
    m1 = this.m[0]*a.m[1] + this.m[1]*a.m[4] + this.m[2]*a.m[7];
    m2 = this.m[0]*a.m[2] + this.m[1]*a.m[5] + this.m[2]*a.m[8];
    m3 = this.m[3]*a.m[0] + this.m[4]*a.m[3] + this.m[5]*a.m[6];
    m4 = this.m[3]*a.m[1] + this.m[4]*a.m[4] + this.m[5]*a.m[7];
    m5 = this.m[3]*a.m[2] + this.m[4]*a.m[5] + this.m[5]*a.m[8];
    m6 = this.m[6]*a.m[0] + this.m[7]*a.m[3] + this.m[8]*a.m[6];
    m7 = this.m[6]*a.m[1] + this.m[7]*a.m[4] + this.m[8]*a.m[7];
    m8 = this.m[6]*a.m[2] + this.m[7]*a.m[5] + this.m[8]*a.m[8];
    this.m = [m0, m1, m2,
	      m3, m4, m5,
	      m6, m7, m8];
    return this;
};

/**
 * Multiplies two 4x4 matrixes
 * [R1 c1] x [R2 c2] = [R1xR2 R1xc2+c1]
 *
 * @method xMatrix4
 * @param a {Matrix} is matrix to multiply this matrix by
 * @return {Matrix} result
*/
JPRO.Matrix.prototype.xMatrix4 = function(a) {
    this.col4.acc(this.xVec(a.col4));
    return this.xMatrix(a);
};

/**
 * Multiply this matrix by vector
 * Returns new vector = M*v
 * @method xVec
 * @param v {Vec}
 * @return {Vec} result
*/
JPRO.Matrix.prototype.xVec = function(v) {
    var x = v.getX();
    var y = v.getY();
    var z = v.getZ();
    return new JPRO.Vec(
	this.m[0]*x + this.m[1]*y + this.m[2]*z,
	this.m[3]*x + this.m[4]*y + this.m[5]*z,
	this.m[6]*x + this.m[7]*y + this.m[8]*z
    );
};

/**
 * Multiplies this 4x4 matrix by vector
 *
 * @method xVec4
 * @param v {Vec} vector to multiply this matrix by
 * @return {Vec} result
*/
// [R1 c1] * [v] = [R1 * v + c1]
JPRO.Matrix.prototype.xVec4 = function(v) {
    return this.xVec(v).acc(this.col4);
};

/**
 * Multiplies this matrix by vector and result is
 * stored in vector, then returns this matrix.
 *
 * @method xV
 * @param v {Vec} vector to be transformed by this matrix
 * @return this (matrix)
*/
// Returns this matrix after v=M*v
JPRO.Matrix.prototype.xV = function(v) {
    var x = v.getX();
    var y = v.getY();
    var z = v.getZ();
    v.x = this.m[0]*x + this.m[1]*y + this.m[2]*z;
    v.y = this.m[3]*x + this.m[4]*y + this.m[5]*z;
    v.z = this.m[6]*x + this.m[7]*y + this.m[8]*z;
    return this;
};

/**
 * Return string representing matrix
 *
 * @method toString
 * @return string representing matrix
*/
JPRO.Matrix.prototype.toString = function() {
    return '[[' + this.m[0] + ',' + this.m[1] + ',' + this.m[2] + '], [' +
	this.m[3] + ',' + this.m[4] + ',' + this.m[5] + '], [' +
	this.m[6] + ',' + this.m[7] + ',' + this.m[8] + ']]';
};

// Static Matrix functions

/**
 * Return transpose of arbitrary square matrix
 *
 * @method transpose
 * @param m {Array} this is a square matrix
 * @return transpose of matrix
*/
JPRO.Matrix.transpose = function(m) {
    var i,j;
    var cols = m[0].length; // assume square matrix
    var rv = [];
    var col = [];
    for (j=0; j<cols; j++) {
	col = [];
	for (i=0; i<m.length; i++) {
	    col.push(m[i][j]);
	}
	rv.push(col);
    }
    return rv;
};

})();
