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
"use strict";

JPRO.Handfun = function() {};

// Class similar to spine
// skeleton made of bones
// Handfun Globals
JPRO.Handfun.scale = 5;
JPRO.Handfun.shoulderWidth = 200;
JPRO.Handfun.upperArmLength = 200;
JPRO.Handfun.foreArmLength = 240;
JPRO.Handfun.handLength = 50;

JPRO.Handfun.Bone = function(length) {
    this.length = length;
}
JPRO.Handfun.Bone.prototype = {
    pitch: 0,
    yaw: 0,
    roll: 0
};
JPRO.Handfun.Bone.prototype.constructor = JPRO.Handfun.Bone;

JPRO.Handfun.Pose = function(pos, facingAngle) {
    this.pos = pos;
    this.facingAngle = facingAngle;
    this.bones = [
	new JPRO.Handfun.Bone(JPRO.Handfun.upperArmLength),
	new JPRO.Handfun.Bone(JPRO.Handfun.foreArmLength),
	new JPRO.Handfun.Bone(JPRO.Handfun.handLength)
    ];
    // Methods
    this.set = function(uaP, uaY, faP, faY, faR, handP) {
	this.bones[0].pitch = uaP;    // upper arm pitch
	this.bones[0].yaw = uaY;      // upper arm yaw
	this.bones[1].pitch = faP;    // forearm pitch
	this.bones[1].yaw = faY;      // forearm yaw
	this.bones[1].roll = faR;     // forearm roll
	this.bones[2].pitch = handP;  // hand pitch
    };
    this.handPos = function() {
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
	var rfinal = new JPRO.Rmatrix(this.facingAngle - 90, 2); // rotation about Z axis
	rfinal.col4 = new JPRO.Vec().setV(this.pos);

	// calculate position of hand, thumb, elbow and wrist in final frame
	var finalElbow = rfinal.xVec4(elbow);
	var finalWrist = rfinal.xVec4(r00.col4);
	var finalHand = rfinal.xVec4(hpos);
	var finalThumb = rfinal.xVec4(tpos);
	var rv = [finalHand, finalThumb, finalWrist, finalElbow];
	return rv;
    };
};
JPRO.Handfun.Pose.prototype.constructor = JPRO.Handfun.Pose;

// general hand function generator
JPRO.Handfun.generator = function(neckPos, facingAngle, rightHand, posesMatrix) {
    // calculate right or left shoulder position
    var shoulderAngle = rightHand ? -90 : 90;
    var throwBeat = rightHand ? 0 : 1;
    var srad = (facingAngle + shoulderAngle) * PIXI.DEG_TO_RAD;
    var x = neckPos.getX() + this.shoulderWidth * Math.cos(srad);
    var y = neckPos.getY() + this.shoulderWidth * Math.sin(srad);
    var shoulderPos = new JPRO.Vec(x, y, neckPos.getZ());
    var ps = new JPRO.Vec();
    var scale = this.scale;
    ps.x = shoulderPos.getX() << scale;
    ps.y = shoulderPos.getY() << scale;
    ps.z = shoulderPos.getZ() << scale;
    var nposes = posesMatrix.length << 1; // number of poses (double the specified array length)
    // transpose pose matrix
    var posesMatrixT = JPRO.Handfun.transpose(posesMatrix);
    // calculate xva matrix
    var posesXva = JPRO.Handfun.calcXva(posesMatrixT);

    // This is a function closure
    return (function() {
	var getPose = function(tIn) { // 0<=tIn<1
	    var t = tIn * nposes + throwBeat * posesMatrix.length;
	    if (t >=nposes ) { t -= nposes; }
	    var t0 = Math.floor(t);
	    //console.log('t0='+t0);
	    var dt = t - t0;
	    //var t1 = (t0 == 7) ? 0 : t0 + 1; // not needed
	    var i,xva,x0,v0,a0,x;
	    var poseAngles = [];
	    for (i=0; i<posesXva.length; i++) {
		xva = posesXva[i][t0];
		x0 = xva[0];
		v0 = xva[1];
		a0 = xva[2];
		x = x0 + v0*dt/2 + a0*dt*dt/4;
		//console.log('x[' + i + '] = ' + x);
		poseAngles.push(x);
	    }
	    var p = new JPRO.Handfun.Pose(shoulderPos, facingAngle);
	    p.set( poseAngles[0],
		   poseAngles[1],
		   poseAngles[2],
		   poseAngles[3],
		   poseAngles[4],
		   poseAngles[5]
		 );
	    return p;
	};
	return function(t, bp) {
	    var pose = getPose(t/bp/2);
	    var jointPositions = pose.handPos();
	    var p = new JPRO.Vec().setV(jointPositions[0]);
	    var pt = new JPRO.Vec().setV(jointPositions[1]);
	    var pw = new JPRO.Vec().setV(jointPositions[2]);
	    var pe = new JPRO.Vec().setV(jointPositions[3]);
	    p.scale(scale);   // position of hand
	    pt.scale(scale);  // position of thumb
	    pw.scale(scale);  // position of wrist
	    pe.scale(scale);  // position of elbow
	    //console.log('handPos = ' + p.toString());
	    return [p, pt, pw, pe, ps];
	    
	};
    })();  // end of function closure
};

JPRO.Handfun.transpose = function(m) {
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

JPRO.Handfun.mirrorX = function(pm) {
    // affects yaw and roll angles ([1],[3],[4])
    var i;
    var rv = [];
    for (i=0; i<pm.length; i++) {
	rv.push([pm[i][0], -pm[i][1], pm[i][2],
		 -pm[i][3],-pm[i][4], pm[i][5]]);
    }
    return rv;
};

JPRO.Handfun.calcXva = function(posesT) {
    console.log("JPRO.Handfun.calcXva called");
    var rv = [];
    var i;
    for (i=0; i<posesT.length; i++) {
	rv.push(JPRO.Handfun.interpolator(posesT[i]));
    }
    return rv;
};

JPRO.Handfun.interpolator = function(x) {
    // x is an array of angles in degrees
    // the movement repeats x[0]..x[last],x[0]...

    // returns difference of angles (b-a)
    var adelta = function(a,b) {
	var rv = b-a;
	// normalize to (-180 : +180]
	while (rv <= -180) { rv += 360; }
	while (rv > 180) { rv -= 360; }
	return rv;
    }

    var i,j,k,k2;
    var d = []; // deltas or average velocities
    var v = []; // velocities
    var a = []; // accelerations
    var xx = []; // positions (twice the length of x)
    var xva = []; // [positions, velocities, accelerations]
    var n = x.length;
    
    // compute deltas, store in array
    for (i=0; i<n; i++) {
	j = (i+1) % n;
	d[i] = adelta(x[i], x[j]);
    }

    // look for local maxima or minima
    // if d[0]>=0 and d[1]<=0, then x[1] is local max, v[1]=0
    // if d[0]<=0 and d[1]>=0, then x[1] is local min, v[1]=0
    for (i=0; i<n; i++) {
	j = (i - 1 + n) % n;
	k = i << 1;
	if ((d[j] >= 0) && (d[i] <= 0)) {
	    v[k] = 0;
	}
	else if ((d[j] <= 0) && (d[i] >= 0)) {
	    v[k] = 0;
	}
	else {
	    v[k] = (d[j] + d[i])/2; // simple average
	}
    }
    // Solve for in-between velocities
    for (i=0; i<n; i++) {
	k = i << 1;
	j = k + 1;
	if (i == n-1) {
	    k2 = 0;
	}
	else {
	    k2 = j + 1;
	}
	v[j] = d[i]*2 - (v[k] + v[k2])/2;
    }
    // Calculate accelerations
    for (i=0; i<v.length; i++) {
	j = (i == v.length-1) ? 0 : i+1;
	a[i] = v[j] - v[i];
    }
    // Calculate in between positions
    j = 0;
    for (i=0; i<n; i++) {
	xx.push(x[i]);
	xx.push(x[i] + v[j]/2 + a[j]/4);
	j += 2;
    }
    xva.push(xx);
    xva.push(v);
    xva.push(a);
    xva = JPRO.Handfun.transpose(xva); // transpose for easier use
    return xva; // return positions, velocities and accelerations arrays

    // x = 1/2 * a * t*t
    // a = 2x/t/t
    // x = [0, 10, 30, 10]
    // d = [10,20,-20,-10]
    // v = [0, v1, 15, v3 0, v5, -15, v7]
    // now solve for v1, v3, v5 and v7
    // v1 = d[0]*2 - (v[0] + v[2])/2 = 20-7.5=12.5
    // v3 = d[1]*2 - (v[2] + v[4])/2 = 40-7.5=32.5
    // v5 = d[2]*2 - (v[4] + v[6])/2 = -40+7.5=-32.5
    // v7 = d[3]*2 - (v[6] + v[0])/2 = -20+7.5=-12.5
    // v = [0, 12.5, 15, 32.5, 0, -32.5, -15, -12.5]
    // a = [12.5, 2.5, 17.5, -32.5, -32.5, 17.5, 2.5, 12.5]
    // x = [0, 6.25/2, 10, 22, 30,..

};

// Ordinary Cascade/Fountain
JPRO.Handfun.casc = [
    //uap   uay   fap  fay  far   hp
    [-70,   -20,  -50, -40,   0,   0],
    [-70,   -10,  -25, -20,   0,   0],
    [-70,     0,    0,   0,   0,   0],
    [-70,    10,   25,  20,   0,   0],
    [-70,    20,   50,  40,   0,   0],
    [-70,    30,   75,  60,   0,   0],
    [-70,     0,    0,   0,   0,   0],
    [-70,   -10,  -25, -20,   0,   0]
];

// cascR is a method of Handfun, not a constructor!
JPRO.Handfun.cascR = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 1, JPRO.Handfun.casc);
};
// cascL is a method of Handfun, not a constructor!
JPRO.Handfun.casc_l = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 0, JPRO.Handfun.mirrorX(JPRO.Handfun.casc));
};

// Reverse Cascade
JPRO.Handfun.revCasc = [
    //uap   uay   fap  fay  far   hp
    [-70,    20,   60,  10,   0,   30],
    [-70,    10,   60,   5,   0,   30],
    [-70,     0,   60,   0,   0,   30],
    [-70,   -10,   60, -20,   0,   30],
    [-70,   -20,   80, -40,   0,   30],
    [-70,   -20,  100, -40,   0,   30],
    [-70,     0,   80, -20,   0,   30],
    [-70,    10,   60,   5,   0,   30]
];
JPRO.Handfun.revCascR = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 1, JPRO.Handfun.revCasc);
};
JPRO.Handfun.revCascL = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 0, JPRO.Handfun.mirrorX(JPRO.Handfun.revCasc));
};

// Right-handed Shower
JPRO.Handfun.rshowerRm = [
    //uap   uay   fap  fay  far   hp
    [-70,     0,  -20, -60,  80,   0],
    [-70,     0,  -10, -60,  40,   0],
    [-70,     0,    0, -60,   0,   0],
    [-70,     0,    0, -60,   0,   0],
    [-70,     0,   40, -60,   0,   0],
    [-70,     0,   60, -60,   0,   0],
    [-70,     0,   35, -60,   0,   0],
    [-70,     0,   10, -60,  40,   0]
];
JPRO.Handfun.rshowerR = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 1, JPRO.Handfun.rshowerRm);
};
JPRO.Handfun.rshowerLm = [
    //uap   uay   fap  fay  far   hp
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  20,   0,   0],
    [-70,     0,   70,  10,   0,   0],
    [-70,     0,   70, -25,   0,   0],
    [-70,     0,   70, -60,   0,   0],
    [-70,     0,   70, -20,   0,   0],
    [-70,     0,   70,  20,   0,   0]
];
JPRO.Handfun.rshowerL = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 0, JPRO.Handfun.rshowerLm);
};

// Left-handed Shower
JPRO.Handfun.lshowerR = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 1, JPRO.Handfun.mirrorX(JPRO.Handfun.rshowerRm));
};
JPRO.Handfun.lshowerL = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 0, JPRO.Handfun.mirrorX(JPRO.Handfun.rshowerLm));
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
JPRO.Handfun.stationaryL = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 0, [[-90, 0, 90, 0, 50, 0]]);
};
JPRO.Handfun.stationaryR = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 1, [[-90, 0, 90, 0, 20, 0]]);
};
JPRO.Handfun.experimentL = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 0, [[-90, 0, 90, 0, 0, 0],
							 [-90, 0, 90, 0, 90, 0],
							 [-90, 0, 90, 0,180, 0],
							 [-90, 0, 90, 0,270, 0]]);
};
JPRO.Handfun.experimentR = function(neckPos, facingAngle) {
    return JPRO.Handfun.generator(neckPos, facingAngle, 1, [[-90, 0, 90, 0,180, 0],
							 [-90, 0, 90, 0,270, 0],
							 [-90, 0, 90, 0,  0, 0],
							 [-90, 0, 90, 0, 90, 0]]);
};
