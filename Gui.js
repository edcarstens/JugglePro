
function Gui(viewer) {
    // Members
    this.viewer = viewer;
    // Methods
    this.init = init;
    this.make_slider = make_slider;
    this.init_buttons = init_buttons;
}

function init() {
//    $(document).ready(function(){
    var v,p;
    v = this.viewer; if (!v) return;
    p = v.pattern; if (!p) return;
//    console.log('Gui: Pattern=' + p.to_string());
    $("#div1").html(p.to_html());
    var bpslider = this.make_slider('Beat Period', 'beat_period', viewer.beat_period, 5, 75, 1, 10, 70, 10);
    var dwslider = this.make_slider('Dwell Ratio', 'dwell_ratio', viewer.dwell_ratio*100, 0, 100, 1, 0, 100, 10);
    var vslider = this.make_slider('Test Variable', 'testvar', viewer.testvar, 0, 100, 1, 0, 100, 10);
    $("#div2").html(bpslider);
    $("#div3").html(dwslider + vslider);
    _update_dwell_ratio(viewer.dwell_ratio*100);
    this.init_buttons();
}

function make_slider(label, vname, val, min, max, step, start, end, tstep) {
    var i;
    var fader = vname + '_fader';
    var settings = vname + '_settings';
    var call = '\"_update_' + vname + '(value)\"';
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
}

function init_buttons() {
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
	viewer.rot_enable = null;
	$("#pause_rot").hide();
	$("#start_rot").show();
    });
    $("#start_rot").click(function(){
	viewer.rot_enable = 1;
	$("#start_rot").hide();
	$("#pause_rot").show();
    });
}

function _update_beat_period(val) {
    //console.log('update beat period = ' + val);
    viewer.pattern.beat_period = val;
    viewer.beat_period = val;
    $("#beat_period").html(val);
}

function _update_dwell_ratio(val) {
    //console.log('update dwell ratio = ' + val);
    viewer.dwell_ratio = val/100;
    lh.dwell_ratios = [viewer.dwell_ratio];
    rh.dwell_ratios = [viewer.dwell_ratio]; // TODO - update dwell ratios?
    $("#dwell_ratio").html(val + '%');
}

function _update_testvar(val) {
    viewer.testvar = val;
    viewer.view.translate_me(viewer.zoom_in);
    viewer.zoom_out.y = 100*val;
    viewer.zoom_in.y  = -100*val;
    viewer.view.translate_me(viewer.zoom_out);
    $("#testvar").html(viewer.zoom_out.y);
}
