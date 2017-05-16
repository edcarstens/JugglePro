/**
 * @author Ed Carstens
 */

/**
 * A Arm represents a full arm (including hand)
 *
 * @class Arm
 * @extends Base
 * @constructor
 * @param uaLength
 * @param faLength
 * @param handLength
 * @param name
 *
 */

(function () {

    'use strict';
    JPRO.ID.Arm = 0;
    JPRO.Arm = function(uaLength, faLength, handLength, name) {
	// Call superclass
	this.className = this.className || 'Arm';
	JPRO.Base.call(this, name);

	this.bones = [
	    new JPRO.Bone(name+'_ua', uaLength),
	    new JPRO.Bone(name+'_fa', faLength),
	    new JPRO.Bone(name+'_h', handLength)
	];
    };
    JPRO.Arm.prototype = Object.create(JPRO.Base.prototype);
    JPRO.Arm.prototype.constructor = JPRO.Arm;

    JPRO.Arm.prototype.copy = function(objHash, cFunc) {
	var pFuncs = {};
	var scalars = [];
	var obj = this.directedCopy(objHash, cFunc, pFuncs, scalars);
	obj.bones = this.bones.slice(0);
	return obj;
    };

    JPRO.Arm.prototype.jointPos = function(pose) {
	var facingAngle;
	facingAngle = pose.x[3];
	this.bones[0].pitch = pose.x[4];    // upper arm pitch
	this.bones[0].yaw = pose.x[5];      // upper arm yaw
	this.bones[1].pitch = pose.x[6];    // forearm pitch
	this.bones[1].yaw = pose.x[7];      // forearm yaw
	this.bones[1].roll = pose.x[8];     // forearm roll
	this.bones[2].pitch = pose.x[9];    // hand pitch
	var r00 = new JPRO.Rmatrix(this.bones[0].pitch, 0); // rotation about X axis
	var r02 = new JPRO.Rmatrix(this.bones[0].yaw, 2);   // rotation about Z axis
	r00.xMatrix(r02);
	r00.col4 = new JPRO.Vec(0, 0, 0);
	var r10 = new JPRO.Rmatrix(this.bones[1].pitch, 0);
	var r12 = new JPRO.Rmatrix(this.bones[1].yaw, 2);
	var r11 = new JPRO.Rmatrix(this.bones[1].roll, 1); // rotation about Y axis
	r10.xMatrix(r12).xMatrix(r11);
	r10.col4 = new JPRO.Vec(0, this.bones[0].length, 0);

	// calculate position of elbow
	var elbow = r00.xVec(r10.col4);
	
	var r20 = new JPRO.Rmatrix(this.bones[2].pitch, 0);
	r20.col4 = new JPRO.Vec(0, this.bones[1].length, 0);

	// Now multiply the 4x4 matrixes
	r00.xMatrix4(r10.xMatrix4(r20));
	// 4th Column vector is position of wrist in jugglers frame

	// calculate position of hand
	var hpos = r00.xVec4(new JPRO.Vec(0, this.bones[2].length, 0));
	// calculate position of 'thumb' to aid 3d orientation
	var tpos = r00.xVec4(new JPRO.Vec(this.bones[2].length, 0, 0));

	// we still need one more transformation to the view frame
	//var rfinal = new JPRO.Rmatrix(this.facingAngle, 2); // rotation about Z axis
	var rfinal = new JPRO.Rmatrix(facingAngle - 90, 2); // rotation about Z axis
	rfinal.col4 = new JPRO.Vec(pose.x[0], pose.x[1], pose.x[2]);

	// calculate position of hand, thumb, elbow and wrist in final frame
	var finalElbow = rfinal.xVec4(elbow);
	var finalWrist = rfinal.xVec4(r00.col4);
	var finalHand = rfinal.xVec4(hpos);
	var finalThumb = rfinal.xVec4(tpos);
	var rv = [finalHand, finalThumb, finalWrist, finalElbow];
	return rv;
    };

})();
