/**
 * @author Ed Carstens
 */

/**
 * A Ball extends Prop, having a list of sprites associated
 * with it for drawing the ball in the animation.
 *
 * @class Ball
 * @extends Prop
 * @constructor
 * @param viewer {Viewer} the viewer object
 * @param pos {Vec} optional initial position
 * @param color {Number} 24-bit RGB color
 * @param radius {Number} radius of ball in pixels
 *
 */

(function () {
'use strict';

JPRO.Ball = function(viewer, pos, color, radius) {
    // Call superclass
    JPRO.Prop.call(this, viewer, pos || new JPRO.Vec());

    /**
     * Radius of ball in pixels
     *
     * @property radius
     * @type Number
     */
    this.radius = radius || 40;

    /**
     * Color of ball in 24-bit RGB format
     *
     * @property color
     * @type Number
     */
    this.color = color || 0xffffff;

    /**
     * Pointer to graphics PIXI object
     *
     * @property grfx
     * @type PIXI.Graphics
     */
    this.grfx = this.viewer.grfx;

    /**
     * Last depth index. As the ball position moves toward or
     * away from the viewer, its size or depth index changes.
     * This is used to keep track of the previous setting, so
     * that only a change in ball size results in swapping
     * sprites.
     *
     * @property lastDidx
     * @type Number
     */
    this.lastDidx = -1;
    
    function _drawme(grfx, r, c) {
	var rv = []; // return array of sprites
	var rvSize = 20;
	var s, i, center, sx, sy, rd, depth;
	// Light hits ball from top left
	var light = [0.75, 0.65, 0.55, 0.35, 0.20, 0.13, 0.08, 0.03, 0.02]; // intensity of spotlight
	var radf =  [0.09, 0.11, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45]; // alpha
	for (depth=0; depth<rvSize; depth++) {
	    rd = r - depth; //Math.round(r * 6/(depth+1));
	    center = rd+1;
	    sx = Math.round(center - rd*0.3);
	    sy = Math.round(center - rd*0.3);
	    //sx = Math.round(center);
	    //sy = Math.round(center);
	    grfx.clear();
	    grfx.beginFill(c);
	    grfx.drawCircle(center, center, rd);
	    grfx.endFill();
	    for (i=8; i>=0; i--) {
		grfx.beginFill(c);
		grfx.drawCircle(sx, sy, rd*radf[i]);
		grfx.endFill();
		grfx.beginFill(0xffffff, light[i]);
		grfx.drawCircle(sx, sy, rd*radf[i]);
		grfx.endFill();
	    } // end for
	    s = new JPRO.Sprite3D(grfx.generateTexture());
	    //s.depth_idx = depth;
	    s.anchor.x = 0;
	    s.anchor.y = 0;
	    rv.push(s);
	} // end for
	return rv;
    }
    
    /**
     * Array of sprite PIXI objects stores different sizes of
     * this ball as the actual size is scaled based on depth when
     * projected to 2D view screen. This method might be replaced
     * by the PIXI scaling function as long as it doesn't affect
     * quality and speed.
     *
     * @property mySprites
     * @type Array
     */
    this.mySprites = _drawme(this.grfx, this.radius, this.color);

};

JPRO.Ball.prototype = Object.create( JPRO.Prop.prototype );
JPRO.Ball.prototype.constructor = JPRO.Ball;

/**
 * This updates the position of the ball
 *
 * @method update
 * @return {Ball} this
*/
JPRO.Ball.prototype.update = function() {
    var x,y,scaledRadius,didx,spriteOfs;
    if (this.inPlay === null) {
	if (this.lastDidx >= 0) {
	    this.viewer.stage.removeChild(this.mySprites[this.lastDidx]);
	    //console.log('removed sprite from stage gracefully');
	}
	this.lastDidx = -1;
	return this;
    }
    this.updatePos();
    x = this.posProjected.getX();
    y = this.posProjected.getY();
    scaledRadius = this.posProjected.getZ() * this.radius;
    didx = Math.round(this.radius - scaledRadius);
    if (didx > 19) didx = 19;
    this.mySprites[didx].depth = this.posProjected.getZ();

    // use depth to show different size ball
    spriteOfs = this.radius + 1 - didx;
    this.mySprites[didx].position.x = x - spriteOfs;
    this.mySprites[didx].position.y = y - spriteOfs;
    // remove last sprite and add new sprite if depth changed
    if (didx !== this.lastDidx) {
	if (this.lastDidx >= 0)
	    this.viewer.stage.removeChild(this.mySprites[this.lastDidx]);
	if (didx >= 0) {
	    this.mySprites[didx].add2Stage(this.viewer.stage);
	    //console.log('added sprite to stage');
	}
	this.lastDidx = didx;
    }
    return this;
};

/**
 * This removes the ball sprite from the viewer stage.
 *
 * @method removeMe
 * @return Nothing returned.
*/
JPRO.Ball.prototype.removeMe = function() {
    if (this.lastDidx >= 0) {
	this.viewer.stage.removeChild(this.mySprites[this.lastDidx]);
    }
};

})();
