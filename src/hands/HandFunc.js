/**
 * @author Ed Carstens
 */

/*
 * A HandFunc object provides methods..
 *
 * @class HandFunc
 * @constructor
 * @param name
 * @param
 */

(function () {
    'use strict';
    JPRO.ID.HandFunc = 0;
    JPRO.HandFunc = function(name, owner, isRight, posePat ) {
	// Call superclass
	this.className = this.className || 'HandFunc';
	JPRO.Base.call(this, name);
	this.owner = owner;
	if (owner) {
	    //this.name = name || 'Func_' + JPRO.Handfun.ID.Func++;
	    this.scale = JPRO.Handfun.scale;
	    var neckPos = owner.neckPos;
	    this.shoulderWidth = owner.shoulderWidth;
	    this.upperArmLength = owner.upperArmLength;
	    this.foreArmLength = owner.foreArmLength;
	    this.handLength = owner.handLength;
	    // calculate right or left shoulder position
	    this.shoulderAngle = isRight ? -90 : 90;
	    //this.throwBeat = isRight ? 0 : 1;
	    this.facingAngle = owner.facingAngle;
	    var srad = (this.facingAngle + this.shoulderAngle) * PIXI.DEG_TO_RAD;
	    var x = neckPos.getX() + this.shoulderWidth * Math.cos(srad);
	    var y = neckPos.getY() + this.shoulderWidth * Math.sin(srad);
	    this.shoulderPos = new JPRO.Vec(x, y, neckPos.getZ());
	    this.ps = new JPRO.Vec();
	    this.ps.setV(this.shoulderPos);
	    this.ps.scale(this.scale);
	}
	if (posePat) {
	    this.posePatC = new JPRO.PosePatC(null, posePat);
	    this.posePatC.calcXva();
	}
    };
    JPRO.HandFunc.prototype = Object.create(JPRO.Base.prototype);
    JPRO.HandFunc.prototype.constructor = JPRO.HandFunc;

    JPRO.HandFunc.prototype.getPose = function(tIn) {
	var posesXva = this.poseSeq.posesXva;
	var np = posesXva.length;
	var t = tIn * np;
	if (t >= np) t -= np;
	var t0 = Math.floor(t);
	var dt = t - t0;
	var i,xva,x0,v0,a0,x;
	var poseAngles = [];
	for (i=0; i<posesXva[t0].length; i++) {
	    xva = posesXva[t0];
	    x0 = xva[0];
	    v0 = xva[1];
	    a0 = xva[2];
	    x = x0 + v0*dt/2 + a0*dt*dt/4;
	    poseAngles.push(x);
	}
	// TODO - JPRO.Pose
	var p = new JPRO.Handfun.Pose(this.shoulderPos, this.facingAngle, this.upperArmLength, this.foreArmLength, this.handLength);
	p.set( poseAngles[0],
	       poseAngles[1],
	       poseAngles[2],
	       poseAngles[3],
	       poseAngles[4],
	       poseAngles[5]
	     );
	return p;	
    };

    JPRO.Handfun.Func.prototype.getPos = function(t) {
	var pose = this.getPose(t);
	var jointPositions = pose.jointPos();
	var p = new JPRO.Vec().setV(jointPositions[0]);
	var pt = new JPRO.Vec().setV(jointPositions[1]);
	var pw = new JPRO.Vec().setV(jointPositions[2]);
	var pe = new JPRO.Vec().setV(jointPositions[3]);
	p.scale(this.scale);   // position of hand
	pt.scale(this.scale);  // position of thumb
	pw.scale(this.scale);  // position of wrist
	pe.scale(this.scale);  // position of elbow
	//console.log('Hand Position = ' + p.toString());
	return [p, pt, pw, pe, this.ps];
    };

    JPRO.HandFunc.prototype.nextBeat = function() {
	this.poseSeq = this.posePatC.nextBeat();
    };
    
    
})();
