// test RowHandMapper class

// fake the Hand objects
var alh = {name:"ALH"};
var arh = {name:"ARH"};
var blh = {name:"BLH"};
var brh = {name:"BRH"};
var clh = {name:"CLH"};
var crh = {name:"CRH"};
var r1 = new JPRO.RowHandMapper('rhm', [[arh], [alh,brh], [blh,crh,clh]], [[1],[2,2],[3,3,3]]);
console.log(r1.toString());
var i,j;
j = 0;
for (i=0; i<3; i++) {
    console.log("j=" + j + " i=" + i + " hand=" + r1.getHand(i).name);
}
for (j=1; j<4; j++) {
    for (i=0; i<3; i++) {
	console.log("j=" + j + " i=" + i + " hand=" + r1.getHand(i,j).name);
    }
}

console.log(r1.nextBeat().toString());

j = 0;
for (i=0; i<3; i++) {
    console.log("j=" + j + " i=" + i + " hand=" + r1.getHand(i).name);
}
for (j=1; j<3; j++) {
    for (i=0; i<3; i++) {
	console.log("j=" + j + " i=" + i + " hand=" + r1.getHand(i,j).name);
    }
}
