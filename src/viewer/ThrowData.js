/**
 * @author Ed Carstens
 */

/**
 * ThrowData is a class for storing precalculated data for future throws.
 *
 * @class ThrowData
 * @constructor
 *
 */

JPRO.ThrowData = function(pos, destRow, th) {
    this.pos = pos;
    this.destHand = null;
    this.destRow = destRow;
    this.throwHeight = th;
    this.vel = new JPRO.Vec();
    this.timer = 0;
    this.catchTime = 0;
};

JPRO.ThrowData.prototype.constructor = JPRO.ThrowData;

/**
 * 
 *
 * @method 
 * @param  {} 
 * @return {} 
 */
JPRO.ThrowData.prototype.nextBeat = function() {
    if (this.throwHeight >= 0) {
	this.throwHeight--;
    }
    return this.throwHeight;
};

/**
 * 
 *
 * @method 
 * @param  {} 
 * @return {} 
 */
JPRO.ThrowData.prototype.setVel = function(dest, g) {
    var time = this.timer;
    var p = this.pos;
    var rx = (dest.x-p.x)/time - time*g.x/2;
    var ry = (dest.y-p.y)/time - time*g.y/2;
    var rz = (dest.z-p.z)/time - time*g.z/2;
    this.vel.set(rx,ry,rz);
};
