// test PosePat
test = SHAKE.Test();
testo = SHAKE.TestObj();
SHAKE.VERBOSITY = 0;
// Clock
c1 = new JPRO.Clock();
testo(1, c1, {name:'Clock_0', basePeriod:20});
testo(2, c1, {rhythm:{name:'rhythm', iters:-1}});
testo(3, c1, {t:0,tt:0,maxTime:30000,timeStamps:{}});
// Rhythm
r2 = new JPRO.RptSeq([2,3], 1, null, 'r2');
r1 = new JPRO.HierRptSeq([r2], -1, null, 'r1');
c2 = new JPRO.Clock(2, r1, 'c2');
testo(4, c2, {name:'c2', basePeriod:2});
testo(5, c2, {rhythm:{name:'r1', iters:-1}});
test(6, c2.beatPeriod, 4);
// Clock.update()
x = c2.update();
test(7, x, null);
test(8, c2.t, 1);
x = c2.update();
x = c2.update();
x = c2.update();
test(9, x, 1);
test(10, c2.t, 0);
test(11, c2.tt, 4);
test(12, c2.beatPeriod, 6);
x = c2.update();
// Clock.timeStamp()
x = c2.timeStamp('ts1');
test(12.5, x, 5);
x = c2.update();
test(13, x, null);
test(14, c2.t, 2);
x = c2.update();
x = c2.update();
test(15, x, null);
test(16, c2.t, 4);
x = c2.update();
x = c2.update();
test(17, x, 1);
test(18, c2.t, 0);
test(19, c2.tt, 10);
test(20, c2.beatPeriod, 4);
x = c2.update();
x = c2.update();
test(21, x, null);
test(22, c2.t, 2);
// Clock.totalTime
x = c2.totalTime();
test(23, x, 12);
// Clock.getTimeStamp()
x = c2.getTimeStamp('ts1');
test(24, x, 5);
// Clock.duration()
x = c2.duration('ts1');
test(25, x, 7);
// Clock.deleteTimeStamp()
c2.deleteTimeStamp('ts1');
x = c2.duration('ts1');
test(26, x, 0);
x = c2.getTimeStamp('ts1');
test(27, x, 0);
// Clock.getInterval()
//console.log(c2);
x = c2.getInterval(1,4);
test(28, x, 7);

// copy
c2.mhnRows.push(1);
c2.mhnRows.push(2);
c2.mhnRows.push(3);
x = c2.copy()
console.log(x)

SHAKE.FINISH();
