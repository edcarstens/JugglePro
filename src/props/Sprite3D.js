/**
 * @author Ed Carstens
 */

/**
 * Sprite3D extends PIXI.Sprite so that the 3D
 * depth defines the order of drawing the sprites
 * on the stage
 *
 * @class Sprite3D
 * @extends PIXI.Sprite
 * @constructor
 * @param texture {PIXI.Texture} the texture object
 */

(function () {
    'use strict';

    JPRO.Sprite3D = function(texture) {
	PIXI.Sprite.call( this, texture ); // call superclass
    
    /**
     * The depth of the sprite (into the screen)
     *
     * @property depth
     * @type Number
     */
	this.depth = 0;
    };
    
    JPRO.Sprite3D.prototype = Object.create( PIXI.Sprite.prototype );
    JPRO.Sprite3D.prototype.constructor = JPRO.Sprite3D;
    

/**
 * Inserts this 3D sprite to stage children list at the
 * index based on its depth so that sprite closest to viewer
 * is drawn last and the sprite furthest from viewer is
 * drawn first.
 *
 * @method add2Stage
 * @param stage {PIXI.Stage} the stage
 */
    JPRO.Sprite3D.prototype.add2Stage = function(stage) {
	stage.addChildAt(this, this.add2StageGetIdx(stage));
    };

/**
 * Returns index to children list in the stage based on
 * value of depth of this 3D sprite.
 *
 * @method add2StageGetIdx
 * @param stage {PIXI.Stage} the stage
 * @return {Number} index to children list in the stage
 */
    JPRO.Sprite3D.prototype.add2StageGetIdx = function(stage) {
	var sz = stage.children.length;
	var depth = this.depth;
	var i = 0;
	while (i < sz) {
	    if (depth < stage.children[i].depth) {
		return i;
	    }
	    i++;
	} // while
	return sz;
    };

/**
 *
 * Helper function that creates a sprite that will contain a texture based on an image url
 * If the image is not in the texture cache it will be loaded
 *
 * @method fromImage
 * @static
 * @param imageId {String} The image url of the texture
 * @return {Sprite3D} A new Sprite using a texture from the texture cache matching the image id
 */
    JPRO.Sprite3D.fromImage = function(imageId, crossorigin, scaleMode)
    {
	var texture = PIXI.Texture.fromImage(imageId, crossorigin, scaleMode);
	return new JPRO.Sprite3D(texture);
    };

})();
