/**
 * @author Ed Carstens
 */

/*
 * A Pose object represents the pose of an Arm.
 *
 * @class Pose
 * @extends Base
 * @constructor
 * @param pos
 * @param facingAngle
 * @param poseAngles (Array) of six angles
 * @param name
 */

(function () {
    'use strict';
    JPRO.ID.Pose = 0;
    JPRO.Pose = function(pos, facingAngle, poseAngles, name) {
	// Call superclass
	this.className = this.className || 'Pose';
	JPRO.Base.call(this, name);

	//this.pos = pos;
	//this.facingAngle = facingAngle;
	pos = pos || new JPRO.Vec();
	this.x = [pos.x, pos.y, pos.z, facingAngle];
	this.x = this.x.concat(poseAngles);
	this.d = [];
	this.v = [];
	this.a = [];
    };

    JPRO.Pose.prototype = Object.create(JPRO.Base.prototype);
    JPRO.Pose.prototype.constructor = JPRO.Pose;

    JPRO.Pose.prototype.copy = function(objHash, cFunc) {
	var pFuncs = {};
	var scalars = ['x'];
	var obj = this.directedCopy(objHash, cFunc, pFuncs, scalars);
	return obj;
    };
    
})();
