/**
 * @author Ed Carstens
 */

/**
 * Configuration for JugglePro Viewer
 *
 * @class Config
 * @constructor
 *
 */

JPRO.ID.Config = 0;
JPRO.Config = function(name) {
    // Call superclass
    this.className = this.className || 'Config';
    JPRO.Base.call(this, name);
};

JPRO.Config.prototype = Object.create(JPRO.Base.prototype);
JPRO.Config.prototype.constructor = JPRO.Config;

JPRO.Config.prototype.copy = function(objHash, cFunc) {
    var pFuncs = {};
    pFuncs.jugglers = JPRO.Common.copyObjVector;
    var scalars = [
	'dwellRatio', 'basePeriod',
	'minThrowTime', 'viewWidth', 'viewHeight', 'view',
	'viewAngle', 'zoomDistance', 'zoomIn', 'zoomOut'
    ];
    var objects = [
	'clock', 'gravity', 'view', 'aerialTurn', 'routine',
	'pattern'
    ];
    return this.directedCopy(objHash, cFunc, pFuncs, scalars, objects);
};

JPRO.Config.prototype.setDefaults = function() {
    /**
     * Pixi stage (background) color
     *
     * @property stageColor
     * @type {Color}
     */
    if (this.stageColor === undefined) { this.stageColor = 0x000000; }

    /**
     * Pixi stage
     *
     * @property stage
     * @type {PIXI.Stage}
     */
    // create a new instance of a pixi stage
    if (this.stage === undefined) {
	this.stage = new PIXI.Stage(this.stageColor);
    }

    /**
     * Graphics
     *
     * @property grfx
     * @type {PIXI.Graphics} 
     */
    if (this.grfx === undefined) {
	this.grfx = new PIXI.Graphics();
	this.grfx.setStageReference(this.stage);
	this.stage.addChild(this.grfx);
    }
    
    /**
     * Acceleration of gravity vector
     *
     * @property gravity
     * @type {Vec}
     */
    if (this.gravity === undefined) { this.gravity = new JPRO.Vec(0,0,-8); }

    /**
     * GUI (graphical user interface)
     *
     * @property gui
     * @type {Gui}
     */
    if (this.gui === undefined) { this.gui = new JPRO.Gui(this); }

    /**
     * View window width
     *
     * @property viewWidth
     * @type {Number}
     */
    if (this.viewWidth === undefined) { this.viewWidth = 800; }
    
    /**
     * View window height
     *
     * @property viewHeight
     * @type {Number}
     */
    if (this.viewHeight === undefined) { this.viewHeight = 600; }
    
    /**
     * View window
     *
     * @property view
     * @type {View}
     */
    if (this.view === undefined) { this.view = new JPRO.View(this); }

    if (this.viewAngle === undefined) { this.viewAngle = 0; }

    if (this.zoomDistance === undefined) { this.zoomDistance = 4500; }
    

    /**
     * Juggling routine
     *
     * @property routine
     * @type {Routine}
     */
    if (this.routine === undefined) {
	var J0L = new JPRO.ControlPoint(this, 'J0L');
	var J0R = new JPRO.ControlPoint(this, 'J0R');
	J0L.getPos = function(t, beat) {
	    var pa = this.jugglers[0].hands[0].hFunc.getPos(t, beat);
	    return pa[0];
	};
	J0R.getPos = function(t, beat) {
	    var pa = this.jugglers[0].hands[1].hFunc.getPos(t, beat);
	    return pa[0];
	};
	var cpSeq = JPRO.HierRptSeq.createSeq([J0L, J0R], -1);
	var cpMap = new JPRO.ControlPointMapper([cpSeq], 'cpMap');
	var pat = new JPRO.JugPattern(3, 1, cpMap, 'pat');
	this.routine = new JPRO.HierRptSeq([pat], -1, 1, 'topRoutine');
    }

};
