/**
 * @author Ed Carstens
 */

/**
 * A throw's destination hand is a function of its destination row
 * and the throw beat. A mapping function maps the row to the actual
 * destination hand. RowHandMapper implements the row-to-hand mapping.
 * It is being called a matrix, but actually is an array of arrays
 * that do not even have to be the same size.
 *
 * @class RowHandMapper
 * @constructor
 * @param rowHands {Array} row-to-hand mapping matrix
 */

JPRO.RowHandMapper = function(name, rhm, tpm, entryTpm) {
    this.name = name;
    /**
     * row-to-hand mapping matrix
     *
     * @property rhm
     * @type Array
     */
    this.rhm = rhm;

    /**
     * Keeps track of beat for each row.
     * Each row can have different period.
     *
     * @property rhm
     * @type Array
     */
    this.rowBeats = this.makeArray(this.rhm.length); // make array filled with zeros

    // Calculate throw period matrix
    this.tpm = tpm;
    this.entryTpm = (entryTpm === undefined) ? this.tpm : entryTpm;
    
    // Calculate handToRowHash (hand-to-row) hash lookup
    var i,j;
    this.handToRowHash = {};
    for (i=0; i<this.rhm.length; i++) {
	for (j=0; j<this.rhm[i].length; j++) {
	    this.handToRowHash[this.rhm[i][j].name] = i;
	}
    }

};

JPRO.RowHandMapper.prototype.constructor = JPRO.RowHandMapper;

/**
 * Copy
 */
JPRO.RowHandMapper.prototype.copy = function() {
    var rv = new JPRO.RowHandMapper(this.name + '_copy', this.rhm, this.tpm, this.entryTpm);
    rv.rowBeats = this.rowBeats.slice();
    rv.tpm = this.tpm;
    rv.entryTpm = this.entryTpm;
    rv.rhm = this.rhm;
    return rv;
};

/**
 * Return a string representation of this object. 
 *
 * @method toString
 * @return {String} representation of this object
 */
JPRO.RowHandMapper.prototype.toString = function () {
    var i,j;
    var rv = "{rhm:[";
    for (i=0; i<this.rhm.length; i++) {
	if (i > 0) {
	    rv = rv + ", ";
	}
	rv = rv + "[";
	for (j=0; j<this.rhm[i].length; j++) {
	    if (j > 0) {
		rv = rv + ", ";
	    }
	    rv = rv + this.rhm[i][j].name;
	}
	rv = rv + "]";
    }
    rv = rv + "], rowBeats:[";
    for (i=0; i<this.rowBeats.length; i++) {
	if (i > 0) {
	    rv = rv + ", ";
	}
	rv = rv + this.rowBeats[i];
    }
    rv = rv + "]}";
    return rv;
};

/**
 * Returns the destination hand specified by row and
 * number of beats relative to current beat.
 *
 * @method getHand
 * @param row {Number}
 * @param beatRel {Number}
 * @return {Hand} the destination hand
 */
JPRO.RowHandMapper.prototype.getHand = function(row, beatRel) {
    var beatRel1 = beatRel || 0;
    console.log("row=" + row);
    var rHands = this.rhm[row];
    if (rHands === undefined) {
	console.log(this.name);
	console.log("rhm[0][0]=" + this.rhm[0][0].name);
	console.log("rhm[1]=" + this.rhm[1]);
	console.log("rhm[1][0]=" + this.rhm[1][0].name);
	alert('hello');
    }
    var i = (this.rowBeats[row] + beatRel1) % rHands.length;
    return rHands[i];
};

JPRO.RowHandMapper.prototype.getDwell = function(pat, row, clock, beatRel) {
    var rHands = this.rhm[row];
    var i = this.rowBeats[row];
    //console.log('getDwell: row=' + row);
    //console.log('entryTpm=' + this.entryTpm);
    //console.log('tpm=' + this.tpm);
    var beats = (pat.iterCnt === 0) ? this.entryTpm[row][i] : this.tpm[row][i];
    //console.log('beats=' + beats);
    var dr = rHands[i].getDwellRatio();
    var beat1 = 0;
    if (beats < beatRel) {
	beat1 = beatRel - beats;
    }
    var pd = clock.timeBetweenBeats(beat1, beatRel);
    console.log(rHands[i].name +
		"dr="+dr+" pd="+pd);
    return dr*pd;
};
/**
 * Returns the dwell time of the destination hand specified
 * by row and number of beats relative to current beat.
 *
 * @method getDwell
 * @param row {Number}
 * @param beatRel {Number}
 * @param clock {Clock}
 * @return {Number} the dwell time in destination hand
 */
/*JPRO.RowHandMapper.prototype.getDwell = function(row, beatRel, clock) {
    var rHands = this.rhm[row];
    var i = (this.rowBeats[row] + beatRel) % rHands.length;
    var beats = this.getHandBeatsFromLastThrow(row, beatRel);
    var beat1 = 0;
    if (beats < beatRel) {
	beat1 = beatRel - beats;
    }
    var dr = rHands[i].getDwellRatio();
    var pd = clock.timeBetweenBeats(beat1, beatRel);
    console.log(rHands[i].name + ' dr='+dr+' pd='+pd);
    return rHands[i].getDwellRatio() * clock.timeBetweenBeats(beat1, beatRel);
};*/

/**
 * Returns the number of beats from last throw beat for
 * destination hand specified by row and number of
 * beats relative to current beat.
 *
 * @method getHandBeatsFromLastThrow
 * @param row {Number}     - row of RHM matrix
 * @param beatRel {Number} - beat relative to current
 * @param hand {Hand}      - specify the Hand object to search for
 * @return {Number} the number of beats for destination
 *                  hand from its last throw beat
 */
JPRO.RowHandMapper.prototype.getHandBeatsFromLastThrow = function(row, beatRel, hand) {
    var beatRel1 = beatRel || 0;
    if (hand !== undefined) {
	row = this.handToRow(hand);
    }
    var rHands = this.rhm[row];
    var i = (this.rowBeats[row] + beatRel1) % rHands.length;
    var rv = 0;
    if (hand === undefined) {
	rv = 1;
	hand = rHands[i];
    }
    while (rv < 999) {
	if (hand === rHands[(i+rHands.length-rv) % rHands.length]) {
	    return rv;
	}
	rv++;
    }
    return 0; // something went wrong
};

JPRO.RowHandMapper.prototype.getHandBeatsToNextThrow = function(hand) {
    var row = this.handToRow(hand);
    //console.log("row=" + row);
    var i = this.rowBeats[row];
    var rHands = this.rhm[row];
    //console.log("rHands=" + rHands);
    var rv = 1;
    while (rv < 999) {
	if (hand === rHands[(i+rv) % rHands.length]) {
	    return rv;
	}
	rv++;
    }
    return 0; // something went wrong
};

/**
 * Increments rowBeats variables, which are used to
 * determine destination hands
 *
 * @method nextBeat
 * @return {RowHandMapper} this object
 */
JPRO.RowHandMapper.prototype.nextBeat = function() {
    var i;
    for (i=0; i<this.rowBeats.length; i++) {
	if (this.rowBeats[i] >= this.rhm[i].length - 1) {
	    this.rowBeats[i] = 0;
	}
	else {
	    this.rowBeats[i]++;
	}
	console.log("rowBeats[" + i + "]=" + this.rowBeats[i]);
    }
    return this;
};

/**
 * Creates an array of specified size filled with
 * specified value or zero if value is not specified.
 *
 * @method makeArray
 * @param sz {Number} size
 * @param val {Number} optional value
 * @return {Array} the created array
 */
JPRO.RowHandMapper.prototype.makeArray = function(sz, val) {
    var val1 = val || 0;
    var i;
    var rv = [];
    for (i=sz-1; i>=0; i--) {
	rv[i] = val1;
    }
    return rv;
};

/**
 * Returns the rhm row corresponding to specified Hand.
 * A Hand is assumed to be in no more than one rhm row.
 *
 * @method handToRow
 * @param hand {Hand} hand object to look up
 * @return {Number} the (last) rhm row in which this hand is found
 */
JPRO.RowHandMapper.prototype.handToRow = function(hand) {
    //if (hand) {
//	console.log("RowHandMapper handToRow: hand ok name=" + hand.name);
//    }
//    if (this.handToRowHash) {
//	console.log(this.handToRowHash);
//    }
    return this.handToRowHash[hand.name];
};
