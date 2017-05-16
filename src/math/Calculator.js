/**
 * @author Ed Carstens
 */

/**
 * Calculator functions:
 *   - initial throw velocity
 *   - Halley's iteration
 *
 */

(function () {

'use strict';

/**
 * Modified Newton's Iteration (to find a root)
 *
*/
JPRO.Calculator.modNewtonsItr = function(f, x0, xmin) {
    var x, y, itr, err, nx, sxmin;
    err = 0.0000001;
    itr = 100;
    x = x0;
    y = f(x); // y[0]=f(x); y[1]=f(x)/df(x)
    while ((Math.abs(y[0]) > err) && (itr > 0)) {
	// Modification:
	// if abs(x) < xmin,
	// use binary search.
	nx = x - y[1];
	sxmin = (x > 0) ? xmin : -xmin;
	if ( ((x > 0) && (nx < sxmin)) ||
	     ((x < 0) && (nx > sxmin)) ) {
	    console.log('USING BINARY SEARCH');
	    x = (x + sxmin)/2;
	}
	else {
	    x = nx;
	}
	y = f(x);
	itr--;
    }
    return x;
};

/**
 * Halley's Iteration (to find a root)
 *
*/
JPRO.Calculator.halleys = function(f, x0) {
    var x, y, itr, err;
    err = 0.0000001;
    itr = 10;
    x = x0;
    y = f(x); // y[0]=f(x); y[1]=df(x); y[2]=ddf(x)
    while ((Math.abs(y[0]) > err) && (itr > 0)) {
	x = x - 2*y[0]*y[1]/(2*y[1]*y[1] - y[0]*y[2]);
	y = f(x); // y[0]=f(x); y[1]=df(x); y[2]=ddf(x)
	itr--;
    }
    return x;
};

/**
 * Calculate initial velocity for a specified path with bounces
 * (the z component only)
 *
 * @method calcInitVelWithBounces2
 * @param tf {number} the destination time (relative to throw time)
 * @param z0 {number} the throw position (initial position)
 * @param zf {number} the destination
 * @param g {number} acceleration of gravity (positive)
 * @param bounces {number} number of floor bounces in path
 * @param elasticity {number} 0<elasticity<1 such that vb=-vi*elasticity
 * @param forceThrow {number} 1 if throw is downward (v0 < 0), 0 otherwise
 * @param earlyCatch {number} 1 if catch is early (vf > 0), 0 otherwise
*/
JPRO.Calculator.calcInitVelWithBounces2 = function(tf, z0, zf, g, bounces, elasticity, forceThrow, earlyCatch) {
    var i, gamma, nextEla, ela2n, pe0x2, pefx2, energyMin, pe, ke, v0min;
    var f, v0, tmp;
    nextEla = 1;
    gamma = 1;
    for (i=0; i<bounces; i++) {
	nextEla = nextEla * elasticity;
	gamma += nextEla*2;
    }
    gamma -= nextEla;
    ela2n = nextEla * nextEla;
    pe0x2 = 2*g*z0;
    pefx2 = 2*g*zf;
    // calculate required total energy
    // (energy loss is from bounces)
    energyMin = g*zf/ela2n; // v0=vf=0
    pe = g*z0; // potential energy
    if (pe > energyMin) {
	energyMin = pe;
	ke = 0;
	v0min = 0;
    }
    else {
	// minimum required kinetic energy
	ke = energyMin - pe;
	// minimum required abs(v0)
	v0min = Math.sqrt(2*ke);
    }
    // total time interval is a function of v0
    f = function(v0) {
	var energy, tmp, vi, vi2, vi3, vf, vf2, vf3, f0, f1, f2;
	console.log('function f called with v0=' + v0);
	energy = v0*v0/2 + pe;
	if (energy < energyMin) {
	    console.log('v0=' + v0);
	    console.log('energyMin=' + energyMin);
	    console.log('energy=' + energy);
	    throw('energy fell below minimum required energy');
	}
	vi2 = v0*v0 + pe0x2;
	vi = Math.sqrt(vi2);
	vi3 = vi2 * vi; // vi cubed
	vf2 = vi*vi*ela2n - pefx2;
	vf = Math.sqrt(vf2);
	if (earlyCatch==0) vf = -vf;
	//console.log('vf=' + vf);
	vf3 = vf2 * vf; // vf cubed
	//console.log('tf=' + tf);
	//console.log('gamma=' + gamma);
	f0 = (gamma*vi + v0 - vf)/g - tf;
	//f1 = (gamma*v0/vi + 1 - v0*ela2n/vf)/g;
	//f2 = 2*gamma*z0/vi3 - 2*ela2n*(z0*ela2n - zf)/vf3;

	tmp = gamma*v0*vf + (vf - v0*ela2n)*vi; // tmp = df*g*vi*vf
	f1 = f0*g*vf*vi/tmp; // f1 = f/df
	// f2 = ddf/df = ddf*g*vi*vf/tmp
	//f2 = (gamma*z0*vf/vi2 - ela2n*vi*(z0*ela2n - zf)/vf2)*2*g/tmp;
	f2 = 0; // don't use f2 at all
	//f2 = (gamma*z0*vf3 - ela2n*vi3*(z0*ela2n - zf))/g/2;
	//f2 = f2/f1;
	//f1 = f0/f1;
	console.log('t=' + (f0+tf) + ' f0=' + f0 + ' f1=' + f1 + ' f2=' + f2);
	return [f0, f1];
    };
    // initial guess for v0
    v0 = v0min + 1;
    if (forceThrow) v0 = -v0;
    v0 = this.modNewtonsItr(f, v0, v0min);
    tmp = f(v0);
    console.log('tf=' + tf + ' tf_solution=' + (tmp[0]+tf));
    return v0;
}

/**
 * Solve cubic equation
 *
*/
JPRO.Calculator.solveCubic = function(a2, a1, a0) {
    var f, df, ddf, xip, d, d2, tmp1, tmp2, x0, x1, b0, b1, x2, x3;
    //var tst;
    //tst = Math.cbrt(2);
    //console.log('tst = ' + tst);
    f = function(x) {
	var x2, f0, f1, f2;
	x2 = x*x;
	f0 = x*x2 + a2*x2 + a1*x + a0;
	// first derivative of f(x)
	f1 = 3*x2 + 2*a2*x + a1;
	// 2nd derivative of f(x)
	f2 = 6*x + 2*a2;
	return [f0, f1, f2];
    };
    xip = -a2/3; // inflection point
    d = a2*a2 - 3*a1; // discriminant?
    console.log('d=' + d);
    d2 = Math.sqrt(d);
    tmp1 = 2*d2/3;
    tmp2 = f(xip);
    console.log('f(xip)=' + tmp2);
    if (tmp2 === 0) {
	return [xip, xip, xip];
    }
    if (d === 0) {
	tmp2 = xip - Math.cbrt(tmp2);
	return [tmp2, tmp2, tmp2];
    }
    if (d < 0) {
	x0 = xip;
    }
    else if (tmp2 > 0) {
	x0 = xip - tmp1;
    }
    else {
	x0 = xip + tmp1;
    }
    // Find first root using Halley's method
    x1 = this.halleys(f, x0);
    // Use deflation (divide polynomial to obtain quadratic)
    b1 = x1 + a2;
    b0 = x1*b1 + a1;
    d = b1*b1 - 4*b0;
    if (d > 0) {
	tmp1 = Math.sqrt(d);
	x2 = (-b1 + tmp1)/2;
	x3 = (-b1 - tmp1)/2;
	console.log('x2=' + x2);
	console.log('x3=' + x3);
    }
    else {
	x2 = x1;
	x3 = x1;
    }
    return [x1, x2, x3];
};    

/**
 * Calculate initial velocity for a specified path with bounces
 * (z component only)
 *
 * @method calcInitVelWithBounces
 * @param tf {number} the destination time (relative to throw time)
 * @param z0 {number} the throw position (initial position)
 * @param zf {number} the destination
 * @param g {number} acceleration of gravity (positive)
 * @param bounces {number} number of floor bounces in path
*/
JPRO.Calculator.calcInitVelWithBounces = function(tf, z0, zf, g, bounces, forceThrow, earlyCatch) {
    var elasticity, tmp1, tmp2, a2, tmp3, tmp4, a1, a0, soln, roots, rv;
    elasticity = 0.95; // the bounce reverses direction of the ball such that
                       // the new velocity is -elasticity * impactVelocity
    // calculate coefficients of cubic (A2, A1, and A0)
    tmp1 = 1 + elasticity;
    tmp2 = tf/tmp1;
    a2 = -(tmp1+1)*tmp2;
    tmp3 = 2*elasticity*z0;
    tmp4 = tmp1*g;
    a1 = (tmp3 + 2*zf)/tmp4 + tmp2*tf;
    a0 = -tmp3*tf/tmp4;

    // call cubic solver to find t1 (time of bounce)
    roots = this.solveCubic(a2, a1, a0);
    // calculate initial velocity of each roots
    // (z1=0 at the floor)
    soln = [0,0,0];
    soln[0] = {v0:(g*roots[0]/2 - z0/roots[0]), t1:roots[0]};
    soln[1] = {v0:(g*roots[1]/2 - z0/roots[1]), t1:roots[1]};
    soln[2] = {v0:(g*roots[2]/2 - z0/roots[2]), t1:roots[2]};
    soln.sort(function(a,b){return a.v0-b.v0}); // ascending order
    console.log('v0[0] = ' + soln[0].v0);
    console.log('v0[1] = ' + soln[1].v0);
    console.log('v0[2] = ' + soln[2].v0);
    if (forceThrow) {
	rv = soln[0].v0;
    }
    else {
	tmp4 = soln.shift(); // discard first solution
	soln[0].vf = -elasticity*soln[0].v0 + (elasticity + 1)*g*soln[0].t1 - g*tf;
	soln[1].vf = -elasticity*soln[1].v0 + (elasticity + 1)*g*soln[1].t1 - g*tf;
	soln[0].t2 = tf - soln[0].t1;
	soln[1].t2 = tf - soln[1].t1;
	soln.sort(function(a,b){return a.t2-b.t2});
	console.log('v0=' + soln[0].v0 + ' vf=' + soln[0].vf + ' t2=' + soln[0].t2);
	console.log('v0=' + soln[1].v0 + ' vf=' + soln[1].vf + ' t2=' + soln[1].t2);
	if (earlyCatch) {
	    rv = soln[0].v0;
	}
	else {
	    rv = soln[1].v0;
	}
    }
    return rv;
};

/**
 * Calculate initial velocity for a specified path
 *
 * @method calcInitVel
 * @param time {number} the destination time (relative to throw time)
 * @param pos {Vec} the throw position (initial position)
 * @param dest {Vec} the destination
 * @param g {number} acceleration of gravity (positive)
 * @param bounces {number} number of floor bounces in path
 * @param forceThrow {Boolean}
 * @param earlyCatch {Boolean}
 * @return {Vec} initial velocity
*/
JPRO.Calculator.calcInitVel = function(time, pos, dest, g, bounces,
				       forceThrow, earlyCatch) {
    var v0;
    v0 = new JPRO.Vec();
    v0.x = (dest.x-pos.x)/time;
    v0.y = (dest.y-pos.y)/time;
    if (bounces === 0) {
	v0.z = (dest.z-pos.z)/time - time*g/2;
    }
    else {
	v0.z = this.calcInitVelWithBounces2(time, pos.z, dest.z, g, bounces,
					    forceThrow, earlyCatch);
    }
    return v0;
};

})();
