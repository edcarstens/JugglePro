"use strict";

function Matrix(row1, row2, row3, col4) {

    var r1 = row1 || new Vec(1,0,0);
    var r2 = row2 || new Vec(0,1,0);
    var r3 = row3 || new Vec(0,0,1);
    
    // Members
    this.m = [r1.getx(), r1.gety(), r1.getz(),
	      r2.getx(), r2.gety(), r2.getz(),
	      r3.getx(), r3.gety(), r3.getz()];
    this.col4 = (col4 == null) ? new Vec() : col4; // 4th column

    // Methods
    this.x_matrix = x_matrix;
    this.x_vec = x_vec;
    this.x_v = x_v;
    this.new_rot_matrix = new_rot_matrix;
    this.to_string = to_string;
    this.x_matrix4 = x_matrix4;
    this.x_vec4 = x_vec4;
    
    function x_matrix(a) {
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
    }

    // [R1 c1] x [R2 c2] = [R1xR2 R1xc2+c1]
    function x_matrix4(a) {
	this.col4.acc(this.x_vec(a.col4));
	return this.x_matrix(a);
    }
    
    // Returns new vector = M*v
    function x_vec(v) {
	var x = v.x;
	var y = v.y;
	var z = v.z;
	return new Vec(
	    this.m[0]*x + this.m[1]*y + this.m[2]*z,
	    this.m[3]*x + this.m[4]*y + this.m[5]*z,
	    this.m[6]*x + this.m[7]*y + this.m[8]*z
	);
    }

    // [R1 c1] * [v] = [R1 * v + c1]
    function x_vec4(v) {
	return this.x_vec(v).acc(this.col4);
    }
    
    // Returns this matrix after v=M*v
    function x_v(v) {
	var x = v.x;
	var y = v.y;
	var z = v.z;
	v.x = this.m[0]*x + this.m[1]*y + this.m[2]*z;
	v.y = this.m[3]*x + this.m[4]*y + this.m[5]*z;
	v.z = this.m[6]*x + this.m[7]*y + this.m[8]*z;
	return this;
    }

    function new_rot_matrix(degrees, axis) {
	var radians = degrees*Math.PI/180;
	var s = Math.sin(radians);
	var c = Math.cos(radians);
	var rv = new Matrix();
	var m = [];
	if (axis == 0) {
	    m[0]=1; m[1]=0; m[2]=0;
	    m[3]=0; m[4]=c; m[5]=s;
	    m[6]=0; m[7]=-s; m[8]=c;
	}
	else if (axis == 1) {
	    m[0]=c; m[1]=0; m[2]=s;
	    m[3]=0; m[4]=1; m[5]=0;
	    m[6]=-s; m[7]=0; m[8]=c;
	}
	else {
	    m[0]=c; m[1]=s; m[2]=0;
	    m[3]=-s; m[4]=c; m[5]=0;
	    m[6]=0; m[7]=0; m[8]=1;
	}
	rv.m = m;
	return rv;
    }

    function to_string() {
	return '[[' + this.m[0] + ',' + this.m[1] + ',' + this.m[2] + '], [' +
	    this.m[3] + ',' + this.m[4] + ',' + this.m[5] + '], [' +
	    this.m[6] + ',' + this.m[7] + ',' + this.m[8] + ']]';
    }
}

Matrix.prototype = {
    m: null,
    col4: null
};
