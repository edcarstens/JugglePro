/**
 * @author Ed Carstens
 */

/**
 * Clock is used to provide a rhythm or even a
 * composition of different rhythms. By default
 * the rhythm is simply a constant beat.
 * All beats are some integral multiple of basePeriod.
 * By default the basePeriod is 20.
 *
 * @class Clock
 * @constructor
 * @param basePeriod {Number} the juggling base period
 * @param rhythm {Rhythm} the rhythm of beats
  */
JPRO.Clock = function(basePeriod, rhythm) {
    this.basePeriod = basePeriod || 20;
    this.rhythm = rhythm || new JPRO.Rhythm();
    console.log(this.rhythm.toString());
    // current time within beat
    this.t = 0;
    // total time
    this.tt = 0;
    this.maxTime = 10000; // very low for testing
    this.timeStamps = {}; // hash
    // current beat period
    this.beatPeriod = this.rhythm.nextBeat()*this.basePeriod;

};

JPRO.Clock.prototype.constructor = JPRO.Clock;

/**
 * This method calculates and returns the time between
 * two future beats in the rhythm. The beats are
 * specified relative to the current beat. This is
 * necessary for calculating the flight time of a
 * thrown prop in a juggling pattern.
 *
 * @method timeBetweenBeats
 * @param beat1 {Number} the first beat
 * @param beat2 {Number} the last beat
 */
JPRO.Clock.prototype.timeBetweenBeats = function(beat1, beat2) {
    if (beat1 === 0) {
	return this.rhythm.timeBetweenBeats(0, beat2-1) * this.basePeriod +
	    this.beatPeriod;
    }
    else {
	return this.rhythm.timeBetweenBeats(beat1-1, beat2-1) * this.basePeriod;
    }
};

/**
 * This method should be called once for each frame
 * of the animation (typically 30 frames/second).
 * When it returns 1, props should be thrown (soon);
 * otherwise, props are either in flight or being
 * held by hands.
 *
 * @method update
 * @return {Number} 1 when there is a new beat, otherwise null
*/
JPRO.Clock.prototype.update = function() {
    if (this.t >= this.beatPeriod-1) {
	this.t = 0;
	this.tt += this.beatPeriod; // used for total time method
	console.log('tt=' + this.tt);
	if (this.tt >= this.maxTime) {  // total time rollover!
	    console.log('Time Rollover!');
	    this.tt = 0;
	    this.adjustTimeStamps(this.maxTime);
	}
	this.beatPeriod = this.rhythm.nextBeat()*this.basePeriod;
	console.log('beatPeriod = ' + this.beatPeriod);
	return 1; // new beat
    }
    else {
	this.t++; // increment time (once per animation frame)
	console.log('t=' + this.t + ' beatPeriod=' + this.beatPeriod);
	return null;
    }
};

/**
 * @method totalTime
 * @return {Number} total time since starting this clock
*/
JPRO.Clock.prototype.totalTime = function() {
    return this.tt + this.t;
};

/**
 * @method adjustTimeStamps
 * @param t {Number} time to be subtracted from all timestamps
*/
JPRO.Clock.prototype.adjustTimeStamps = function(t) {
    var ts;
    for (ts in this.timeStamps) {
	this.timeStamps[ts] -= t;
    }
};

/**
 * @method timeStamp
 * @param name {String}
 * @return {Number} 
*/
JPRO.Clock.prototype.timeStamp = function(name) {
    this.timeStamps[name] = this.totalTime();
    return this.timeStamps[name];
};

/**
 * @method duration
 * @param name
 * @return {Number} 
*/
JPRO.Clock.prototype.duration = function(name) {
    if (this.timeStamps[name] === undefined) {
	//console.log('name='+name+' ts undefined');
	return 0;
    }
    else {
	return this.totalTime() - this.timeStamps[name];
    }
};

/**
 * @method deleteTimeStamp
 * @param name
 * @return {Number} 
*/
JPRO.Clock.prototype.deleteTimeStamp = function(name) {
    delete this.timeStamps[name];
};
