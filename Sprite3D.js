
Sprite3D = function(texture) {
    PIXI.Sprite.call( this, texture ); // call superclass
    // Members
    this.depth = 0; // depth into screen
    // Methods
    this.add2stage = add2stage;
    this.add2stage_get_idx = add2stage_get_idx;
}

function add2stage(stage) {
    stage.addChildAt(this, this.add2stage_get_idx(stage));
}

function add2stage_get_idx(stage) {
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
}

Sprite3D.fromImage = function(imageId, crossorigin, scaleMode)
{
    var texture = PIXI.Texture.fromImage(imageId, crossorigin, scaleMode);
    return new Sprite3D(texture);
};

// constructor
Sprite3D.prototype = Object.create( PIXI.Sprite.prototype );
Sprite3D.prototype.constructor = Sprite3D;

