/**
 * @author Ed Carstens
 */

/**
 *
 *
 * @class Gui
 * @constructor
 * @param viewer {Viewer} the pattern viewer
 */

JPRO.Gui = function(viewer) {
    this.viewer = viewer;
};

JPRO.Gui.prototype.constructor = JPRO.Gui;

/**
 *
 *
 * @method 
*/
JPRO.Gui.prototype.init = function() {
    //$(document).ready(function(){
    var v,p;
    v = this.viewer; if (!v) return;
    p = v.pattern; if (!p) return;
    //console.log('Gui: Pattern=' + p.toString());
    $("#div1").html(p.toHtml());
    var bpslider = this.makeSlider('Beat Period', 'beatPeriod', viewer.beatPeriod, 5, 75, 1, 10, 70, 10);
    var dwslider = this.makeSlider('Dwell Ratio', 'dwellRatio', viewer.dwellRatio*100, 0, 100, 1, 0, 100, 10);
    var vslider = this.makeSlider('Test Variable', 'testVar', viewer.testVar, 0, 100, 1, 0, 100, 10);
    $("#div2").html(bpslider);
    $("#div3").html(dwslider + vslider);
    updateDwellRatio(viewer.dwellRatio*100);
    this.initButtons();
};

/**
 *
 *
 * @method 
*/
JPRO.Gui.prototype.makeSlider = function(label, vname, val, min, max, step, start, end, tstep) {
    var i;
    var fader = vname + '_fader';
    var settings = vname + '_settings';
    var call = '\"update' + vname + '(value)\"';
    var rv = "<label for=" + fader + ">" + label + "</label>";
    rv += "<input type=range min=" + min + " max=" + max + " value=" + val;
    rv += " id=" + fader + " step=" + step + " list=" + settings + " oninput=" + call + ">";
    rv += "<output for=" + fader + " id=" + vname + ">" + val + "</output>";
    rv += "<datalist id=" + settings + ">";
    for (i=start; i<=end; i+=tstep) {
	rv += "<option>" + i + "</option>";
    }
    rv += "</datalist>";
    //console.log(rv);
    return rv;
};


/**
 *
 *
 * @method initButtons
*/
JPRO.Gui.prototype.initButtons = function() {
    $("#start_button").hide();
    $("#pause_button").click(function(){
	viewer.enable = null;
	$("#pause_button").hide();
	$("#start_button").show();
    });
    $("#start_button").click(function(){
	viewer.enable = 1;
	requestAnimFrame( animate );
	$("#start_button").hide();
	$("#pause_button").show();
    });
    
    $("#pause_rot").hide();
    $("#pause_rot").click(function(){
	viewer.rotEnable = null;
	$("#pause_rot").hide();
	$("#start_rot").show();
    });
    $("#start_rot").click(function(){
	viewer.rotEnable = 1;
	$("#start_rot").hide();
	$("#pause_rot").show();
    });
};


/**
 *
 *
 * @method updateBeatPeriod
*/
JPRO.Gui.prototype.updateBeatPeriod = function(val) {
    //console.log('update beat period = ' + val);
    viewer.pattern.beatPeriod = val;
    viewer.beatPeriod = val;
    $("#beatPeriod").html(val);
};


/**
 *
 *
 * @method updateDwellRatio
*/
JPRO.Gui.prototype.updateDwellRatio = function(val) {
    //console.log('update dwell ratio = ' + val);
    viewer.dwellRatio = val/100;
    lh.dwellRatios = [viewer.dwellRatio];
    rh.dwellRatios = [viewer.dwellRatio]; // TODO - update dwell ratios?
    $("#dwellRatio").html(val + '%');
};

/**
 *
 *
 * @method updateTestVar
*/
JPRO.Gui.prototype.updateTestVar = function(val) {
    viewer.testVar = val;
    viewer.view.translateMe(viewer.zoomIn);
    viewer.zoomOut.y = 100*val;
    viewer.zoomIn.y  = -100*val;
    viewer.view.translateMe(viewer.zoomOut);
    $("#testVar").html(viewer.zoomOut.y);
};
