// test Matrix and Vec classes

r1 = new JPRO.Vec();
r2 = new JPRO.Vec(1,2,3);
r3 = new JPRO.Vec(4,5,6);
objHash = {};
r3_copy = r3.copy(objHash);

console.log("r2=" + r2.toString());
console.log("r3=" + r3.toString());
console.log("r3_copy=" + r3_copy.toString());

m1 = new JPRO.Matrix(r1,r2,r3);
console.log("m1=" + m1.toString());
console.log("XAXIS=" + JPRO.XAXIS);
rot1 = new JPRO.Rmatrix(30, JPRO.XAXIS);
rot2 = new JPRO.Rmatrix(60, JPRO.XAXIS);
r2_rot = rot2.xVec(rot1.xVec(r2));
console.log("rot1=" + rot1.toString());
console.log("rot2=" + rot2.toString());
console.log("r2_rot=" + r2_rot.toString());
rot1.xV(r2).xV(r3);
rot2.xV(r2).xV(r3);
console.log("r2=" + r2.toString());
console.log("r3=" + r3.toString());
rot3 = rot2.xMatrix(rot1);
console.log("rot3=" + rot3.toString());
