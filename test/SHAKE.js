var SHAKE = SHAKE || {};
SHAKE.VERSION = 'v0.0.1';
SHAKE.ERRORS = 0;
SHAKE.VERBOSITY = 0;

SHAKE.Test = function() {
    return function(tid, got, expected, verb) {
	verb = (verb === undefined) ? SHAKE.VERBOSITY : verb;
	if (got !== expected) {
	    SHAKE.ERRORS++;
	    console.log('TEST ' + tid + ': ERROR - GOT ' + got + ', EXPECTED ' + expected);
	    return null;
	}
	else {
	    if (verb)
		console.log('TEST ' + tid + ': PASSED');
	    return 1;
	}
    };
};

SHAKE.TestObj = function() {
    return function(tid, got, expected, verb, depth) {
	var etyp, gtyp, d, i;
	verb = (verb === undefined) ? SHAKE.VERBOSITY : verb;
	d = depth || 0;
	if (d > 99) {
	    console.log('TEST ' + tid + ': ERROR - recursive limit exceeded');
	    return null;
	}
	etyp = typeof expected;
	gtyp = typeof got;
	//console.log('etyp=' + etyp);
	if (! test(tid + '(typeof)', gtyp, etyp, verb)) {
	    return null;
	}
	if ((etyp === 'object') && (expected !== null)) {
	    if ((d == 0) && verb)
		console.log('------ Begin Object Test ------');
	    if (got === expected) {
		if (verb)
		    console.log('TEST ' + tid + ': PASSED');
		return 1;
	    }
	    if (test(tid, got.length, expected.length, verb)) {
		//for (i=0; i<got.length; i++) {
		for (i in expected) {
		    testo(tid + '.' + i, got[i], expected[i], verb, d+1);
		}
	    }
	    if ((d == 0) && verb)
		console.log('------ Object Test  Done ------');
	}
	else {
	    return test(tid, got, expected, verb);
	}
    };
};

SHAKE.FINISH = function() {
    console.log('------- UNIT TEST RESULTS --------');
    if (SHAKE.ERRORS) {
	console.log('TOTAL ERRORS: ' + SHAKE.ERRORS);
    }
    else {
	console.log('CONGRATULATIONS! ALL TESTS PASSED');
    }
    console.log('---------------------------------');
};
