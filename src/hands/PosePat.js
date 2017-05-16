/**
 * @author Ed Carstens
 */

/**
 * A PosePat represents a full arm (including hand)
 * movement in 3D space. Its repeatable sequence is
 * composed of Seq/RptSeq/PosePat objects. It extends
 * the HierRptSeq class. Sequence items are Pose
 * objects.
 *
 * @class PosePat
 * @extends HierRptSeq
 * @constructor
 * @param itemList
 * @param iters
 * @param name
 *
 */

(function () {

    'use strict';
    JPRO.ID.PosePat = 0;
    JPRO.PosePat = function(itemList, iters, name) {
	// Call superclass
	this.className = this.className || 'PosePat';
	JPRO.HierRptSeq.call(this, itemList, iters, 2, name);
	
    };
    
    JPRO.PosePat.prototype = Object.create(JPRO.HierRptSeq.prototype);
    JPRO.PosePat.prototype.constructor = JPRO.PosePat;

    JPRO.PosePat.prototype.calcXva = function() {
	var i, j, pose, lastPose, poseAngles, intPose, ix;
	poseAngles = 10;
	// returns difference of angles (b-a)
	var adelta = function(a,b) {
	    var rv = b-a;
	    // normalize to (-180 : +180]
	    while (rv <= -180) { rv += 360; }
	    while (rv > 180) { rv -= 360; }
	    return rv;
	};
	// enable a computation pass
	// similar to map(), but keeps track
	// of last pose
	var pass = function(fi,f,step) {
	    var lastPose, i, j, pose, nextPose;
	    lastPose = poses[0];
	    pose = poses[step];
	    for (i=step+step; i<poses.length; i+=step) {
		nextPose = poses[i];
		fi(pose); // init
		for (j=0; j<poseAngles; j++) {
		    f(j, lastPose, pose, nextPose);
		}
		lastPose = pose;
		pose = nextPose;
	    }
	};
	var poses = this.expandSeqs();
	//console.log(poses);
	poses = poses.concat(poses.slice(0,4));
	//console.log(poses);
	// Compute deltas
	pass(function(pose) { pose.d = []; },
	     function(j, lastPose, pose, nextPose) {
		 pose.d.push(adelta(pose.x[j], nextPose.x[j]));
	     }, 2);
	// Compute velocities, double array size
	// look for local maxima or minima
	// if d[0]>=0 and d[1]<=0, then x[1] is local max, v[1]=0
	// if d[0]<=0 and d[1]>=0, then x[1] is local min, v[1]=0
	pass(function(pose) { pose.v = []; },
	     function(j, lastPose, pose, nextPose) {
		 var v;
		 if ((lastPose.d[j] >= 0) && (pose.d[j] <= 0)) {
		     v = 0;
		 }
		 else if ((lastPose.d[j] <= 0) && (pose.d[j] >= 0)) {
		     v = 0;
		 }
		 else {
		     v = (lastPose.d[j] + pose.d[j])/2; // simple average
		 }
		 pose.v.push(v);
	     }, 2);
	// Solve for intermediate velocities
	lastPose = poses[0];
	for (i=1; i<poses.length-1; i+=2) {
	    intPose = poses[i];
	    pose = poses[i+1];
	    intPose.v = [];
	    for (j=0; j<poseAngles; j++) {
		intPose.v.push(lastPose.d[j]*2 - (pose.v[j] + lastPose.v[j])/2);
	    }
	    lastPose = pose;
	}
	// Calculate accelerations
	pass(function(pose) { pose.a = []; },
	     function(j, lastPose, pose, nextPose) {
		 pose.a.push(nextPose.v[j] - pose.v[j]);
	     }, 1);
	// Calculate intermediate positions
	//lastPose = poses[0];
	for (i=1; i<poses.length-1; i+=2) {
	    //intPose = poses[i];
	    pose = poses[i-1];
	    //intPose.x = [];
	    ix = [];
	    for (j=0; j<poseAngles; j++) {
		ix.push(pose.x[j] + pose.v[j]/2 + pose.a[j]/4);
		//intPose.x.push(ix);
	    }
	    poses[i].x = ix;
	    //lastPose = pose;
	}
	
    };
    
    JPRO.PosePat.prototype.toString = function() {
	return this.name + '(' + this.className + ')';
    };
})();
