// test Rhythm class

r1 = new JPRO.Rhythm(null, 1);
console.log("r1=" + r1.toString());
r2 = new JPRO.Rhythm([1,2,3], 2);
console.log("r2=" + r2.toString());
r3 = new JPRO.Rhythm([r1,8,r2,9]);
r4 = r3.copy();
console.log("r3=" + r3.toString());
var i;
for (i=1; i<=10; i++) {
    console.log("r3.nextBeat = " + r3.nextBeat());
}
console.log("r4=" + r4.toString());
var i;
for (i=1; i<=10; i++) {
    console.log("r4.nextBeat = " + r4.nextBeat());
}
console.log("r4.timeBetweenBeats(0,3) = " + r4.timeBetweenBeats(0,3));
for (i=1; i<=5; i++) {
    console.log("r4.nextBeat = " + r4.nextBeat());
}
