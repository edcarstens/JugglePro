
function State(mhn, props) {
    // Methods
    this.copy = copy;
    this.get_state = get_state;
    this.incr = incr;
    this.make_throw = make_throw;
    this.first_col_is_zero = first_col_is_zero;
    this.next_state = next_state;
    this.equals = equals;
    this.get_transition = get_transition;
    this.unreachable = unreachable;
    this.toInt = toInt;
    this.push_trans_throws = push_trans_throws;   
    this.find_throw = find_throw; 
    this.get_height = get_height;
    this.get_max_throw_height = get_max_throw_height;
    this.toString = toString;
    this.mhn_toString = mhn_toString;
    
    // Members
    this.mhn = mhn;
    this.props = props;
    this.state = get_state(mhn, props);

    function copy() {
	var i,j;
	var rv = new State(this.mhn, this.props);
	rv.state = [];
	for (i=0; i<this.state.length; i++) {
	    rv.state[i] = this.state[i].slice(0); // copies array
	} // for i
	return rv;
    }
    
    function get_state(mhn, props) {
	var i,j,k;
	var n = props;
	var state = [[]]; // 2D matrix
	var dest_row, dest_time_rel, scol, time_idx, max_throw_height;
	max_throw_height = get_max_throw_height(mhn);
	console.log("max_throw_height=" + max_throw_height);
	for (i=0; i<mhn.length; i++) {
	    // proceed from end of pattern backwards in time
	    // repeating the pattern until all props accounted for
	    time_idx = 1; // beats relative to final state
	    while (n > 0) {
		if (time_idx > max_throw_height) {
		    console.log("State: ERROR - Unable to determine state for MHN pattern");
		    return;
		}
		for (j=mhn[i].length-1; j>=0; j--) {
		    for (k=0; k<mhn[i][j].length; k++) {
			dest_row = mhn[i][j][k][0];
			dest_time_rel = mhn[i][j][k][1];
			scol = dest_time_rel - time_idx;
			console.log("i=" + i + " j=" + j + " k=" + k + " th=" + dest_time_rel + " scol=" + scol);
			if (scol >= 0) {
			    if ((state[dest_row] == undefined) || (state[dest_row][scol] == undefined)) {
				state[dest_row][scol] = 1;
			    }
			    else {
				state[dest_row][scol]++; // multiplex support
			    }
			    n--;
			}
		    } // for k
		    time_idx++;
		} // for j
	    } // while
	} // for i
	return state;
    }

    function incr(row, idx) {
	if (this.state[row] == undefined) {
	    this.state[row] = [];
	    this.state[row][idx] = 1;
	    return;
	}
	if (this.state[row][idx] == undefined) {
	    this.state[row][idx] = 1;
	    return;
	}
	this.state[row][idx]++;
	return;
    }
    
    function make_throw(row, dest_row, th) {
	console.log("make_throw called with row=" + row + " dest_row=" + dest_row + " th=" + th);
	var b = this.state[row][0];
	if ((b == undefined) || (b == 0)) {
	    if (th > 0) {
		console.log("make_throw: ERROR - throw-height must be 0 for row " + row);
		return;
	    }
	}
	else {
	    if (th == 0) {
		console.log("make_throw: ERROR - throw-height must be positive for row " + row);
		return;
	    }
	    b--;
	    this.state[row][0] = b;
	    this.incr(dest_row, th);
	}
	if (this.first_col_is_zero()) {
	    this.next_state();
	}
    }

    function first_col_is_zero(state) {
	var i,x;
	if (state == null) { state = this.state; }
	for (i=0; i<state.length; i++) {
	    x = this.toInt(state[i][0]);
	    if (x > 0) {
		return null;
	    } // if
	} // for i
	return 1;
    }

    function next_state(state) {
	var i,x;
	if (state == null) { state = this.state; }
	for (i=0; i<state.length; i++) {
	    x = state[i].shift();
	} // for i
    }

    function equals(s) {
	var i,j;
	var s1 = this.state;
	var s2 = s.state;
	if (s1.length != s2.length) {
	    console.log("rows not equal:" + s1.length + " != " + s2.length);
	    return 0;
	}
	for (i=0; i<s1.length; i++) {
	    if (s1[i].length != s2[i].length) {
		console.log("cols not equal:" + s1[i].length + " != " + s2[i].length + " for row " + i);
		return 0;
	    }
	    for (j=0; j<s1[i].length; j++) {
		if (s1[i][j] == undefined) { s1[i][j] = 0; }
		if (s2[i][j] == undefined) { s2[i][j] = 0; }
		if (s1[i][j] != s2[i][j]) {
		    return 0;
		}
	    } // for j
	} // for i
	return 1;
    }

    // Figures out the minimum sequence of throws required to
    // transition from this state to target state, ts.
    function get_transition(tso) {
	var trans_seq = [];
	var cs = this.copy().state;
	var ts = tso.state;
	var i,csi,tsi;
	for (i=0; i<cs.length; i++) {
	    trans_seq.push([]);
	}
	// If no balls to throw, we have no other option
	// but to wait for balls to drop into hands. This
	// is represented by 0 throw-heights.
	while (this.first_col_is_zero(cs)) {
	    this.next_state(cs);
	    // push zeros on trans seq
	    for (i=0; i<cs.length; i++) {
		trans_seq[i].push([[i,0]]);
	    } // for i
	} // while
	//cs = this.state;
	console.log("0 trans_seq = " + this.mhn_toString(trans_seq));
	// Compare state heights
	var csh = this.get_height();
	var tsh = tso.get_height();
	var tlen = csh - tsh; // transition seq length
	if (tlen < 0) {
	    tlen = 1;
	}
	console.log("csh=" + csh + " tsh=" + tsh + " tlen=" + tlen);
	// Find number of beats (tlen) from current state for which
	// target state is reachable
	csi = csh - 1;
	tsi = csi - tlen;
	while ((tlen <= csi) && this.unreachable(cs, csi, ts, tsi)) {
	    tlen++;
	    tsi = csi - tlen;
	} // while
	console.log("tlen=" + tlen);
	// push transition seq throws
	trans_seq = this.push_trans_throws(trans_seq, cs, ts, tlen);
	console.log("1 trans_seq = " + this.mhn_toString(trans_seq));
	return trans_seq;
    }
    
    function unreachable(cs, csi, ts, tsi) {
	var i,j,cx,tx;
	var csi_tmp = csi;
	for (j=tsi; j>=0; j--) {
	    for (i=0; i<ts.length; i++) {
		cx = this.toInt(cs[i][csi_tmp]);
		tx = this.toInt(ts[i][j]);
		if (cx > tx) {
		    return 1;
		}
	    } // for i
	    csi_tmp--;
	} // for j
	console.log("target state is reachable without having to go through ground state");
	return 0;
    }

    function toInt(x) {
	if (x == undefined) {
	    return 0;
	}
	else {
	    return x;
	}
    }
    
    function push_trans_throws(trans_seq, cs, ts, tlen) {
	var i,j,k;
	var x,ii,jj,throw_ij;
	var trans_seq_tmp = [];
	if (tlen == 0) {
	    return trans_seq;
	}
	for (i=0; i<cs.length; i++) {
	    trans_seq_tmp.push([]);
	}
	
	// fill the gaps prior to building the target state
	for (j=1; j<tlen; j++) {
	    for (i=0; i<cs.length; i++) {
		if (this.toInt(cs[i][j]) == 0) {
		    for (k=0; k<j; k++) {
			if (this.toInt(cs[i][k]) > 0) {
			    cs[i][k]--;
			    cs[i][j] = 1;
			    if (trans_seq_tmp[i][k] == undefined) {
				trans_seq_tmp[i][k] = [[i, j-k]];
			    }
			    else {
				trans_seq_tmp[i][k].push([i, j-k]);
			    }
			    break;
			} // if
		    } // for k
		} // if
	    } // for i
	} // for j
	console.log("0 trans_seq_tmp = " + this.mhn_toString(trans_seq_tmp));

	// build target state
	for (j=0; j<ts[0].length; j++) {
	    for (i=0; i<ts.length; i++) {
		k = j + tlen;
		cs[i][k] = this.toInt(cs[i][k]);
		x = this.toInt(ts[i][j]) - cs[i][k];
		while (x > 0) {
		    throw_ij = this.find_throw(cs, tlen, i, k);
		    ii = throw_ij[0];
		    jj = throw_ij[1];
		    cs[ii][jj] = this.toInt(cs[ii][jj]) - 1;
		    cs[i][k]++;
		    console.log("From ii=" + ii + " jj=" + jj);
		    console.log("  To  i=" + i + "  k=" + k);
		    if (trans_seq_tmp[ii][jj] == undefined) {
			trans_seq_tmp[ii][jj] = [[i, k-jj]];
		    }
		    else {
			trans_seq_tmp[ii][jj].push([i, k-jj]);
		    }
		    x--;
		} // while
	    } // for i
	} // for j
	console.log("1 trans_seq_tmp = " + this.mhn_toString(trans_seq_tmp));

	// append trans_seq_tmp to trans_seq
	for (i=0; i<trans_seq.length; i++) {
	    trans_seq[i] = trans_seq[i].concat(trans_seq_tmp[i]);
	} // for i

	return trans_seq;
    }

    function find_throw(cs, tlen, i, k) {
	var throw_ij;
	for (j=0; j<tlen; j++) {
	    for (i=0; i<cs.length; i++) {
		if (cs[i][j] > 0) {
		    return [i, j];
		}
	    } // for i
	} // for j
	// This is an error!
	console.log("find_throw: ERROR - No balls left in cs to throw");
	return;
    }
    
    function get_height() {
	var i,j,x,rv;
	var s = this.state;
	rv = 0;
	for (i=0; i<s.length; i++) {
	    x = s[i].length;
	    if (x > rv) { rv = x; }
	} // for i
	return rv;
    }
    
    function get_max_throw_height(mhn) {
	var i,j,k,throw_height;
	var max_th = 0;
	for (i=0; i<mhn.length; i++) {
	    for (j=0; j<mhn[i].length; j++) {
		for (k=0; k<mhn[i][j].length; k++) {
		    throw_height = mhn[i][j][k][1];
		    if (throw_height > max_th) {
			max_th = throw_height;
		    } // if
		} // for k
	    } // for j
	} // for i
	return max_th;
    }

    function toString() {
	var i,j,x;
	var rv = "[";
	for (i=0; i<this.state.length; i++) {
	    if (i > 0) {
		rv = rv + ",<br>\n";
	    }
	    rv = rv + "[";
	    for (j=0; j<this.state[i].length; j++) {
		if (j > 0) {
		    rv = rv + ", ";
		}
		x = this.state[i][j];
		x = (x == undefined) ? "0" : x;
		rv = rv + x;
	    } // for j
	    rv = rv + "]";
	} // for i
	rv = rv + "]";
	return rv;
    }
    
    function mhn_toString(mhn) {
	var i, j, k, rv;
	rv = '[';
	for (i=0; i<mhn.length; i++) {
	    if (i > 0) {
		rv = rv + ', ';
	    }
	    rv = rv + '[';
	    for (j=0; j<mhn[i].length; j++) {
		if (j > 0) {
		    rv = rv + ', ';
		}
		rv = rv + '[';
		for (k=0; k<mhn[i][j].length; k++) {
		    if (k > 0) {
			rv = rv + ', ';
		    }
		    rv = rv.concat('[');
		    rv = rv.concat(mhn[i][j][k][0]);
		    rv = rv.concat(',');
		    rv = rv.concat(mhn[i][j][k][1]);
		    rv = rv.concat(']');
		}
		rv = rv + ']';
	    }
	    rv = rv + ']';
	}
	rv = rv + ']';
	return rv;
    }

}
