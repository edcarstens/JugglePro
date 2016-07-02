/**
 * @author Ed Carstens
 */

/**
 * Clock is used to provide a rhythm or even a
 * composition of different rhythms. By default
 * the rhythm is simply a constant beat.
 * All beat periods are some integral multiple of basePeriod.
 * By default the basePeriod is 20.
 *
 * @class Clock
 * @extends Base
 * @constructor
 * @param basePeriod {Number} the juggling base period
 * @param rhythm {HierRptSeq} the rhythm of beats
 * @param name {String} name of this Clock
 */
JPRO.ID.Clock = 0;
JPRO.Clock = function(basePeriod, rhythm, name) {

    // Call superclass
    this.className = this.className || 'Clock';
    JPRO.Base.call(this, name);

    /**
     * Base period
     * The base period is a small time interval which is
     * multiplied by rhythm sequence numbers to calculate
     * the beat periods (duration of each beat).
     *
     * @property basePeriod
     * @type Number
     */
    this.basePeriod = basePeriod || 20;

    /**
     * Top rhythm
     * The top rhythm prescribes the entire sequence
     * of rhythms for the entire juggling routine.
     * The top rhythm is often a sequence of
     * repeated rhythms, but it could just be a
     * simple repeating rhythm. 
     *
     * @property rhythm
     * @type Rhythm
     */
    if (rhythm === undefined) {
	this.rhythm = JPRO.HierRptSeq.create([1]);
	this.rhythm.name = 'rhythm';
    }
    else {
	this.rhythm = rhythm;
    }
    
    /**
     * MHN rows that are in this clock domain
     *
     * @property mhnRows
     * @type Array
     */
    this.mhnRows = [];
    
    /**
     * Time counter within a beat
     *
     * @property t
     * @type Number
     */
    this.t = 0;

    /**
     * Time to current beat
     * This is the time to the current beat relative to
     * the start of animation. The current time or total
     * time since the start of animation is (tt + t).
     *
     * @property tt
     * @type Number
     */
    this.tt = 0;

    /**
     * Upper bound on time counter, tt
     * If and when tt ever exceeds maxTime, it will
     * be adjusted down by maxTime and all timestamps
     * will also be adjusted down by the same.
     *
     * @property maxTime
     * @type Number
     */
    this.maxTime = 30000;

    /**
     * Timestamps hash
     *
     * @property timeStamps
     * @type Object
     */
    this.timeStamps = {}; // hash

    /**
     * 
     *
     * @property 
     * @type 
     */
    // Get current beat period (and move forward a beat)
    this.beatPeriod = this.rhythm.nextItem()*this.basePeriod;

};

JPRO.Clock.prototype = Object.create(JPRO.Base.prototype);
JPRO.Clock.prototype.constructor = JPRO.Clock;

/**
 * Copy
 *
 * @method copy
 * @param objHash {Object} tracks all copied objects
 * @param cFunc {Function} constructor function
 * @return {Clock} copied Clock
 */
JPRO.Clock.prototype.copy = function(objHash, cFunc) {
    var scalars = ['basePeriod'];
    var pFuncs = {};
    pFuncs.timeStamps = JPRO.Common.copyHash;
    pFuncs.mhnRows = function(x, objHash) {return x.slice(0); };
    var objects = ['rhythm'];
    return this.directedCopy(objHash, cFunc, pFuncs, scalars, objects);
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
	//console.log('tt=' + this.tt);
	if (this.tt >= this.maxTime) {  // total time rollover!
	    //alert('Time Rollover!');
	    this.tt -= this.maxTime;
	    this.adjustTimeStamps(this.maxTime);
	}
	this.beatPeriod = this.rhythm.nextItem()*this.basePeriod;
	//console.log('beatPeriod = ' + this.beatPeriod);
	return 1; // new beat
    }
    else {
	this.t++; // increment time (once per animation frame)
	//console.log('t=' + this.t + ' beatPeriod=' + this.beatPeriod);
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
 * @method getTimeStamp
 * @param name
 * @return {Number} 
*/
JPRO.Clock.prototype.getTimeStamp = function(name) {
    if (this.timeStamps[name] === undefined) {
	//console.log('name='+name+' ts undefined');
	return 0;
    }
    else {
	return this.timeStamps[name];
    }
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

JPRO.Clock.prototype.getInterval = function(beat1, beat2) {
    var sum = 0;
    var b = beat1;
    while (b < beat2)
	sum += this.rhythm.getItem(b++)
    return sum;
};
