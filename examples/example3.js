// Example3
// This is an example of multiple jugglers.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();

// view
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-16);
viewer.view = new JPRO.View(viewer);
viewer.viewAngle = -60;
viewer.zoomDistance = 8000;
viewer.dwellRatio = 0.5;

// jugglers
var Abe = new JPRO.Juggler(viewer, 'Abe', null, new JPRO.Vec(360,0,100), -180);
var Bob = new JPRO.Juggler(viewer, 'Bob', null, new JPRO.Vec(-360,-200,100), 0);
var Cat = new JPRO.Juggler(viewer, 'Cat', null, new JPRO.Vec(-360,200,100), 0);
viewer.jugglers = [Abe, Bob, Cat];

// routine
var rhMap = new JPRO.RowHandMapper([[Abe.hands[0],Abe.hands[1]],
				    [Bob.hands[0],Bob.hands[1]],
				    [Cat.hands[0],Cat.hands[1]]]);
var mhn = [[ [[0,3]],[[1,3]],[[0,3]],[[2,3]] ],
	   [ [[1,3]],[[0,3]],[[1,3]],[[1,3]] ],
	   [ [[2,3]],[[2,3]],[[2,3]],[[0,3]] ]];
var pat = new JPRO.Pattern(mhn, rhMap, 1);
viewer.routine = new JPRO.Routine([pat]);

// Initialize viewer
viewer.setDefaults();
viewer.init();

// Start animation
requestAnimFrame( animate );

// Animate
function animate() {
    if (viewer.enable) {
	requestAnimFrame( animate );
	viewer.update();
    }
}
