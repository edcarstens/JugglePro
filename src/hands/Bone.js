/**
 * @author Ed Carstens
 */

/*
 * A Bone object
 *
 * @class Bone
 * @constructor
 * @param name
 * @param length
 */

(function () {
    'use strict';
    JPRO.ID.Bone = 0;
    JPRO.Bone = function(name, length) {
	// Call superclass
	this.className = this.className || 'Bone';
	JPRO.Base.call(this, name);
	this.length = length;
	this.pitch = 0;
	this.yaw = 0;
	this.roll = 0;
    };

    JPRO.Bone.prototype = Object.create(JPRO.Base.prototype);
    JPRO.Bone.prototype.constructor = JPRO.Bone;

})();
