/**
 * @author Ed Carstens
 */

/**
 * Viewer is the juggling pattern viewer
 *
 * @class Viewer
 * @constructor
 *
 */

JPRO.Viewer = function() {
    this.initVars();

    /**
     * 
     *
     * @property 
     * @type 
     */
    this.testVar = 0; // for experimentation
};

JPRO.Viewer.prototype = Object.create( JPRO.Config.prototype );
JPRO.Viewer.prototype.constructor = JPRO.Viewer;

/**
 *
 *
 * @method initVars
*/
JPRO.Viewer.prototype.initVars = function() {
    this.renderer = null;
    this.pattern = null;
    this.ballColors = [0xbb11bb, 0x1111dd, 0x11bb11, 0xdddd00, 0xee9900, 0xdd1111];
//	    0xdd2222, 0x22dd22, 0x2222dd, 0xbb22bb,
//			    0x22bbbb, 0xbbbb22, 0x888888, 0x1155bb,
//			    0xeeee00, 0xffaa00, 0xaaff00, 0x22aaff];
    this.ballSize = 40; // best not to change this anymore
    //this.hands = [];
    this.props = []; // list of available props not being juggled
    this.allProps = []; // complete list of props
    this.nprops = 0; // total number of props
//    this.t = 0; // time (iteration)
//    this.beat = 0; // beat number (when throws occur)
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
 * @method init
*/
JPRO.Viewer.prototype.init = function() {
    this.initRotationMatrix();
    //this.initHands(hands);
    this.initProps();
    this.pattern = this.routine.nextPat(this); // init routine.viewer=this
    if (this.pattern) {
	console.log('pattern exists');
    }
    this.view.rotateMe(this.r1);
    this.view.translateMe(this.zoomOut);
//    this.t = 0; // clear time
//    this.beat = 0; // and beat
    //this.beatPeriod = this.pattern.getBeatPeriod(this.beat, this.baseBeatPeriod);
    this.throwProps(this.pattern); // make first throws
    this.gui.init();
    this.initAnimation();
    console.log('finished init');
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
    this.r1 = new JPRO.Rmatrix(-this.viewAngle,0);
    var r1i = new JPRO.Rmatrix(this.viewAngle,0);
    this.aerialTurn = new JPRO.Matrix();
    this.aerialTurn.xMatrix(this.r1).xMatrix(rotz).xMatrix(r1i);
    this.zoomOut = new JPRO.Vec(0, this.zoomDistance, 0);
    this.zoomIn = new JPRO.Vec(0, -this.zoomOut.y, 0);
    return this;
};
    
/**
 *
 *
 * @method initHands
 * @return {Viewer} this viewer
*/
//JPRO.Viewer.prototype.initHands = function(hands) {
//    this.hands = hands;
//    return this;
//};

/**
 *
 *
 * @method initProps
 * @return this viewer
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
 * @return this viewer
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
	alert('No props left');
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
 * @method updateJugglers
 * @return this viewer
*/
JPRO.Viewer.prototype.updateJugglers = function() {
    var i,j;
    for (i=0; i<this.jugglers.length; i++) {
	for (j=0; j<this.jugglers[i].hands.length; j++) {
	    //console.log('updateJugglers: i=' + i + ' j=' + j);
	    this.jugglers[i].hands[j].update();
	}
    }
    return this;
};

/**
 *
 *
 * @method updateProps
 * @return this viewer
*/
JPRO.Viewer.prototype.updateProps = function() {
    var i;
    for (i=0; i<this.allProps.length; i++) {
	this.allProps[i].update();
    }
    return this;
};

JPRO.Viewer.prototype.getPat = function(beatRel) {
    var tmpRtn = this.routine.copy();
    tmpRtn.viewer = {};
    tmpRtn.patternIdx = tmpRtn.currentIdx; // move next ptr back to current one
    var tmpPat = tmpRtn.nextPat(tmpRtn.viewer, 0, 1); // current pattern (copy)
    //var tmpPat = this.pattern.copy();
    console.log(tmpPat);
    var i = beatRel;
    while (i--) {
	console.log('i=' + i);
	if (! tmpPat.nextBeat()) {
	    console.log('proceed to next pat in routine..');
	    tmpPat = tmpRtn.nextPat(null, 0, 1);
	    console.log(tmpPat);
	}
    }
    console.log(tmpPat);
    console.log(tmpPat.rhMap.name);
    return tmpPat;
};

JPRO.Viewer.prototype.getHand = function(pat,row) {
    return pat.rhMap.getHand(row);
};

JPRO.Viewer.prototype.getDwell = function(pat,row,clock,beatRel) {
    return pat.rhMap.getDwell(pat,row,clock,beatRel);
};

/**
 *
 *
 * @method throwProps
*/
JPRO.Viewer.prototype.throwProps = function(pattern) {
    var i,k,pairs,destRow,destHand,rowHand,unthrown,dwell;
    var pat;
    for (i=0; i<pattern.rows; i++) {
	pairs = pattern.mhn[i][pattern.beat];
	rowHand = pattern.rhMap.getHand(i);
	console.log('cp1');
	// timestamp this throw
	this.clock.timeStamp(rowHand.name);
	unthrown = 0;
	for (k=0; k<pairs.length; k++) {
	    if (pairs[k][1] > 0) {
		destRow = pairs[k][0];
		//destHand = this.getHand(destRow, pairs[k][1]);
		//dwell = pattern.rhMap.getDwell(destRow, pairs[k][1], this.clock);
		pat = this.getPat(pairs[k][1]);
//		console.log(pat.toString());
//		console.log('cp2');
//		console.log(pat.rhMap);
		destHand = this.getHand(pat,destRow);
//		console.log('cp3');
		dwell = this.getDwell(pat,destRow,this.clock,pairs[k][1]);
		console.log('dwell=' + dwell);
		// TODO - fix conditional (pairs[k][1] !== 2) based on RHM
		//if ((destHand !== rowHand) || (pairs[k][1] !== 2) ||
		//    (rowHand.nprops() === 0)) {
		if (1) {
		    rowHand.throwProp(destHand, pairs[k][1], dwell);
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
    
    // Update jugglers/balls
    this.updateJugglers().updateProps();
    
    // Optional view rotation
    this.rotateViewWhenEnabled(this.aerialTurn, this.zoomIn, this.zoomOut);
    
    // Do throws once every beat
    if ( this.clock.update() ) {
	if (! this.pattern.nextBeat()) {
	    this.pattern = this.routine.nextPat(this, 0);
	    console.log('New pattern is ' + this.pattern);
	    // Update MHN table in html
	    $('#div1').html(this.pattern.toHtml());
	}
	var i;
	for (i=0; i<this.jugglers.length; i++) {
	    this.jugglers[i].nextBeat(); // for juggler/hand movements
	}
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

/**
 * This is used to find the hand's throw period  
 *
 * @method getHandBeatsFromLastThrow
 * @param row {Number}     - row of RHM matrix
 * @param beatRel {Number} - beat relative to current
 * @param hand {Hand}      - specify the Hand object to search for
 * @return {Number} the number of beats for destination
 *                  hand from its last throw beat
*/
JPRO.Viewer.prototype.getHandBeatsFromLastThrow = function(row, beatRel, hand) {
    var beatRel1 = beatRel || 0;
    // determine rhMap
    
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

