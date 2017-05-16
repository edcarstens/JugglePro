/**
 * @author Ed Carstens
 */

// Hand Functions
/**
 * A library of hand movement functions,
 * methods return functions with (t, bp)
 * arguments, which return a list of Vec
 * objects representing positions of
 * hand, thumb, wrist, elbow, and
 * shoulder.
 *
 * @class Handfun
 * @static
 */

(function () {

'use strict';

JPRO.Handfun = function() {};

// Class similar to spine
// skeleton made of bones
// Handfun Globals
JPRO.Handfun.scale = 5;

// hand function object
JPRO.ID.Func = 0;    
JPRO.Handfun.Func = function(owner, isRight, posesMatrix, name) {
    var i,j,k;

    // Call superclass
    this.className = this.className || 'Func';
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
    
    if ((posesMatrix !== undefined) && (posesMatrix !== null)) {
	this.movementPeriod = posesMatrix.length;
	this.nposes2 = [];
	this.nposes = [];
	var posesMatrixT;
	this.posesXva = [];
	var largePosesMatrix = [];
	var largePosesXva = [];
	// combine entire movement into one matrix,
	// then split it out after calcXva.
	for (i=0; i<this.movementPeriod; i++) {
	    this.nposes2.push(posesMatrix[i].length);
	    // number of poses (double the specified array length)
	    this.nposes.push(posesMatrix[i].length << 1);
	    // flatten into large matrix
	    largePosesMatrix = largePosesMatrix.concat(posesMatrix[i]);
	}
    
	// transpose pose matrix
	posesMatrixT = JPRO.Matrix.transpose(largePosesMatrix);
	// calculate xva matrix
	largePosesXva = this.calcXva(posesMatrixT);
	// unflatten large transposed posesXva matrix
	k = 0;
	for (j=0; j<this.movementPeriod; j++) {
	    this.posesXva.push([]);
	    for (i=0; i<largePosesXva.length; i++) {
		this.posesXva[j].push(largePosesXva[i].slice(k, k+this.nposes[j]));
	    }
	    k += this.nposes[j];
	}
	k = 99; // for debug breakpoint
    }
};

JPRO.Handfun.Func.prototype = Object.create(JPRO.Base.prototype);
JPRO.Handfun.Func.prototype.constructor = JPRO.Handfun.Func;

/**
 * Copy
 *
 * @method copy
 * @return {Handfun.Func} copied Func
 */
JPRO.Handfun.Func.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    //pFuncs.posesXva = function(p, objHash) {
//	return JPRO.Common.copyMatrix(p, 4);
//    };
    pFuncs.posesXva = JPRO.Common.makeCopyMatrix(4);
    cFunc = cFunc || function() {
	return new JPRO.Handfun.Func();
    };
    var skip = {};
    skip.nposes2 = 1;
    skip.nposes = 1;
    var rv = this.copyOnce(objHash, cFunc, skip, pFuncs);
    rv.nposes2 = this.nposes2.slice();
    rv.nposes = this.nposes.slice();
    return rv;
};

JPRO.Handfun.Func.prototype.getPose = function(tIn,movementBeat) { // 0<=tIn<1, movementBeat>=0 (integer)
    var mBeat = movementBeat % this.movementPeriod;
    //console.log('mBeat=' + mBeat);
    var np = this.nposes[mBeat];
    var t = tIn * np;
    if (t >=np ) { t -= np; }
    var t0 = Math.floor(t);
    //t0=0;
//    console.log('tIn='+tIn);
//    console.log('t0='+t0);
    var dt = t - t0;
    //var t1 = (t0 === 7) ? 0 : t0 + 1; // not needed
    var i,xva,x0,v0,a0,x;
    var poseAngles = [];
    //var temp;
    for (i=0; i<this.posesXva[mBeat].length; i++) {
	//temp = this.posesXva[mBeat][i];
	//console.log('temp length = ' + temp.length);
	xva = this.posesXva[mBeat][i][t0];
	x0 = xva[0];
	v0 = xva[1];
	a0 = xva[2];
	x = x0 + v0*dt/2 + a0*dt*dt/4;
	//console.log('x[' + i + '] = ' + x);
	poseAngles.push(x);
    }
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

JPRO.Handfun.Func.prototype.getPos = function(t,movementBeat) {
    var pose = this.getPose(t, movementBeat);
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

JPRO.Handfun.mirrorX = function(pm) {
    // affects yaw and roll angles ([1],[3],[4])
    var i,j;
    var rv = [];
    var rvj;
    for (i=0; i<pm.length; i++) {
	rvj = [];
	for (j=0; j<pm[i].length; j++) {
	    rvj.push([pm[i][j][0], -pm[i][j][1], pm[i][j][2],
		      -pm[i][j][3],-pm[i][j][4], pm[i][j][5]]);
	}
	rv.push(rvj);
    }
    return rv;
};

// Ordinary Cascade/Fountain
JPRO.Handfun.casc = [[
    //uap   uay   fap   fay  far   hp
    [-70,    10,   20+70,   10,   0,   0],
    [-70,    15,   25+70,   15,   0,   0],
    [-70,     0,    0+70,    0,   0,   0],
    [-70,    -5,  -12+70,   -5,   0,   0],
    [-70,    -10, -25+70,  -10,   0,   0],
    [-70,    -5,  -12+70,   -5,   0,   0],
    [-70,     0,    0+70,    0,   0,   0],
    [-70,     5,   12+70,    5,   0,   0]
]];

// cascR is a method of Handfun, not a constructor!
JPRO.Handfun.cascR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, JPRO.Handfun.casc, 'cascR');
};
// cascL is a method of Handfun, not a constructor!
JPRO.Handfun.cascL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, JPRO.Handfun.mirrorX(JPRO.Handfun.casc), 'cascL');
};

// Reverse Cascade
JPRO.Handfun.revCasc = [[
    //uap   uay   fap  fay  far   hp
    [-70,   -20,   80, -40,   0,   30],
    [-70,   -20,  100, -40,   0,   30],
    [-70,     0,   80, -20,   0,   30],
    [-70,    10,   60,   5,   0,   30],
    [-70,    20,   60,  10,   0,   30],
    [-70,    10,   60,   5,   0,   30],
    [-70,     0,   60,   0,   0,   30],
    [-70,   -10,   60, -20,   0,   30]
]];

JPRO.Handfun.revCascR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, JPRO.Handfun.revCasc, 'revCascR');
};

JPRO.Handfun.revCascL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, JPRO.Handfun.mirrorX(JPRO.Handfun.revCasc), 'revCascL');
};

// Right-handed Shower
JPRO.Handfun.rshowerRm = [[
    //uap   uay   fap  fay  far   hp
    [-70,     0,   40, -60,   0,   0],
    [-70,     0,   60, -60,   0,   0],
    [-70,     0,   35, -60,   0,   0],
    [-70,     0,   10, -60,  40,   0],
    [-70,     0,  -20, -60,  80,   0],
    [-70,     0,  -10, -60,  40,   0],
    [-70,     0,    0, -60,   0,   0],
    [-70,     0,    0, -60,   0,   0]
]];
JPRO.Handfun.rshowerR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, JPRO.Handfun.rshowerRm, 'rshowerR');
};
JPRO.Handfun.rshowerLm = [[
    //uap   uay   fap  fay  far   hp
    [-70,     0,   70, -25,   0,   0],
    [-70,     0,   70, -60,   0,   0],
    [-70,     0,   70, -20,   0,   0],
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  10,   0,   0]
]];
JPRO.Handfun.rshowerL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, JPRO.Handfun.rshowerLm, 'rshowerL');
};

// Left-handed Shower
JPRO.Handfun.lshowerR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, JPRO.Handfun.mirrorX(JPRO.Handfun.rshowerRm), 'lshowerR');
};
JPRO.Handfun.lshowerL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, JPRO.Handfun.mirrorX(JPRO.Handfun.rshowerLm), 'lshowerL');
};

// Synchronous Box hand movement
JPRO.Handfun.box = [[
    //uap   uay   fap  fay  far   hp
    [-70,   -10,   80, -20,   0,  20],
    [-70,    -5,   70, -15,   0,  10],
    [-70,     0,   60, -10,   0,   0],
    [-70,     0,   60,  -5,   0,   0],
    [-70,     0,   60,   0,   0,   0],
    [-70,     0,   60,   5,   0,   0],
    [-70,     0,   60,  10,   0,   0],
    [-70,     5,   70,  15,   0,  10]
],[
    //uap   uay   fap  fay  far   hp
    [-70,    10,   80,  20,   0,  20],
    [-70,     5,   70,  15,   0,  10],
    [-70,     0,   60,  10,   0,   0],
    [-70,     0,   60,   5,   0,   0],
    [-70,     0,   60,   0,   0,   0],
    [-70,     0,   60,  -5,   0,   0],
    [-70,     0,   60, -10,   0,   0],
    [-70,    -5,   70, -15,   0,  10]
]];

JPRO.Handfun.boxR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, JPRO.Handfun.box, 'boxR');
};
JPRO.Handfun.boxL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, JPRO.Handfun.box, 'boxL');
};

// TODO - Better method may be to select hand movement based on throw destination/time
//        Hand should move in direction of throw obviously.
// Box
// 441
// Pendulum
// Fast Machine
// Mills' Mess
// Rubenstein's Revenge?
// Pistons
// Chops
// Double Box
// False Shower

// Simplest hand movement functions
JPRO.Handfun.stationaryL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, [[[-90, 0, 90, 0, 50, 0]]], 'stationaryL');
};
JPRO.Handfun.stationaryR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, [[[-90, 0, 90, 0, 20, 0]]], 'stationaryR');
};
JPRO.Handfun.experimentL = function(owner) {
    return new JPRO.Handfun.Func(owner, 0, [[[-90, 0, 90, 0, 0, 0],
					     [-90, 0, 90, 0, 90, 0],
					     [-90, 0, 90, 0,180, 0],
					     [-90, 0, 90, 0,270, 0]]], 'xL');
};
JPRO.Handfun.experimentR = function(owner) {
    return new JPRO.Handfun.Func(owner, 1, [[[-90, 0, 90, 0,180, 0],
					     [-90, 0, 90, 0,270, 0],
					     [-90, 0, 90, 0,  0, 0],
					     [-90, 0, 90, 0, 90, 0]]], 'xR');
};

})();
