"use strict";

function View(viewer, width, height, scale) {

    // Members
    this.viewer = viewer;
    this.width = width || 800;
    this.height = height || 600;
    this.origin = new Vec(this.width/2, 0, this.height/2);
    this.rot = new Matrix();
    this.translation = new Vec();
    this.scale = scale || 4;
    this.g = new Vec(0,0,-4);
    this.world_rot = [this.g]; // list of vectors subject to rotation only (accelerations/velocities)
    this.world_pos = []; // list of position vectors subject to both rotation and translation
    this.depth_offset = 160;
    this.focal_distance = 400;
    
    // Methods
    this.transform = transform;
    this.rotate_me = rotate_me;
    this.translate_me = translate_me;
    this.project = project;
    this.push_rvec = push_rvec;
    this.push_pvec = push_pvec;
    this.push_prop = push_prop;
    this.depth2dscale = depth2dscale;
    
    // Transform 3D vector to this view
    function transform(v) {
	return this.rot.x_vec(v).acc(this.translation);
    }

    // Rotate this view with rotation matrix R
    function rotate_me(r) {
	var i;
	this.rot.x_matrix(r);
	// Rotate all vectors in world list
	for (i=0; i<this.world_rot.length; i++) {
	    r.x_v(this.world_rot[i]);
	}
	for (i=0; i<this.world_pos.length; i++) {
	    r.x_v(this.world_pos[i]);
	}
	return this;
    }

    // Translate this view with translation vector V
    function translate_me(v) {
	var i;
	this.translation.acc(v);
	// Translate all vectors in world list
	for (i=0; i<this.world_pos.length; i++) {
	    this.world_pos[i].acc(v);
	}
    }
    
    // Project 3D (transformed) position onto 2D screen
    function project(pos) {
	var dscale =  this.depth2dscale(this.origin.y + (pos.gety() >> this.scale));
	var x = this.origin.x + (pos.getx() >> this.scale) * dscale;
	var y = this.height - (this.origin.z + (pos.getz() >> this.scale) * dscale);
	return new Vec(x, y, dscale);
    }

    // Appends a vector, v, to the rotation world list
    function push_rvec(v) {
	this.world_rot.push(v);
	return this;
    }

    // Appends a vector, v, to the position world list
    function push_pvec(v) {
	this.world_pos.push(v);
	return this;
    }

    // Appends position and velocity of prop
    function push_prop(p) {
	this.push_pvec(p.pos).push_rvec(p.vel);
	return this;
    }

    // Depth to depth scale factor conversion function
    function depth2dscale(depth) {
	var dscale;
	var tdepth = depth + this.depth_offset; // translate
	if (tdepth < 0) tdepth = 0;
	dscale = this.focal_distance/(this.focal_distance + tdepth);
	return dscale;
    }
}
