/**
 * @author Ed Carstens
 */

/**
 * LookAhead is a class which calculates future throws.
 *
 * @class LookAhead
 * @constructor
 *
 */

JPRO.LookAhead = function(viewer) {
    
    /**
     * Pointer to viewer
     *
     * @property viewer
     * @type Viewer
     */
    this.viewer = viewer; // original viewer
    this.tdm = [];
    this.tbt = [];
    // First copy of viewer
    // Work with a copy of viewer so as not to
    // corrupt the original viewer. An object hash
    // keeps track of references to existing objects,
    // so that there is only one copy per object.
    this.objHash1 = {};
    this.v1 = viewer.copy(this.objHash1);
};

JPRO.LookAhead.prototype.constructor = JPRO.LookAhead;

/**
 * @method preCalculate
 */
JPRO.LookAhead.prototype.preCalculate = function() {
    var i, pairs, rowHand, k, destRow;
    var throwHeight;
    var destHand;
    //var hFuncs = {}; // hash
    var flightTime;
    var dwellRatio;
    var dwell;
    var minTime;
    var mBeat;
    var pa;
    var pos;
    var td;
    var origRowHandName;
    var timeBetweenThrows = {};
    var tbtDone = {};
    var handName;
    var x;
    
    if (this.tdm.length > 2) {
	return;
    }
    // sort all throws by throw-height times lo-to-hi
    // look-ahead to throw-1, store hFunc's for hand positions
    // look-ahead to throw, store dest hands
    // calc and store init velocities
    //
    // get beats to next throws for each hand
    //
    // Work with a copy of v1 so as not to
    // corrupt the original viewer. An object hash
    // keeps track of references to existing objects,
    // so that there is only one copy per object.

    // initialize tdm with ThrowData objs
    var p1 = this.v1.pattern;
    var newTDM = [];
    for (i=0; i<p1.rows; i++) {
	pairs = p1.mhn[i][p1.beat];
	rowHand = p1.rhMap.getHand(i);
	origRowHandName = this.objHash1[rowHand.name].name;
	this.v1.clock.timeStamp(origRowHandName);
	//	p0.tdm[i][p1.beat] = [];
	newTDM.push([]);
	for (k=0; k<pairs.length; k++) {
	    if (pairs[k][1] > 0) {
		destRow = pairs[k][0];
		throwHeight = pairs[k][1];
		// push info into tdm (throw data matrix)
		newTDM[i].push(new JPRO.ThrowData(rowHand.pos, destRow, throwHeight));
	    }
	}
    }
    this.tdm.push(newTDM);

    // Make a copy of v1 (v2); initialize tbtDone hash to all null
    this.objHash2 = {};
    var v2 = this.v1.copy(this.objHash2);
    v2.clock.timeStamp('current');
    var p2 = v2.pattern;
    for (i=0; i<v2.jugglers.length; i++) {
	for (k=0; k<v2.jugglers[i].hands.length; k++) {
	    tbtDone[v2.jugglers[i].hands[k].name] = null;
	}
    }
    for (i=0; i<p2.rows; i++) {
	rowHand = p2.rhMap.getHand(i);
	origRowHandName = this.origObj(rowHand).name;
	v2.clock.timeStamp(origRowHandName);
	//hFuncs[rowHand.name] = rowHand.hFunc.copy();
    } // for

    // increment beat, decrement ThrowData throw-heights
    // keep track of hFunc's
    var tbtFinalDone = null;
    var initVelDone = null;
    while (!tbtFinalDone || !initVelDone) {
	initVelDone = 1;
	v2.nextBeat();
	p2 = v2.pattern;
	for (i=0; i<newTDM.length; i++) {
	    for (k=0; k<newTDM[i].length; k++) {
		td = newTDM[i][k];
		throwHeight = td.nextBeat();
		if (throwHeight > 0) {
		    initVelDone = null;
		}
		else if (throwHeight === 0) {
		    // get dest hand
		    destHand = p2.rhMap.getHand(td.destRow);
		    //td.destHand = this.objHash1[this.objHash2[destHand.name].name];
		    td.destHand = this.origObj(destHand);
		    // calc flight time
		    flightTime = v2.clock.duration('current');
		    dwellRatio = destHand.dwellRatio;
		    //dwellRatio = 0.32;
		    x = v2.clock.duration(td.destHand.name);
		    
		    //alert("LA " + v2.clock.tt + ":" + v2.clock.t + " " + td.destHand.name + " duration=" + x + " ft=" + flightTime);
		    dwell = dwellRatio * x;
		    //dwell = dwellRatio * 40;
		    flightTime -= dwell;
		    minTime = v2.minThrowTime;
		    if (flightTime < minTime) flightTime = minTime;
		    td.timer = flightTime;
		    td.catchTime = v2.clock.getTimeStamp('current') + flightTime;
		}
	    } // for
	} // for
	for (i=0; i<p2.rows; i++) {
	    pairs = p2.mhn[i][p2.beat];
	    rowHand = p2.rhMap.getHand(i);
	    origRowHandName = this.origObj(rowHand).name;
	    if (! tbtDone[rowHand.name]) {
//		if (p2.isThrowing(rowHand)) {
		    timeBetweenThrows[origRowHandName] = v2.clock.duration(origRowHandName);
		    tbtDone[rowHand.name] = 1;
//		}
	    }
	    v2.clock.timeStamp(origRowHandName);
	    //hFuncs[rowHand.name] = rowHand.hFunc.copy();
	} // for

	// Determine if done with timeBetweenThrows hash
	tbtFinalDone = 1;
	for (i=0; i<v2.jugglers.length; i++) {
	    for (k=0; k<v2.jugglers[i].hands.length; k++) {
		handName = v2.jugglers[i].hands[k].name;
		if (! tbtDone[handName]) {
		    tbtFinalDone = null;
		}
	    }
	}
    } // while

    // push onto tbt FIFO
    this.tbt.push(timeBetweenThrows);

    // Final loop to determine destination hand positions and calculate
    // initial throw velocities
    this.objHash2 = {};
    v2 = this.v1.copy(this.objHash2);
    v2.clock.timeStamp('current');
    p2 = v2.pattern;
    initVelDone = null;
    while (!initVelDone) {
	initVelDone = 1;
	for (i=0; i<newTDM.length; i++) {
	    for (k=0; k<newTDM[i].length; k++) {
		td = newTDM[i][k];
		if (td.catchTime < v2.clock.tt + v2.clock.beatPeriod) {
		    // found beat in which catch occurs
		    destHand = this.objHash2[this.objHash1[td.destHand.name].name];
		    mBeat = destHand.movementBeat;
		    //mBeat = 0;
		    dwellRatio = destHand.dwellRatio;
		    console.log('EWC: mBeat=' + mBeat + ' dwellRatio=' + dwellRatio);
		    console.log('EWC: destHand=' + destHand.name + ' hFunc=' + destHand.hFunc.name);
		    console.log('EWC: tt=' + v2.clock.tt + ' i=' + i);
		    pa = destHand.hFunc.getPos(1-dwellRatio, mBeat); // position array
		    pos = v2.view.transform(pa[0]);
		    console.log('EWC: pos=' + pos.toString());

		    // calc and store initial velocity and flight time in throw data matrix
		    td.setVel(pos, v2.view.g);
		}
		else {
		    initVelDone = null;
		}
	    } // for k
	} // for i
	v2.nextBeat();
    } // while
    
    // Now move v1 to next beat
    this.v1.nextBeat();
};

JPRO.LookAhead.prototype.origObj = function(obj) {
    return this.objHash1[this.objHash2[obj.name].name];
};

JPRO.LookAhead.prototype.getTimeBetweenThrows = function() {
    return this.tbt.shift();
};

JPRO.LookAhead.prototype.getThrowDataMatrix = function() {
    return this.tdm.shift();
};
