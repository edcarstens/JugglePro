// test ThrowSeq, Pattern, and Routine

var ts = new JPRO.ThrowSeq();
console.log("ts=" + ts.toString());
console.log("ts.repeat=" + ts.repeat());
// fake the Hand objects
var lh = {name:"LH"};
var rh = {name:"RH"};
rhMap = new JPRO.RowHandMapper([[lh,rh]]);
ts = new JPRO.ThrowSeq([[ [[0,3]], [[0,4]] ]], rhMap);
console.log("ts=" + ts.toString());
console.log("ts.repeat=" + ts.repeat());
console.log("mhn=" + ts.toString([[ [[0,1]] ]]));

var pat = new JPRO.Pattern([[[[0,0]]]], rhMap);
console.log("pat=" + pat.toString());
console.log("pat.iters=" + pat.iters);
console.log("pat.repeat=" + pat.repeat());

pat = new JPRO.Pattern([[ [[0,3]], [[0,4]], [[0,5]] ]], rhMap);
console.log("pat=" + pat.toString());
console.log("pat.repeat=" + pat.repeat());
console.log("pat.swap=" + pat.swap([0,1,0], [0,2,0]).toString());
console.log("pat.translateAll=" + pat.translateAll(1).toString());
console.log("pat.translateThrow=" + pat.translateThrow([0,0,0]).toString());
console.log("pat.multiplexTranslate=" +
	    pat.multiplexTranslate().toString());
console.log("pat.multiplexTranslate2=" +
	    pat.multiplexTranslate(0, 2).toString());
console.log("pat.rotateThrows=" +
	    pat.rotateThrows(1).toString());
console.log("pat.extendPeriod=" +
	    pat.extendPeriod().toString());
console.log("pat.extendRows=" +
	    pat.extendRows(3).toString());
console.log("pat.rotateRows=" +
	    pat.rotateRows(1).toString());

if (1) {
var routine1 = new JPRO.Routine();
console.log("routine1=" + routine1.toString());
routine1 = new JPRO.Routine([ts, pat]);
console.log("routine1=" + routine1.toString());
routine2 = new JPRO.Routine([ts, routine1, pat]);
console.log("routine2=" + routine2.toString());
}

if (0) {
var state1 = new JPRO.State([[ [[0,1]], [[0,5]] ]], 3);
console.log("state1=" + state1.toString());
var state2 = new JPRO.State([[ [[0,3]] ]], 3);
console.log("state2=" + state2.toString());
var ts12 = state1.getTransition(state2);
console.log("state1 to state2 transition=" + ts12);
var ts21 = state2.getTransition(state1);
console.log("state2 to state1 transition=" + ts21);
}
