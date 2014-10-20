"use strict";

// Hand Functions
var Handfun = {};

// Library of hand movement functions
// Methods of the Hand_Functions object return
// functions with (t, bp) arguments, which
// return a Vec obj (position).

// Class similar to spine
// skeleton made of bones
// Handfun Globals
Handfun.scale = 5;
Handfun.shoulder_width = 200;
Handfun.ua_length = 200;
Handfun.fa_length = 240;
Handfun.hand_length = 50;

Handfun.Bone = function(length) {
    this.length = length;
}
Handfun.Bone.prototype = {
    pitch: 0,
    yaw: 0,
    roll: 0
};
Handfun.Bone.prototype.constructor = Handfun.Bone;

Handfun.Pose = function(pos, facing_angle) {
    this.pos = pos;
    this.facing_angle = facing_angle;
    this.bones = [];
    this.bones.push(new Handfun.Bone(Handfun.ua_length));
    this.bones.push(new Handfun.Bone(Handfun.fa_length));
    this.bones.push(new Handfun.Bone(Handfun.hand_length));
    // Methods
    this.set = function(ua_p, ua_y, fa_p, fa_y, fa_r, hand_p) {
	this.bones[0].pitch = ua_p;
	this.bones[0].yaw = ua_y;
	this.bones[1].pitch = fa_p;
	this.bones[1].yaw = fa_y;
	this.bones[1].roll = fa_r;
	this.bones[2].pitch = hand_p;
    };
    this.hand_pos = function() {
	var r00 = new Rmatrix(this.bones[0].pitch, 0); // rotation about X axis
	var r02 = new Rmatrix(this.bones[0].yaw, 2);   // rotation about Z axis
	r00.x_matrix(r02);
	//r00.col4 = new Vec(0, this.bones[0].length, 0);
	r00.col4 = new Vec(0, 0, 0);
	var r10 = new Rmatrix(this.bones[1].pitch, 0);
	var r12 = new Rmatrix(this.bones[1].yaw, 2);
	var r11 = new Rmatrix(this.bones[1].roll, 1); // rotation about Y axis
	r10.x_matrix(r12).x_matrix(r11);
	r10.col4 = new Vec(0, this.bones[0].length, 0);

	// calculate position of elbow
	var elbow = r00.x_vec(r10.col4);
	
	var r20 = new Rmatrix(this.bones[2].pitch, 0);
	r20.col4 = new Vec(0, this.bones[1].length, 0);

	// Now multiply the 4x4 matrixes
	r00.x_matrix4(r10.x_matrix4(r20));
	// 4th Column vector is position of wrist in jugglers frame

	// calculate position of hand
	var hpos = r00.x_vec4(new Vec(0, this.bones[2].length, 0));
	// calculate position of 'thumb' to aid 3d orientation
	var tpos = r00.x_vec4(new Vec(this.bones[2].length, 0, 0));

	// we still need one more transformation to the view frame
	//var rfinal = new Rmatrix(this.facing_angle, 2); // rotation about Z axis
	var rfinal = new Rmatrix(this.facing_angle - 90, 2); // rotation about Z axis
	rfinal.col4 = new Vec().setv(this.pos);

	// calculate position of hand, elbow and wrist in final frame
	var final_elbow = rfinal.x_vec4(elbow);
	var final_wrist = rfinal.x_vec4(r00.col4);
	var final_hand = rfinal.x_vec4(hpos);
	var final_thumb = rfinal.x_vec4(tpos);
	
	var rv = [final_hand, final_thumb, final_wrist, final_elbow];
	return rv;
    }
}
Handfun.Pose.prototype.constructor = Handfun.Pose;

// general hand function generator
Handfun.generator = function(neck_pos, facing_angle, right_hand, poses_matrix) {
    // calculate right or left shoulder position
    var shoulder_angle = right_hand ? -90 : 90;
    var throw_beat = right_hand ? 0 : 1;
    var s_rad = (facing_angle + shoulder_angle) * Math.PI/180;
    var x = neck_pos.x + this.shoulder_width * Math.cos(s_rad);
    var y = neck_pos.y + this.shoulder_width * Math.sin(s_rad);
    var shoulder_pos = new Vec(x, y, neck_pos.z);
    var ps = new Vec();
    var scale = this.scale;
    ps.x = shoulder_pos.x << scale;
    ps.y = shoulder_pos.y << scale;
    ps.z = shoulder_pos.z << scale;
    var nposes = poses_matrix.length << 1; // number of poses (double the specified array length)
    // transpose pose matrix
    var poses_matrix_t = Handfun.transpose(poses_matrix);
    // calculate xva matrix
    var poses_xva = Handfun.calc_xva(poses_matrix_t);

    return (function() {
	var get_pose = function(t_in) { // t_in is always 0<=t_in<1
	    var t = t_in * nposes + throw_beat * poses_matrix.length;
	    if (t >=nposes ) { t -= nposes; }
	    var t0 = Math.floor(t);
	    //console.log('t0='+t0);
	    var dt = t - t0;
	    //var t1 = (t0 == 7) ? 0 : t0 + 1; // not needed
	    var i,xva,x0,v0,a0,x;
	    var pose_angles = [];
	    for (i=0; i<poses_xva.length; i++) {
		xva = poses_xva[i][t0];
		x0 = xva[0];
		v0 = xva[1];
		a0 = xva[2];
		x = x0 + v0*dt/2 + a0*dt*dt/4;
		//console.log('x[' + i + '] = ' + x);
		pose_angles.push(x);
	    }
	    var p = new Handfun.Pose(shoulder_pos, facing_angle);
	    p.set( pose_angles[0],
		   pose_angles[1],
		   pose_angles[2],
		   pose_angles[3],
		   pose_angles[4],
		   pose_angles[5]
		 );
	    return p;
	}
	return function(t, bp) {
	    var pose = get_pose(t/bp/2);
	    var joint_positions = pose.hand_pos();
	    var p = new Vec().setv(joint_positions[0]);
	    var pt = new Vec().setv(joint_positions[1]);
	    var pw = new Vec().setv(joint_positions[2]);
	    var pe = new Vec().setv(joint_positions[3]);
	    p.scale(scale);
	    pt.scale(scale);
	    pw.scale(scale);
	    pe.scale(scale);
	    //console.log('hand_pos = ' + p.to_string());
	    return [p, pt, pw, pe, ps];
	    
	};
    })();
}

Handfun.transpose = function(m) {
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
}

Handfun.mirrorx = function(pm) {
    // affects yaw and roll angles ([1],[3],[4])
    var i;
    var rv = [];
    for (i=0; i<pm.length; i++) {
	rv.push([pm[i][0], -pm[i][1], pm[i][2],
		 -pm[i][3],-pm[i][4], pm[i][5]]);
    }
    return rv;
}

Handfun.calc_xva = function(poses_t) {
    console.log("Handfun.calc_xva called");
    var rv = [];
    var i;
    for (i=0; i<poses_t.length; i++) {
	rv.push(Handfun.interpolator(poses_t[i]));
    }
    return rv;
}

Handfun.interpolator = function(x) {
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
    xva = Handfun.transpose(xva); // transpose for easier use
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

}

// Ordinary Cascade/Fountain
Handfun.casc = [
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

// casc_r is a method of Handfun obj, not a constructor!
Handfun.casc_r = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 1, Handfun.casc);
}
// casc_l is a method of Handfun obj, not a constructor!
Handfun.casc_l = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 0, Handfun.mirrorx(Handfun.casc));
}

// Reverse Cascade
Handfun.rev_casc = [
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
Handfun.rev_casc_r = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 1, Handfun.rev_casc);
}
Handfun.rev_casc_l = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 0, Handfun.mirrorx(Handfun.rev_casc));
}

// Right-handed Shower
Handfun.rshower_rm = [
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
Handfun.rshower_r = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 1, Handfun.rshower_rm);
}
Handfun.rshower_lm = [
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
Handfun.rshower_l = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 0, Handfun.rshower_lm);
}

// Left-handed Shower
Handfun.lshower_r = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 1, Handfun.mirrorx(Handfun.rshower_rm));
}
Handfun.lshower_l = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 0, Handfun.mirrorx(Handfun.rshower_lm));
}

// TODO
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
Handfun.stationary_l = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 0, [[-90, 0, 90, 0, 50, 0]]);
}
Handfun.stationary_r = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 1, [[-90, 0, 90, 0, 20, 0]]);
}
Handfun.experiment_l = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 0, [[-90, 0, 90, 0, 0, 0],
							 [-90, 0, 90, 0, 90, 0],
							 [-90, 0, 90, 0,180, 0],
							 [-90, 0, 90, 0,270, 0]]);
}
Handfun.experiment_r = function(neck_pos, facing_angle) {
    return Handfun.generator(neck_pos, facing_angle, 1, [[-90, 0, 90, 0,180, 0],
							 [-90, 0, 90, 0,270, 0],
							 [-90, 0, 90, 0,  0, 0],
							 [-90, 0, 90, 0, 90, 0]]);
}

Handfun.linear_osc = function(pos) {
    // use function closure here
    // f is a function returned by the self-invoking anonymous function
    var scale = this.scale;
    var f = (function() {
	//var scale = this.scale;
	var x0 = pos.x;
	var p = new Vec(x0 << scale, pos.y << scale, pos.z << scale);
	return function (t, bp) {
	    var x = x0 - t*180/bp;
	    if (t > bp) {
		x = x0 + (t - 2*bp)*180/bp;
	    }
	    p.x = x << scale;
	    return p;
	};
    })();
    return f;
}
