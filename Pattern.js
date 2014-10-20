"use strict";

// MHN (Multi-Hand Notation)
// MHN is a 2D matrix of hand/throw pairs. Each row of the matrix is a list of
// throws that a particular hand is to make in the juggling pattern. A column
// corresponds to a time at which throws occur. The hand/throw pair tells the
// hand the destination of the ball. It specifies the destination hand, which
// could even be the same hand, and the destination time (obviously a future
// time). It is up to the person controlling the hand to make the proper throw
// to make this happen. Accurate throws are crucial to juggling.

// MHN+ (Multi-Hand Notation extended to support multiplexing)
// MHN+ is a 3D matrix of hand/throw pairs. Instead of allowing only one ball
// to be thrown at a time from a hand, multiple balls are allowed. This adds
// a third dimension to the matrix called multiplex slot. For example, suppose
// you are holding two balls in one hand. Then the MHN+ matrix would be
// [[[ [0,1], [0,1] ]]].
// If you hold two balls in each hand, another row is used to represent the
// other (right) hand:
// [[[ [0,1], [0,1] ]],
//  [[ [1,1], [1,1] ]]]
// Now suppose you juggle all four balls in a synchronized fountain.
// [[[ [0,2], [0,0] ]],
//  [[ [1,2], [1,0] ]]]
// The hand/throw pairs with 0 throw-height can be discarded now. That makes
// sense because this is no longer a multiplex pattern, so there should be no
// need for multiplex slots.
// [[[ [0,2] ]],
//  [[ [1,2] ]]]
//
// Phases, Rows, and Hands
// So what if you juggle four balls in an asynchronous fountain? In this pattern,
// your hands never throw at the same time, they alternate throws. How is this
// going to be notated? We could insert those ugly zero-throw-height pairs if
// forced to represent each hand with a row. But this is not only ugly, it is
// wasteful. We are all for simplification here. So what if the pattern consists
// of just one row and this row now corresponds to both hands. The two hands
// share the row (alternating each column) and agree on which hand goes first.
// Naturally, the destination hand becomes a function of time as well as
// the row, so it is a bit harder to figure out how to make each throw.
// But look how simple our pattern becomes now!
// [[[ [0,4] ]]]   (with 2 phases)
// Yes, we changed the 2's to a single 4. It would be very hard to juggle this
// pattern with only one hand. Thankfully, God gave us two. 
// This is a simple of example of a multi-phase pattern, in this case there are
// two phases, one for each hand. But if you juggle with someone else, you now
// have four hands and could have four phases.  Or, if you like you can have
// three phases. You just have to agree on an order and then figure out where
// each throw must go to execute the pattern. Oh, the possibilities!
//
// 
//function Pattern(mhn, row_hands, iters, get_bp_xfun, get_tbb_xfun) {
function Pattern(mhn, row_hands, iters) {

    // Inheritance
    this.base = Throwseq;
    this.base(mhn);
    
    // Members
    this.type = "Pattern";
    this.mhn = mhn;
    this.row_hands = row_hands;
    this.iters = (iters == null) ? -1 : iters; // -1 means repeat forever

    // Unusual external functions for timing beats for throws
    //this.get_beat_period = (get_bp_xfun == null) ? get_beat_period : get_bp_xfun;
    //this.get_time_between_beats = (get_tbb_xfun == null) ? get_time_between_beats : get_tbb_xfun;
    
    this.iter_cnt = 0;
    this.rows = mhn.length;
    this.period = mhn[0].length;
    console.log('rows=' + this.rows + ' period=' + this.period);
    this.row_beats = make_array(this.rows); // make array of length rows, all zeros
    this.max_rows = 2; // limited to two hands right now
    this.max_period = 32;
    this.high_throwheight = 9; // yellow warning threshold
    this.max_throwheight = 19; // red warning threshold
    // Members (viewer specific vars)
    this.beat_period = 20;

    // Members (Gui)
    this.selection_order = 0; // numerically ordered
    this.selections = 0; // number of throws selected
    this.is_selected = new Object; // hash
    
    // Methods
    this.set_period_rows = set_period_rows;
    this.swap = swap; // swap two throws (siteswap)
    this.translate_all = translate_all; // add signed offset to all throw-heights
    this.translate_throw = translate_throw; // add period to throw-height
    this.translate_throws_selected = translate_throws_selected;
    this.multiplex_translate = multiplex_translate; // add new multiplex slot to row (new ball)
    this.rotate_rows = rotate_rows;
    this.rotate_throws = rotate_throws;
    this.extend_period = extend_period; // extend period by 1
    this.extend_rows = extend_rows; // add a new row at bottom
    this.reset = reset;
    this.clean = clean; // cleans the pattern by removing unnecessary multiplex slots
    this.calc_props = calc_props; // calculate number of objects in pattern
    this.to_string = to_string;
    this.to_html = to_html;
    this.get_hand = get_hand;
    this.repeat = repeat;
    this.next_beat = next_beat;
    this.select = select;
    this.get_selected_throws = get_selected_throws;
    this.clear_selections = clear_selections;

    this.props = this.calc_props();

    function set_period_rows(period, rows) {
	if (period) {
	    this.period = period;
	}
	if (rows) {
	    this.rows = rows;
	}
	this.mhn = gen_mhn(this.rows, this.period);
	this.props = this.calc_props();
	this.row_beats = make_array(this.rows); // make array of length rows, all zeros
	return this;
    }
    
    // generate MHN+ matrix (+ is multiplex-capable)
    function gen_mhn(rows, period) {
	var pairs; // list of hand/throw pairs (multiplex-capable)
	//var pair;
	var mhn_row;
	var i,j;
	var mhn = [];
	for (i=0; i<rows; i++) {
	    //console.log('i=' + i);
	    mhn_row = [];
	    for (j=0; j<period; j++) {
		pairs = [[i, 0]];
		//console.log('j=' + j);
		mhn_row.push(pairs);
	    }
	    mhn.push(mhn_row);
	}
	return mhn;
    }

    function make_array(sz, val) {
	var val1 = val || 0;
	var i;
	var rv = [];
	for (i=sz-1; i>=0; i--) {
	    rv[i] = val1;
	}
	return rv;
    }
    
    function swap(loc1, loc2) {
	var r1 = loc1[0];
	var t1 = loc1[1];
	var ms1 = loc1[2];
	var r2 = loc2[0];
	var t2 = loc2[1];
	var ms2 = loc2[2];
	var p1 = this.mhn[r1][t1][ms1];
	var p2 = this.mhn[r2][t2][ms2];
	var p1r = p1[0]; // pair1 destination row
	var p1t = p1[1] + t1; // pair1 destination time (absolute)
	this.mhn[r2][t2][ms2] = [p1r, p1t - t2]; // time adjusted (relative)
	var p2r = p2[0];
	var p2t = p2[1] + t2;
	this.mhn[r1][t1][ms1] = [p2r, p2t - t1];
	return this;
    }

    function translate_all(offset) {
	var i,j,k;
	var offset1 = (offset == null) ? 1 : offset; // default to 1
	var sum = 0;
	for (i=0; i<this.rows; i++) {
	    for (j=0; j<this.period; j++) {
		for (k=0; k<this.mhn[i][j].length; k++) {
		    this.mhn[i][j][k][1] += offset1;
		    sum += offset1;
		}
	    }
	}
	this.props += Math.round(sum/this.period);
	return this;
    }

    function translate_throw(loc, mult) {
	var r = loc[0];
	var t = loc[1];
	var ms = loc[2];
	var mult1 = (mult == null) ? 1 : mult; // default to 1
	this.mhn[r][t][ms][1] += mult1*this.period;
	this.props += mult1;
	return this;
    }

    function translate_throws_selected(mult) {
	var a,i;
	a = this.get_selected_throws();
	for (i=0; i<a.length; i++) {
	    this.translate_throw(a[i], mult);
	}
	return this;
    }
    
    function multiplex_translate(row, offset) {
	var j;
	var row1 = row || 0; // default row to zero
	var offset1 = (offset == null) ? 1 : offset; // default offset to 1
	if (this.mhn[row1][0].length >= 4) { // button-happy kid proof this
	    alert("No more than 4 multiplex slots allowed per row");
	    return this;
	}
	for (j=0; j<this.period; j++) {
	    this.mhn[row1][j].push([row1,offset1]); // new multiplex slot pair
	}
	this.props += offset1;
	return this;
    }

    function rotate_throws(x) {
	var i;
	for (i=0; i<this.rows; i++) {
	    this.mhn[i] = rotate_row(x, this.mhn[i]);
	}
	return this;
    }

    function rotate_row(x, mhn_row) {
	var j, idx;
	var rv = [];
	for (j=mhn_row.length-1; j>=0; j--) {
	    idx = (j + x) % mhn_row.length;
	    rv[j] = mhn_row[idx];
	}
	return rv;
    }
    
    function rotate_rows(x) {
	var i, j, k, idx;
	if (this.rows < 2) {
	    return this;
	}
	var mhn = this.mhn.slice(0); // shallow clone
	for (i=0; i<this.rows; i++) {
	    idx = (i + x + this.rows) % this.rows;
	    this.mhn[i] = rotate_rows_adjust(mhn[idx], i-idx, this.rows);
	}
	return this;
    }

    function rotate_rows_adjust(row, adjustment, rows) {
	var j, k;
	for (j=0; j<row.length; j++) {
	    for (k=0; k<row[j].length; k++) {
		row[j][k][0] = (row[j][k][0] + adjustment + rows) % rows;
	    }
	}
	return row;
    }
    
    function extend_period() {
	//console.log('extend_period called');
	var j,i,k,t_abs,x,ms_throws,adjust;
	var sum = 0;
	var n = 0; // amount subtracted from each throw
	if (this.period >= this.max_period) { // kid proofed
	    alert("Period upper limit is " + this.max_period);
	    return this;
	}
	while (sum < this.props*this.period) {
	    for (j=0; j<this.period; j++) {
		for (i=0; i<this.rows; i++) {
		    for (k=0; k<this.mhn[i][j].length; k++) {
			this.mhn[i][j][k][1] -= 1;
			sum++;
		    }
		} // for i
	    } // for j
	    n++;
	} // while
	if (sum > this.props*this.period) {
	    adjust = 1;
	}
	else {
	    adjust = 0;
	}
	for (j=0; j<this.period; j++) {
	    for (i=0; i<this.rows; i++) {
		for (k=0; k<this.mhn[i][j].length; k++) {
		    t_abs = this.mhn[i][j][k][1] + j + adjust; // absolute beat time
		    x = Math.floor(t_abs/this.period); // adjusted for extra column
		    this.mhn[i][j][k][1] += x + n; // add n back in to each throw
		} // for k
	    } // for i
	} // for j
	
	// Extend the period by one column
	for (i=0; i<this.rows; i++) {
	    ms_throws = [];
	    for (k=0; k<this.mhn[i][0].length; k++) {
		ms_throws.push([i, n-adjust]);
	    } // for k
	    this.mhn[i].push(ms_throws); // new column
	} // for i
	this.period++; // increment period
    }

    function extend_rows(throw_height) {
	var t = throw_height || 0;
	var row = [];
	var j;
	if (this.rows >= this.max_rows) { // kid proofed
	    alert("Rows upper limit is " + this.max_rows);
	    return this;
	}
	for (j=0; j<this.period; j++) {
	    row.push([[this.rows, t]]);
	}
	this.mhn.push(row); // append new row
	this.rows++; // increment rows
    }

    function reset() {
	this.period = 1;
	this.rows = 1;
	this.mhn = [[ [[0,0]] ]];
	this.props = 0;
    }
    
    function calc_props() {
	var i,j,k,sum,rv;
	console.log('calc_props called');
	sum = 0;
	for (i=0; i<this.rows; i++) {
	    for (j=0; j<this.period; j++) {
		for (k=0; k<this.mhn[i][j].length; k++) {
		    sum += this.mhn[i][j][k][1];
		}
	    }
	}
	console.log('sum=' + sum);
	rv = sum/this.period;
	// todo - check for error if rv is not an integer
	return Math.round(rv);
    }

    function to_string() {
	var i, j, k, rows, cols, pairs, pair, item, rv;
	rv = '[';
	for (i=0; i<this.rows; i++) {
	    if (i > 0) {
		rv = rv + ', ';
	    }
	    rv = rv + '[';
	    for (j=0; j<this.period; j++) {
		if (j > 0) {
		    rv = rv + ', ';
		}
		rv = rv + '[';
		for (k=0; k<this.mhn[i][j].length; k++) {
		    rv = rv.concat(' [');
		    rv = rv.concat(this.mhn[i][j][k][0]);
		    rv = rv.concat(',');
		    rv = rv.concat(this.mhn[i][j][k][1]);
		    rv = rv.concat('],');
		}
		rv = rv + ']';
	    }
	    rv = rv + ']';
	}
	rv = rv + ']';
	return rv;
    }

    function to_html() {
	var i, j, k, rows, cols, pairs, pair, item, rv, bcolor;
	var swap_enable, call, r, t;
	swap_enable = (this.selections == 2) ? '' : 'disabled';
	call = this.selections ? "_ts" : "_ta"; // translate selected by +-period or all throws by +-1
	rv = "<table><colgroup>";
	rv += "<col span=\"1\" id='first_col'>";
	rv += "<col span=\"" + this.period + "\">";
	rv += "<col span=\"1\" id='last_col'>";
	rv += "</colgroup>";
	rv += "<tr><th><button onclick=\"_ac()\">AC</button></th>"; // start heading row
	rv += "<th><button onclick=\"" + call + "(1)\">0<sup>+</sup></button></th>"; // heading col0
	for (j=1; j<this.period; j++) {
	    rv += "<th><button onclick=\"_rt(" + j + ")\">" + j + "</button></th>";
	}
	rv += "<th><button onclick=\"_ep()\">" + this.period + "</button></th>";
	rv += "</tr>"; // finish heading row
	call += "(-1)";
	for (i=0; i<this.rows; i++) {
	    rv += "<tr><td><button onclick=\"" + call + "\">"; // start row
	    call = "_rr(" + (i+1) + ")";
	    rv += to_hand_symbol(i);
	    if (i == 0) {
		rv += "<sup>-</sup>";
	    }
	    rv += "</button></td>";
	    for (j=0; j<this.period; j++) {
		rv += "<td>";
		for (k=0; k<this.mhn[i][j].length; k++) {
		    r = this.mhn[i][j][k][0]; // destination row
		    t = this.mhn[i][j][k][1]; // destination beat (relative)
		    if (k > 0) rv += ",";
		    bcolor = this.is_selected[i + "," + j + "," + k] ? "#0022dd" :
			((t > this.max_throwheight) || (t < 0) || (t == 0) && (r != i)) ? "red" :
			(t > this.high_throwheight) ? "yellow" : "black";
		    rv += "<span style=\"background-color:" + bcolor +
			"\" onclick=\"_table(" + i + "," + j + "," + k + ")\">";
		    rv += to_hand_symbol(r);
		    rv += t;
		    rv += "</span>";
		}
		rv += "</td>"; // finish column element
	    }
	    rv += "<td>";
	    rv += "<button onclick=\"_mp(" + i + ")\"> Multiplex </button>";
	    rv += "</td>";
	    rv += "</tr>"; // finish row
	}
	// Final row
	rv += "<tr style=\"background-color:#505050\">"; // start row
	rv += "<td><button onclick=\"_er()\">";
	rv += to_hand_symbol(this.rows);
	rv += "</button></td>";
	rv += "<td><button onclick=\"_swap()\"" + swap_enable + "> Swap </button></td>";
	for (j=1; j<this.period; j++) {
	    rv += "<td></td>";
	}
	// bottom right cell
	rv += "<td><button onclick=\"_reset()\"> Reset </button></td>";
	rv += "</tr>"; // finish row
	rv += "</table>";
	return rv;
    }

    function to_hand_symbol(row) {
	return String.fromCharCode(65 + row); // A,B,..
    }
    
    function next_beat() {
	var i;
	for (i=0; i<this.rows; i++) {
	    if (this.row_beats[i] >= this.row_hands[i].length - 1) {
		this.row_beats[i] = 0;
	    }
	    else {
		this.row_beats[i]++;
	    }
	}
    }

    function get_hand(row, beat_rel) {
	var beat_rel1 = beat_rel || 0;
	var rhands = this.row_hands[row];
	console.log('rhands=' + rhands);
	console.log('rhands.length=' + rhands.length);
	var i = (this.row_beats[row] + beat_rel1) % rhands.length;
	console.log('Pattern.get_hand: rhands[' + i + '] = ' + rhands[i].name);
	return rhands[i];
    }

    function repeat() {
	console.log('Pattern.repeat: iter_cnt=' + this.iter_cnt);
	if (this.iters < 0) {
	    return 1; // restart pattern indefinitely
	}
	else if (this.iter_cnt < this.iters-1) {
	    this.iter_cnt++;
	    console.log('Pattern.repeat: iter_cnt=' + this.iter_cnt);
	    return 1; // restart pattern
	}
	else {
	    this.iter_cnt = 0; // reset for next time
	    return null; // finished
	}
    }

    // bp = base beat period
    // beat periods are integer multiples of bp
    // normally, beat_period = bp * 1
//    function get_beat_period(beat, bp) {
//	return bp;
//    }

//    function get_time_between_beats(beat1, beat2, bp) {
//	return (beat2 - beat1)*bp;
//    }
        
    function clean() {
	var i,j;
	for (i=0; i<this.rows; i++) {
	    for (j=0; j<this.period; j++) {
		this.mhn[i,j] = clean_list(this.mhn[i,j], i);
	    }
	} // end for i	
    }

    function clean_list(pairs, row) {
	var rv = [];
	var pair;
	while (pair=pairs.shift) {
	    if ((pair[1] != 0) || (pair[0] != row)) {
		push(rv, pair);
	    }
	} // end while
	return rv;
    }

    function select(row, col, ms) {
	var k = row + ',' + col + ',' + ms; // hash key
	if (this.is_selected[k]) {
	    //this.is_selected[k] = 0; // deselect
	    delete this.is_selected[k];
	    this.selections--;
	}
	else {
	    this.is_selected[k] = ++this.selection_order;
	    this.selections++;
	}
	console.log('selections:' + this.selections);
    }

    function get_selected_throws() {
    	var a,k,aa,i;
	a = [];
	for (k in this.is_selected) {
	    aa = k.split(",");
	    for (i=0; i<aa.length; i++) {
		aa[i] = parseInt(aa[i]); // convert to int
	    }
	    a.push(aa);
	}
	return a;
    }

    function clear_selections() {
	var k;
//	var aa;
	for (k in this.is_selected) {
//	    aa = k.split(",");
//	    if (parseInt(aa[0]) == row) {
		delete this.is_selected[k];
		this.selections--;
//	    }
	}
    }
}

// Dynamic Inheritance
Pattern.prototype = new Throwseq;

// Global functions for onclick events
function _ac() {
    viewer.pattern.clear_selections();
    $("#div1").html(viewer.pattern.to_html());
}

function _ta(x) {
    viewer.pattern.translate_all(x);
    $("#div1").html(viewer.pattern.to_html());
}

function _ts(x) {
    viewer.pattern.translate_throws_selected(x);
    viewer.pattern.clear_selections();
    $("#div1").html(viewer.pattern.to_html());
}

function _rt(x) {
    viewer.pattern.rotate_throws(x);
    $("#div1").html(viewer.pattern.to_html());
}

function _ep() {
    viewer.pattern.extend_period();
    $("#div1").html(viewer.pattern.to_html());
}

// TODO - multiplex translate?
function _mp(row) {
    viewer.pattern.multiplex_translate(row, 1);
    viewer.pattern.clear_selections();
    $("#div1").html(viewer.pattern.to_html());
}

function _rr(x) {
    viewer.pattern.rotate_rows(x);
    $("#div1").html(viewer.pattern.to_html());
}

function _er() {
    viewer.pattern.extend_rows(0);
    $("#div1").html(viewer.pattern.to_html());
}

function _swap() {
    var a = viewer.pattern.get_selected_throws();
    viewer.pattern.swap(a[0], a[1]);
    viewer.pattern.clear_selections();
    $("#div1").html(viewer.pattern.to_html());
}

function _table(row, col, ms) {
    viewer.pattern.select(row, col, ms);
    $("#div1").html(viewer.pattern.to_html());
}

function _reset() {
    viewer.pattern.reset();
    $("#div1").html(viewer.pattern.to_html());
}
