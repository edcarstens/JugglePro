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

JPRO.Juggler = function(viewer, hands, pos) {
    
    /**
     * Pointer to the Viewer object
     *
     * @property viewer
     * @type Viewer
     */
    this.viewer = viewer;

    /**
     * 3D Position of this juggler
     *
     * @property pos
     * @type Vec
     */
    this.pos = (pos === undefined) ? new JPRO.Vec(0,200,100) : pos;
    this.facingAngle = -90;
    this.shoulderWidth = 160;

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
	var LeftHand = JPRO.Handfun.cascL(this.pos, this.facingAngle);
	var RightHand = JPRO.Handfun.cascR(this.pos, this.facingAngle);
	var lh = new JPRO.Hand(this.viewer, LeftHand, 'LH', 2, 2, 0, [this.viewer.dwellRatio]);
	var rh = new JPRO.Hand(this.viewer, RightHand, 'RH', 2, 2, 1, [this.viewer.dwellRatio]);
	this.hands = [lh, rh];
    }    
};

JPRO.Juggler.prototype.constructor = JPRO.Juggler;

JPRO.Juggler.prototype.update = function() {
    var h;
    for (h in this.hands) {
	h.update();
    }
};
