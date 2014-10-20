
// Given a current juggling state, figure out the smallest throw sequence to arrive at a target state.
var n = 5;
var mhn = [[ [[0,n]] ]];
var cs = new State(mhn, n);
var i,r;
cs.state = [[0]];
for (i=0; i<n; i++) {
    r = Math.floor(Math.random() * 12);
    cs.incr(0,r);
}
//cs.state = [[1,0,1,1,0,0,0,1,0,1]];
var ts = new State(mhn, n);
ts.state = [[0]];
for (i=0; i<n; i++) {
    r = Math.floor(Math.random() * 12);
    ts.incr(0,r);
}
//ts.state = [[1,0,0,1,1,0,1,1]];
$("#div1").html("Current State <br>\n" + cs.toString());
$("#div2").html("Target State <br>\n" + ts.toString());
$("#div3").html("Good luck");
x = cs.get_transition(ts);
function my_throw(row, dest_row, th) {
    console.log("my_throw called..");
    //$("#div3").html(th);
    cs.make_throw(row, dest_row, th);
    $("#div1").html("Current State <br>\n" + cs.toString());
    if (cs.equals(ts)) {
	$("#div3").html("SUCCESS!");
    }
    else {
	$("#div3").html("unequal");
    }
}
