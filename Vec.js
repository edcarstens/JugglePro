"use strict";

function Vec(x, y, z) {
    // object members
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    
    // methods
    this.getx = getx;
    this.gety = gety;
    this.getz = getz;
    this.set = set;
    this.setv = setv;
    this.mdist = mdist;
    this.mdist2 = mdist2;
    this.scale = scale;
    this.add = add;
    this.acc = acc;
    this.to_string = to_string;
    
    function getx() {
	return this.x;
    }
    
    function gety() {
	return this.y;
    }
    
    function getz() {
	return this.z;
    }
    
    function set(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
	return this;
    }
    
    function setv(v) {
	this.x = v.x;
	this.y = v.y;
	this.z = v.z;
	return this;
    }

    function mdist(v) {
	return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
    }
    
    function mdist2(v) {
	return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
    }

    function scale(sc) {
	this.x = this.x << sc;
	this.y = this.y << sc;
	this.z = this.z << sc;
    }
    
    function add(v) {
	return new Vec(
	    this.x + v.x,
	    this.y + v.y,
	    this.z + v.z
	);
    }
    
    function acc(v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
    }

    function to_string() {
	return '(' + this.x + ',' + this.y + ',' + this.z + ')';
    }
}
