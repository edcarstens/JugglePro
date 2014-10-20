"use strict";

// Throwseq is just an MHN matrix describing throws, that may or may not
// be a (periodic) pattern. Pattern inherits from Throwseq. Transition
// sequences (linking excited state patterns to ground state ones)
// should be Throwseq objects rather than Pattern objects.

function Throwseq(mhn) {
    // Methods
    this.repeat = repeat;
    this.toString = toString;
    // Members
    this.type = "Throwseq";
    this.mhn = mhn ? mhn : [[[[0,0]]]];
    this.iters = 1;
    this.iter_cnt = 0;

    function repeat() {
	console.log('Throwseq.repeat: iter_cnt=' + this.iter_cnt);
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

    function toString() {
	var rv, i, j, k;
	rv = '[';
	for (i=0; i<this.mhn.length; i++) {
	    if (i > 0) {
		rv = rv + ', ';
	    }
	    rv = rv + '[';
	    for (j=0; j<this.mhn[i].length; j++) {
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

}
