// test PosePat
test = SHAKE.Test();
testo = SHAKE.TestObj();
SHAKE.VERBOSITY = 0;
s1u = new JPRO.RptSeq([7,-3], 7, null, 's1u');
s1d = new JPRO.RptSeq([-9,2], 3, null, 's1d');
s2u = new JPRO.HierRptSeq([s1u,s1d], 7, null, 's2u');
s2d = new JPRO.HierRptSeq([s1d,s1u], 3, null, 's2d');
s3u = new JPRO.HierRptSeq([s2u,s2d], 7, null, 's3u');

x = s3u.nextItem();
test(1, x, 7);
console.log(x);

for(i=1; i<=40; i++) {
    x = s3u.nextItem();
    console.log(x);
}

SHAKE.FINISH();
