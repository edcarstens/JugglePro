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

JPRO.Config = function() {
};

JPRO.Config.prototype.constructor = JPRO.Config;

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
    this.grfx = new PIXI.Graphics();
    this.grfx.setStageReference(this.stage);
    this.stage.addChild(this.grfx);
    
    /**
     * Dwell ratio
     *
     * @property dwellRatio
     * @type {Number}
     */
    if (this.dwellRatio === undefined) { this.dwellRatio = 0.5; }

    /**
     * Base period for beat scheduler
     *
     * @property basePeriod
     * @type {Number}
     */
    if (this.basePeriod === undefined) { this.basePeriod = 40; }

    /**
     * Clock provides timing of throws
     *
     * @property clock
     * @type {Clock}
     */
    if (this.clock === undefined) {
	this.clock = new JPRO.Clock(this.basePeriod);
    }
    else {
	this.basePeriod = this.clock.basePeriod;
    }
    this.minThrowTime = (this.clock.basePeriod >> 1) + 1; // 1/2 beat period

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
    
    if (this.jugglers === undefined) {
	this.jugglers = [new JPRO.Juggler(this, 'Zeke')];
    }

    /**
     * Juggling routine
     *
     * @property routine
     * @type {Routine}
     */
    if (this.routine === undefined) {
	var rhMap = new JPRO.RowHandMapper('rhm',
					   [[this.jugglers[0].hands[0], this.jugglers[0].hands[1]]],
					   [[2,2]]);
	//console.log('rhMap=' + rhMap);
	//console.log('rhMap.tpm=' + rhMap.tpm[0][0]);
	//console.log('rhMap.entryTpm=' + rhMap.entryTpm[0][1]);
	var pat = new JPRO.Pattern([[ [[0,3]] ]], rhMap, 1);
	this.routine = new JPRO.Routine([pat]);
    }

};
