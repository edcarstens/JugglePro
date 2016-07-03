/**
 * @author Ed Carstens
 */

/**
 * Each row of the MHN+ matrix corresponds to a repeatable
 * sequence (HierRptSeq) of control points. Given a row and
 * arrival (or catch) time, a destination control point can
 * be computed.
 *
 * @class ControlPointMapper
 * @constructor
 * @param cpSeqs {Array} list of (rows) cpSeq's
 */
JPRO.ID.ControlPointMapper = 0;
JPRO.ControlPointMapper = function(cpSeqs, name) {

    // Call superclass
    this.className = this.className || 'ControlPointMapper';
    JPRO.Base.call(this, name);

    this.cpSeqs = cpSeqs || [];

    // Calculate reverse lookup
    var i;
    var cpToRowHash = {};
    i = 0;
    this.cpSeqs.map(function(cpSeq) {
	cpSeq.getItem(cpSeq.period);
	cpSeq.lookAheadList.map(function(cp) {
	    cpToRowHash[cp.name] = i;
	});
	i++;
    });
    this.cpToRowHash = cpToRowHash;
};

JPRO.ControlPointMapper.prototype = Object.create(JPRO.Base.prototype);
JPRO.ControlPointMapper.prototype.constructor = JPRO.ControlPointMapper;

JPRO.ControlPointMapper.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {'cpSeqs':JPRO.Common.copyObjVector};
    return this.directedCopy(objHash, cFunc, pFuncs);
};

JPRO.ControlPointMapper.prototype.getControlPoint = function(row, beatRel) {
    var beatRel1 = beatRel || 0;
    var cpSeq = this.cpSeqs[row];
    if (cpSeq === undefined) {
	alert('error');
    }
    return cpSeq.getItem(beatRel1);
};

JPRO.ControlPointMapper.prototype.getBeatsFromLastThrow = function(row, beatRel) {
    var cpSeq = this.cpSeqs[row];
    var cp = cpSeq.getItem(beatRel);
    var i = beatRel - 1;
    while (i >= 0) {
	if (cp === cpSeq.getItem(i))
	    return (beatRel - i);
	i--;
    }
    return beatRel;
};

JPRO.ControlPointMapper.prototype.getBeatsToNextThrow = function(cp) {
    var row = this.cpToRow(cp);
    var cpSeq = this.cpSeqs[row];
    var rv = 0;
    var tmp = (cpSeq.period > 0) ? cpSeq.period : 9999;
    while (rv < tmp) {
	if (cp === cpSeq.getItem(rv++))
	    return rv;
	//rv++;
    }
    throw 'Error - ' + cp.name + ' not found in ' + cpSeq.name;
};

JPRO.ControlPointMapper.prototype.nextBeat = function() {
    this.cpSeqs.map(function(cpSeq) {
	cpSeq.nextItem();
    });
    return this;
};

JPRO.ControlPointMapper.prototype.cpToRow = function(cp) {
    return this.cpToRowHash[cp.name];
};

JPRO.ControlPointMapper.create = function(performance, sync) {
    var i, cpSeqs, lh, rh;
    var viewer = performance.viewer;
    var jugglers = performance.jugglers;
    cpSeqs = [];
    for (i=0; i<this.jugglers.length; i++) {
	var lh = new JPRO.ControlPoint(viewer, jugglers[i], 0);
	var rh = new JPRO.ControlPoint(viewer, jugglers[i], 1);
	if (sync) {
	    cpSeqs.push(JPRO.HierRptSeq.create([lh])); // sync
	    cpSeqs.push(JPRO.HierRptSeq.create([rh])); // sync
	}
	else {
	    cpSeqs.push(JPRO.HierRptSeq.create([lh, rh])); // async
	}
    }
    return new JPRO.ControlPointMapper(cpSeqs);
};
