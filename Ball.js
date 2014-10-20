"use strict";

function Ball(viewer, pos, color, radius) {
    // Call superclass
    Prop.call(this, viewer, pos || new Vec());

    // Initialization
    var r = radius || 40;
    var c = color || 0xffffff;
    
    // Members
    //this.viewer = viewer; // required (already in prop)
    this.grfx = this.viewer.grfx;
    this.radius = r;
    this.color = c;
    this.my_sprites = _drawme(this.grfx, r, c);
    this.last_didx = -1;
    this.in_play = null;
    
    // Methods
    //this.drawme = drawme;
    this.update = update;
    this.remove_me = remove_me;
    
    function _drawme(grfx, r, c) {
	var rv = []; // return array of sprites
	var rv_size = 20;
	var s, i, center, sx, sy, rd, depth;
	// Light hits ball from top left
	var light = [0.75, 0.65, 0.55, 0.35, 0.20, 0.13, 0.08, 0.03, 0.02]; // intensity of spotlight
	var radf =  [0.09, 0.11, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45]; // alpha
	for (depth=0; depth<rv_size; depth++) {
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
	    s = new Sprite3D(grfx.generateTexture());
	    //s.depth_idx = depth;
	    s.anchor.x = 0;
	    s.anchor.y = 0;
	    rv.push(s);
	} // end for
	return rv;
    }

    function update() {
	var x,y,scaled_radius,didx,idx,sprite_ofs;
	if (this.in_play == null) {
	    if (this.last_didx >= 0) {
		this.viewer.stage.removeChild(this.my_sprites[this.last_didx]);
		//console.log('removed sprite from stage gracefully');
	    }
	    this.last_didx = -1;
	    return this;
	}
	this.update_pos();
	x = this.pos_projected.getx();
	y = this.pos_projected.gety();
	scaled_radius = this.pos_projected.getz() * this.radius;
	didx = Math.round(this.radius - scaled_radius);
	if (didx > 19) didx = 19;
	this.my_sprites[didx].depth = this.pos_projected.getz();

	// use depth to show different size ball
	sprite_ofs = this.radius + 1 - didx;
	this.my_sprites[didx].position.x = x - sprite_ofs;
	this.my_sprites[didx].position.y = y - sprite_ofs;
	// remove last sprite and add new sprite if depth changed
	if (didx != this.last_didx) {
	    if (this.last_didx >= 0)
		this.viewer.stage.removeChild(this.my_sprites[this.last_didx]);
	    if (didx >= 0) {
		//this.viewer.stage.addChild(this.my_sprites[didx]);
		this.my_sprites[didx].add2stage(this.viewer.stage);
		//console.log('added sprite to stage');
	    }
	    this.last_didx = didx;
	}
	return this;
    }

    function remove_me() {
	if (this.last_didx >= 0) {
	    this.viewer.stage.removeChild(this.my_sprites[this.last_didx]);
	}
    }
    
}
Ball.prototype = new Prop();
