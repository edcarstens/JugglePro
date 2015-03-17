/**
 * @author Ed Carstens
 */

/**
 *
 *
 * @class Juggler
 * @constructor
 * @param viewer {Viewer} the viewer object
 *
 */
JPRO.ID.Juggler = 0;
JPRO.Juggler = function(viewer, name, hands, neckPos, facingAngle, params) {
    
    // Call superclass
    this.className = this.className || 'Juggler';
    JPRO.Base.call(this, name);

    /**
     * Pointer to the Viewer object
     *
     * @property viewer
     * @type Viewer
     */
    this.viewer = viewer;
    
    /**
     * 3D Position of this juggler (specifically the neck)
     *
     * @property neckPos
     * @type Vec
     */
    this.neckPos = ((neckPos === undefined) || (neckPos === null)) ? new JPRO.Vec(0,200,100) : neckPos;

    /**
     * Facing Angle
     *
     * @property 
     * @type Number
     */
    this.facingAngle = ((facingAngle === undefined) || (facingAngle === null)) ? -90 : facingAngle;

    /**
     * Parameters: shoulderWidth, upperArmLength, foreArmLength, handLength
     * 
     * @property params
     * @type Object
     */
    if (params === undefined) { params = {}; }
    this.shoulderWidth = params.shoulderWidth || JPRO.SHOULDERWIDTH;
    this.upperArmLength = params.upperArmLength || JPRO.UPPERARMLENGTH;
    this.foreArmLength = params.foreArmLength || JPRO.FOREARMLENGTH;
    this.handLength = params.handLength || JPRO.HANDLENGTH;

    /**
     * Array of Hand objects
     *
     * @property hands
     * @type Array
     */
    if ((hands !== undefined) && (hands !== null)) {
	this.hands = hands;
    }
    else {
	var LeftHand = JPRO.Handfun.cascL(this);
	var RightHand = JPRO.Handfun.cascR(this);
	//var LeftHand = JPRO.Handfun.stationaryL(this);
	//var RightHand = JPRO.Handfun.stationaryR(this);
	var lh = new JPRO.Hand(this.viewer, this.name + '_LH', LeftHand, 0);
	var rh = new JPRO.Hand(this.viewer, this.name + '_RH', RightHand, 1);
	this.hands = [lh, rh];
    }    
};

JPRO.Juggler.prototype = Object.create(JPRO.Base.prototype);
JPRO.Juggler.prototype.constructor = JPRO.Juggler;

/**
 * Copy
 *
 * @method copy
 * @return {Juggler} copied Juggler
 */
JPRO.Juggler.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    pFuncs.hands = JPRO.Common.copyObjVector;
   
    cFunc = cFunc || function() {
	return new JPRO.Juggler(null, // viewer
				1, // name
				[], // hands
				1, // neckPos
				1, // facingAngle
				{}); // params
    };
    return this.copyOnce(objHash, cFunc, {}, pFuncs);
};

JPRO.Juggler.prototype.update = function(timeBetweenThrowsHash) {
    var i;
    for (i in this.hands) {
	this.hands[i].update(timeBetweenThrowsHash);
    }
};

JPRO.Juggler.prototype.updatePos = function() {
    var i;
    for (i in this.hands) {
	this.hands[i].updatePos();
    }
};

JPRO.Juggler.prototype.nextBeat = function() {
    var i;
    for (i in this.hands) {
	this.hands[i].nextBeat();
    }
};
