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
    if (this.basePeriod === undefined) { this.basePeriod = 30; }

    /**
     * Clock provides timing of throws
     *
     * @property clock
     * @type {Clock}
     */
    if (this.clock === undefined) {
	this.clock = new JPRO.Clock(this.basePeriod);
    }
    this.minThrowTime = (this.clock.basePeriod >> 1) + 1; // 1/2 beat period

    /**
     * Acceleration of gravity vector
     *
     * @property gravity
     * @type {Vec}
     */
    if (this.gravity === undefined) { this.gravity = new JPRO.Vec(0,0,-4); }

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
    if (this.view === undefined) { this.view = new JPRO.View(this, this.viewWidth, this.viewHeight); }

    // TODO - need to use Juggler and have list of jugglers
    //if (this.jugglers === undefined) {
//	this.jugglers = [new JPRO.Juggler(this)];
  //  }
    
    /**
     * Juggling routine
     *
     * @property routine
     * @type {Routine}
     */
    if (this.routine === undefined) {
	var LeftHand = JPRO.Handfun.cascL(new JPRO.Vec(0,200,100), -90);
	var RightHand = JPRO.Handfun.cascR(new JPRO.Vec(0,200,100), -90);
	var lh = new JPRO.Hand(this, LeftHand, 'LH', 0, this.dwellRatio);
	var rh = new JPRO.Hand(this, RightHand, 'RH', 1, this.dwellRatio);
	this.hands = [lh,rh]; // TODO - need Juggler, jugglers list, ea juggler has hands
	var rhMap = new JPRO.RowHandMapper([[lh,rh]]);
	var pat = new JPRO.Pattern([[ [[0,3]] ]], rhMap, 1);
	//pat.beatPeriod = 30; // TODO
	this.routine = new JPRO.Routine([pat]);
    }

};
