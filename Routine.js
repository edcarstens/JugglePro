// A Routine is an ordered list of Patterns
// Each pattern can be executed X>=0 number of times or indefinitely (X=-1)
// Routine.iters allows multiple runs of the routine

function Routine(patterns) {
    // Methods
    this.push_pat = push_pat;
    this.next_pat = next_pat;
    // Members
    this.patterns = (patterns == null) ? [] : patterns; // list of patterns
    this.pattern_idx = 0; // index to patterns
    this.iters = -1;
    this.iter_cnt = 0;
    this.viewer = null;
    this.enable = 1;
    this.type = "Routine";
    
    // push a new pattern on the list
    function push_pat(pat) {
	this.patterns.push(pat);
	return this;
    }

    // assigns viewer.pattern to current pattern indexed
    // except when current pattern has 0 iterations
    // increments pattern index, returning it to 0
    // and repeating based on iters.
    function next_pat(viewer, depth) {
	var i,j,x,pat,d;
	console.log('next_pat called with depth=' + depth);
	if (this.enable == null) {
	    this.enable = 1;
	    return null;
	}
	d = depth ? depth : 0;
	if (d > 99) {
	    this.enable = null;
	    throw 'exceeded recursive limit';
	}
	if (viewer) {
	    this.viewer = viewer;
	}
	if (this.iters == 0) {
	    this.enable = null;
	    return null;
	}
	j = 0;
	i = this.pattern_idx;
	console.log('pattern idx = ' + i);
	// Find first pattern with iters>0
	while ((j < this.patterns.length) && (this.patterns[i].iters == 0)) {
	    i++;
	    if (i >= this.patterns.length) {
		i = 0;
		if (this.iters > 0) {
		    this.iter_cnt++;
		}
	    }
	    j++;
	}
	if (j == this.patterns.length) {
	    throw "pattern has no iterable pattern in it"
	}
	// Set viewer pattern and other viewer vars
	x = this.patterns[i];
	this.pattern_idx = i;
	if (x.type == "Routine") {
	    if (x.next_pat(this.viewer, d+1)) {
		return 1;
	    }
	    //x.enable = 1;
	    console.log('finished routine');
	    pat = null;
	}
	else {
	    pat = x;
	    this.viewer.pattern = pat;
	    this.viewer.beat_period = pat.beat_period;
	    //this.viewer.beat_period = this.patterns[i].get_beat_period(this.viewer.beat, this.viewer.base_beat_period);
	    // Update MHN table in html
	    $("#div1").html(this.viewer.pattern.to_html());
	}

	i++;
	if (i >= this.patterns.length) {
	    i = 0;
	    if (this.iters > 0) {
		this.iter_cnt++;
	    }
	}
	this.pattern_idx = i;
	if ((this.iters > 0) && (this.iter_cnt >= this.iters)) {
	    this.iter_cnt = 0;
	    this.enable = null; // disable for next time
	    if (pat == null) {
		return null;
	    }
	    else {
		return 1;
	    }
	}
	if (pat == null) {
	    return this.next_pat(this.viewer, d+1);
	}
	else {
	    return this.enable;
	}
    }
}
