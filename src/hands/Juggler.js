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

JPRO.Juggler = function(viewer, hands, neckPos, facingAngle, shoulderWidth, upperArmLength,
			foreArmLength, handLength) {
    
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
    this.facingAngle = ((facingAngle === undefined) || (facingAngle === null)) ? -90 : facingAngle;
    this.shoulderWidth = shoulderWidth || JPRO.SHOULDERWIDTH;
    this.upperArmLength = upperArmLength || JPRO.UPPERARMLENGTH;
    this.foreArmLength = foreArmLength || JPRO.FOREARMLENGTH;
    this.handLength = handLength || JPRO.HANDLENGTH;

    /**
     * Array of Hand objects
     *
     * @property hands
     * @type Array
     */
    if (hands) {
	this.hands = hands;
    }
    else {
	var LeftHand = JPRO.Handfun.cascL(this);
	var RightHand = JPRO.Handfun.cascR(this);
	var lh = new JPRO.Hand(this.viewer, LeftHand, 'LH', 0);
	var rh = new JPRO.Hand(this.viewer, RightHand, 'RH', 1);
	this.hands = [lh, rh];
    }    
};

JPRO.Juggler.prototype.constructor = JPRO.Juggler;

JPRO.Juggler.prototype.update = function() {
    var i;
    for (i in this.hands) {
	this.hands[i].update();
    }
};

JPRO.Juggler.prototype.nextBeat = function() {
    var i;
    for (i in this.hands) {
	this.hands[i].nextBeat();
    }
};
