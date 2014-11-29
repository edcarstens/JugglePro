/**
 * @author Ed Carstens
 */

/**
 * Viewer is the juggling pattern viewer
 *
 * @class Viewer
 * @constructor
 * @param beatPeriod {Number} the juggling beat period
 *
 */

JPRO.Viewer = function(beatPeriod) {
    
    /**
     * 
     *
     * @property 
     * @type 
     */
    // create a new instance of a pixi stage
    this.stage = new PIXI.Stage(0x000000);

    /**
     * 
     *
     * @property 
     * @type 
     */
    // create a graphics object
    this.grfx = new PIXI.Graphics();

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.grfx.setStageReference(this.stage);

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.stage.addChild(this.grfx);

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.dwellRatio = 0.5; // global default dwell ratio

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.setBeatPeriod(beatPeriod || 40);

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.initVars();

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.renderer = null;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.pattern = null;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.routine = null;

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.testVar = 0; // for experimentation
};

JPRO.Viewer.prototype.constructor = JPRO.Viewer;

/**
 *
 *
 * @method initVars
*/
JPRO.Viewer.prototype.initVars = function() {
    this.view = new JPRO.View(this, 800, 600); // scaling factor is 2^4 = 16
    this.ballColors = [0xbb11bb, 0x1111dd, 0x11bb11, 0xdddd00, 0xee9900, 0xdd1111];
//	    0xdd2222, 0x22dd22, 0x2222dd, 0xbb22bb,
//			    0x22bbbb, 0xbbbb22, 0x888888, 0x1155bb,
//			    0xeeee00, 0xffaa00, 0xaaff00, 0x22aaff];
    this.ballSize = 40; // best not to change this anymore
    this.hands = [];
    this.props = []; // list of available props not being juggled
    this.allProps = []; // complete list of props
    this.nprops = 0; // total number of props
    this.t = 0; // time (iteration)
    this.beat = 0; // beat number (when throws occur)
    //this.renderer = null;
    this.enable = 1;
    //this.pattern = null;
    //this.npropsNotThrown = 0; // number of props not yet thrown
    this.rotEnable = null; // enable view rotation
    this.rotPeriod = 5; // used to slow down view rotation
    this.rotDeg = 180;
    this.rotCnt = 0;
    this.aerialTurn = null;
    this.zoomIn = null;
    this.zoomOut = null;
};

/**
 *
 *
 * @method setBeatPeriod
*/
JPRO.Viewer.prototype.setBeatPeriod = function(bp) {
    this.basePeriod = bp;
    this.minThrowTime = (bp >> 1) + 1; // 1/2 beat period
};
    
/**
 *
 *
 * @method init
*/
JPRO.Viewer.prototype.init = function(routine, hands) {
    this.initRotationMatrix();
    this.routine = routine;
    this.initHands(hands);
    this.initProps();
    this.enable = this.routine.nextPat(this); // init routine.viewer=this
    this.view.rotateMe(this.r1);
    this.view.translateMe(this.zoomOut);
    this.t = 0; // clear time
    this.beat = 0; // and beat
    //this.beatPeriod = this.pattern.getBeatPeriod(this.beat, this.baseBeatPeriod);
    this.throwProps(this.pattern); // make first throws
    return this;
};

/**
 *
 *
 * @method initRotationMatrix
*/
JPRO.Viewer.prototype.initRotationMatrix = function() {
    // Precompute rotation matrix to be used
    // by optional view rotation code during
    // animation
    //var rotx = new JPRO.Rmatrix(-1,0);
    //var roty = new JPRO.Rmatrix(1,1);
    var rotz = new JPRO.Rmatrix(1,2);
    var vangle = 0; // view angle
    this.r1 = new JPRO.Rmatrix(-vangle,0);
    var r1i = new JPRO.Rmatrix(vangle,0);
    this.aerialTurn = new JPRO.Matrix();
    this.aerialTurn.xMatrix(this.r1).xMatrix(rotz).xMatrix(r1i);
    this.zoomOut = new JPRO.Vec(0, 3500, 0);
    this.zoomIn = new JPRO.Vec(0, -this.zoomOut.y, 0);
};
    
/**
 *
 *
 * @method initHands
*/
JPRO.Viewer.prototype.initHands = function(hands) {
    this.hands = hands;
    return this;
};

/**
 *
 *
 * @method initProps
*/
JPRO.Viewer.prototype.initProps = function() {
    var i;
    var b;
    this.nprops = 30;
    for (i=0; i<this.nprops; i++) {
	b = new JPRO.Ball(this, new JPRO.Vec(),
			  this. ballColors[i % this. ballColors.length],
			  this.ballSize); //.caughtBy(this.hands[i % this.hands.length]);
	this.props.push(b);
	this.allProps.push(b);
	this.view.pushProp(b); // push this ball to the view world list
    }
    this.grfx.clear();
    return this;
};

/**
 *
 *
 * @method initAnimation
*/
JPRO.Viewer.prototype.initAnimation = function() {
	
    // create a renderer instance
    this.renderer = PIXI.autoDetectRenderer(this.view.width, this.view.height);

    // add the renderer view element to the DOM
    document.body.appendChild(this.renderer.view);

    return this;
};

/**
 *
 *
 * @method grabNewProp
*/
JPRO.Viewer.prototype.grabNewProp = function() {
    var p;
    console.log('grabbing new prop');
    if (this.props.length === 0) {
	console.log('No props left to grab!');
	return null;
    }
    else {
	p = this.props.pop();
	p.inPlay = 1;
	return p;
    }
};

/**
 *
 *
 * @method dropProp
*/
JPRO.Viewer.prototype.dropProp = function(p) {
    console.log('dropping a prop');
    p.inPlay = null;
    p.inHand = null;
    this.props.push(p);
};
    
/**
 *
 *
 * @method updateHands
*/
JPRO.Viewer.prototype.updateHands = function() {
    var i;
    for (i=0; i<this.hands.length; i++) {
	this.hands[i].update();
    }
    return this;
};

/**
 *
 *
 * @method updateProps
*/
JPRO.Viewer.prototype.updateProps = function() {
    var i;
    for (i=0; i<this.allProps.length; i++) {
	this.allProps[i].update();
    }
    return this;
};

/**
 *
 *
 * @method updateClock
*/
JPRO.Viewer.prototype.updateClock = function(pattern) {
    var i;
    if (this.t >= this.beatPeriod-1) {
	this.t = 0;
	if (this.beat >= pattern.period-1) {
	    this.beat = 0;
	    //this.enable = pattern.repeat();
	    this.enable = pattern.repeat() || this.routine.nextPat();
	    if (this.enable) console.log('restart pattern');
	}
	else {
	    this.beat++;
	}
	for (i=0; i<this.hands.length; i++) {
	    this.hands[i].nextBeat(); // for hand movements
	}
	pattern.nextBeat(); // for multi-phase hands per row
	//this.beatPeriod = pattern.getBeatPeriod(this.beat, this.baseBeatPeriod);
	return 1; // new beat - do throws
    }
    else {
	this.t++; // increment time (once per animation frame)
	return null;
    }
};

/**
 *
 *
 * @method throwProps
*/
JPRO.Viewer.prototype.throwProps = function(pattern) {
    var i,k,pairs,destRow,destHand,rowHand,unthrown;
    for (i=0; i<pattern.rows; i++) {
	pairs = pattern.mhn[i][this.beat];
	rowHand = pattern.getHand(i);
	unthrown = 0;
	for (k=0; k<pairs.length; k++) {
	    if (pairs[k][1] > 0) {
		destRow = pairs[k][0];
		destHand = pattern.getHand(destRow, pairs[k][1]);
		if ((destHand !== rowHand) || (pairs[k][1] !== rowHand.period) ||
		    (rowHand.nprops() === 0)) {
		    rowHand.throwProp(destHand, pairs[k][1]);
		}
		else {
		    // do not make unnecessary little throw
		    console.log(rowHand.name + ' not throwing a ' + pairs[k][1] + ' to ' + destHand.name);
		    unthrown++;
		}
	    }
	}
	if (rowHand.nprops() > unthrown) {
	    rowHand.dropProp(rowHand.nprops() - unthrown); // fix the problem
	}
    }
    return this;
};

/**
 *
 *
 * @method update
*/
JPRO.Viewer.prototype.update = function() {
    
    this.grfx.clear(); // clear graphics
    
    // Update hands/balls
    this.updateHands().updateProps();
    
    // Optional view rotation
    this.rotateViewWhenEnabled(this.aerialTurn, this.zoomIn, this.zoomOut);
    
    // Do throws once every beat period
    if ( this.updateClock(this.pattern) ) {
	this.throwProps(this.pattern);
    }
    
    // render the stage
    this.renderer.render(this.stage);
    
    return this;
};

/**
 *
 *
 * @method rotateViewWhenEnabled
*/
JPRO.Viewer.prototype.rotateViewWhenEnabled = function(rot, zoomIn, zoomOut) {
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
    var handScaleLb,rotRad;
    handScaleLb = 0.3;
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
    rotRad = this.rotDeg * PIXI.DEG_TO_RAD; // convert to radians
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
