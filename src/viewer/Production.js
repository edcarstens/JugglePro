/**
 * @author Ed Carstens
 */

/**
 * Production object consists of views,
 * music, lighting, etc.
 *
 * @class Production
 * @constructor
 *
 */

JPRO.ID.Production = 0;
JPRO.Production = function(viewer, name) {
    // Call superclass
    this.className = this.className || 'Production';
    JPRO.Base.call(this, name);

    /**
     * Pointer to the Viewer object
     *
     * @property viewer
     * @type {Viewer}
     */
    this.viewer = viewer;
};

JPRO.Production.prototype = Object.create(JPRO.Base.prototype);
JPRO.Production.prototype.constructor = JPRO.Production;

//JPRO.Production.prototype.copy = function(objHash, cFunc) {
//};

JPRO.Production.prototype.setDefaults = function() {
    if (this.defaultsSet) return;
    this.defaultsSet = 1;
    /**
     * View
     *
     * @property view
     * @type {View}
     */
    if (this.view === undefined) {
	this.view = JPRO.View(this.viewer);
    }
    
    /**
     * View angle
     *
     * @property viewAngle
     * @type {Number}
     */
    this.viewAngle = this.viewAngle || 0;
    // Calculate rotation matrix for this
    this.viewAngleRot = new JPRO.Rmatrix(-this.viewAngle, 0);

    /**
     * Zoom distance
     *
     * @property zoomDistance
     * @type {Number}
     */
    this.zoomDistance = this.zoomDistance || 4500;
    // Calcualte zoom vectors
    this.zoomOut = new JPRO.Vec(0, this.zoomDistance, 0);
    this.zoomIn = new JPRO.Vec(0, -this.zoomOut.y, 0);
    
    /**
     * View rotation enable
     *
     * @property rotEnable
     * @type {Boolean}
     */
    this.rotEnable = this.rotEnable || null;
    
    /**
     * View rotation period
     *
     * @property rotPeriod
     * @type {Number}
     */
    this.rotPeriod = this.rotPeriod || 5;
    
    /**
     * View rotation angle (in degrees)
     *
     * @property rotDeg
     * @type {Number}
     */
    if (this.rotDeg === undefined) {
	this.rotDeg = 180;
    }
    
    /**
     * 
     *
     * @property rotCnt
     * @type {Number}
     */
    this.rotCnt = this.rotCnt || 0;
    
    /**
     *
     *
     * @property aerialTurn
     * @type {}
     */
    if (this.aerialTurn === undefined) {
	this.aerialTurn = new JPRO.Matrix();
	var r1i = new JPRO.Rmatrix(this.viewAngle, 0);
	this.aerialTurn.xMatrix(this.viewAngleRot).xMatrix(rotz).xMatrix(r1i);
    }
    
    this.frameTick = 0;
};

JPRO.Production.prototype.update = function() {
    if (this.frameTick == 5) {
	this.frameTick = 0;
	// Optional view rotation
	this.rotateViewWhenEnabled(this.aerialTurn, this.zoomIn, this.zoomOut);
	return 1;
    }
    else {
	this.frameTick++;
	return null;
    }
};

/**
 *
 *
 * @method rotateViewWhenEnabled
*/
JPRO.Production.prototype.rotateViewWhenEnabled = function(rot, zoomIn, zoomOut) {
    if (this.rotEnable) {
	this.rotCnt++;
	if (this.rotCnt > this.rotPeriod) {
	    this.rotCnt = 0;
	    this.rotateView(rot, zoomIn, zoomOut);
	}
    }
};

/**
 *
 *
 * @method rotateView
*/
JPRO.Viewer.prototype.rotateView = function(rot, zoomIn, zoomOut) {
    //var handScaleLb,rotRad;
    //handScaleLb = 0.3;
//    function hsbound(xx, limit) {
//	var x = xx;
//	if (Math.abs(x) < limit) {
//	    x = limit;
//	}
//	return x;
//    }
    
    this.view.translateMe(zoomIn);
    this.view.rotateMe(rot);
    this.view.translateMe(zoomOut);
    this.rotDeg++;
    if (this.rotDeg > 180) this.rotDeg -= 360;
    //rotRad = this.rotDeg * PIXI.DEG_TO_RAD; // convert to radians
    //	for (i=0; i<this.hands.length; i++) {
//	    this.hands[i].my_sprite.rotation = rotRad;
//	    // Scale hands' sprites in x and y directions
//	    x = 2*Math.abs(Math.cos(rotRad))*this.hands[i].pos_projected.z;
//	    y = 2*Math.abs(Math.sin(rotRad))*this.hands[i].pos_projected.z;
//	    // Avoid the paper thin disappearing hand issue when
//	    // scale gets too close to zero
//	    x = hsbound(x, handScaleLb);
//	    y = hsbound(y, handScaleLb);
//	    this.hands[i].my_sprite.scale.x = x;
//	    this.hands[i].my_sprite.scale.y = y;
//	} // for
    return this;
};
