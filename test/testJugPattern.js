// test JugPattern
test = SHAKE.Test();
testo = SHAKE.TestObj();
// JugThrow
r0 = new JPRO.JugThrow();
//console.log(r0);
test(1, r0.name, 'JugThrow_0');
test(2, r0.fltBeats, 0);
test(3, r0.destRow, 0);

r1 = new JPRO.JugThrow(1, 3, 0, 0.1, 0.2, 0, null, null, 'r1');
test(4, r1.name, 'r1');
test(5, r1.destRow, 1);
test(6, r1.fltBeats, 3);
test(7, r1.destBeats, 0);
test(8, r1.preDwellRatio, 0.1);
test(9, r1.postDwellRatio, 0.2);
test(10, r1.bounces, 0);
test(11, r1.forceThrow, null);
test(12, r1.earlyCatch, null);
//testo(999, r1, {name:'r1',fltTime:3,destRow:1}, 1);

// JugThrows
//r0 = new JPRO.JugThrows();
//test(12, r0.name, 'JugThrows_0');

//r2 = new JPRO.JugThrows([[r1]], null, null, 'r2');
//test(13, r2.name, 'r2');
//testo(14, r2.throwMatrix, [[r1]]);
//test(15, r2.preDwellRatio, 0);
//test(16, r2.postDwellRatio, 0);

// JugThrows.setDwellRatios()
//r3 = r2.setDwellRatios(0.111, 0.222);
//test(17, r3, r2);
//test(18, r2.throwMatrix[0][0].preDwellRatio, 0.111);
//test(19, r2.throwMatrix[0][0].postDwellRatio, 0.222);

// JugThrowSeq
r0 = new JPRO.JugThrowSeq();
test(20, r0.name, 'JugThrowSeq_0');
//test(21, r0.rows, 1);
test(21, r0.row, 0);
test(22, r0.period, 1);
//test(23, r0.maxRows, 10);
//test(24, r0.selectionOrder, 0);
//test(25, r0.selections, 0);
//test(26, r0.highThrowHeight, 9);
//test(27, r0.maxThrowHeight, 19);
test(28, r0.jugThrows.itemList.length, 1);
test(29, r0.jugThrows.itemList[0][0].destRow, 0);
test(30, r0.jugThrows.itemList[0][0].fltBeats, 0);

// JugThrowSeq.mhn2List
r4 = new JPRO.JugThrowSeq(3);
test(31, r4.jugThrows.itemList[0][0].destRow, 0);
test(32, r4.jugThrows.itemList[0][0].fltBeats, 3);
// JugThrowSeq.ss2List
r5 = new JPRO.JugThrowSeq([6,4,5],1);
test(33, r5.jugThrows.itemList[0][0].fltBeats, 6);
test(34, r5.jugThrows.itemList[1][0].fltBeats, 4);
test(35, r5.jugThrows.itemList[2][0].fltBeats, 5);
test(36, r5.jugThrows.itemList[0][0].destRow, 0);
test(37, r5.jugThrows.itemList[1][0].destRow, 0);
test(38, r5.jugThrows.itemList[2][0].destRow, 0);
// JugThrowSeq.mp2List
r6 = new JPRO.JugPattern([[2,3],[4,5]]);
//console.log(r6.jugThrowSeqs[0].jugThrows.itemList[0][0][0]);
test(39, r6.jugThrowSeqs[0].jugThrows.itemList[0][0].fltBeats, 2);
test(40, r6.jugThrowSeqs[0].jugThrows.itemList[0][1].fltBeats, 3);
test(41, r6.jugThrowSeqs[0].jugThrows.itemList[1][0].fltBeats, 4);
test(42, r6.jugThrowSeqs[0].jugThrows.itemList[1][1].fltBeats, 5);
console.log(r6);
test(43, r6.rows, 1);
test(44, r6.jugThrowSeqs[0].period, 2);
// JugThrowSeq.mrss2List
r7 = new JPRO.JugPattern([[[1,2],[0,3]],
			  [[1,3],[0,2]]]);
// JugThrowSeq.mrmp2List
r8 = new JPRO.JugPattern([[[[1,2],[0,4]],[[0,3],[0,6]]],
			   [[[1,3],[1,8]],[[0,2],[1,10]]]]);

// JugPattern.getMHN
r9 = r8.getMHN();
//console.log(r9);
testo(77, r9, [[[[1,2],[0,4]],[[0,3],[0,6]]],
	       [[[1,3],[1,8]],[[0,2],[1,10]]]]);

// JugPattern.swap
r9 = r8.swap([0,1,0], [1,0,1]);
testo(78, r8.getMHN(), [[[[1,2],[0,4]],[[1,7],[0,6]]],
			[[[1,3],[0,4]],[[0,2],[1,10]]]]);

// JugPattern.clean
r9 = new JPRO.JugPattern([[4,0,3,0,0], [0,2,0,0,6], [0,0,0]]);
//test(79, r9.name, 'r9');
r10 = r9.clean();
testo(80, r10, r9);
m = r9.getMHN();
//console.log(m);
testo(81, m, [[ [[0,4],[0,3]], [[0,2],[0,6]], [[0,0]] ]]);

// JugPattern.toHtml
viewer = {};
viewer.pattern = r9;
//$('#div1').html(r9.toHtml());

// JugPattern
r0 = new JPRO.JugPattern();
//console.log(r0);
testo(82, r0, {name:'JugPattern_4',
	       maxRows:10,
	       maxPeriod:32
	      });
// JugPattern.setPeriodRows
r1 = r0.setPeriodRows(3, 2);
testo(83, r1, r0);
//test(84, r0.period, 3);
test(85, r0.rows, 2);
// JugPattern.getTransition
//SHAKE.VERBOSITY = 1;
r2 = new JPRO.JugPattern(3, null, null, -1, 'cascade');
r3 = new JPRO.JugPattern([5,1], null, null, -1, 'shower');
//r4 = r2.getTransition(r3); // r4 is a JugPattern
//r5 = new JPRO.JugPattern(4); // expected transition throw
//testo(86, r4.getMHN(), r5.getMHN());
//test(87, r4.name, 'cascade_state_to_shower_state');

//viewer.pattern = r0;
//$('#div1').html(r3.toHtml());

// JugPattern.copy
r6 = r3.copy();
console.log(r6);

SHAKE.FINISH();
