
function Rmatrix(degrees, axis) {
    this.degrees = degrees || 0;
    this.axis = axis || 0;
    
    var radians = degrees*Math.PI/180;
    var s = Math.sin(radians);
    var c = Math.cos(radians);
    var m = [c,-s,0,s,c,0,0,0,1];
    if (axis == 0) {
	m = [1,0,0,0,c,-s,0,s,c];
    }
    else if (axis == 1) {
	m = [c,  0,  s,
	     0,  1,  0,
	     -s, 0,  c];
    }
    var r1 = new Vec(m[0],m[1],m[2]);
    var r2 = new Vec(m[3],m[4],m[5]);
    var r3 = new Vec(m[6],m[7],m[8]);
    Matrix.call(this,r1,r2,r3);
}

// constructor
Rmatrix.prototype = Object.create( Matrix.prototype );
Rmatrix.prototype.constructor = Rmatrix;
