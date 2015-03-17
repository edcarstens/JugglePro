// Example3
// This is an example of multiple jugglers.

// Viewer Custom Configuration
var viewer = new JPRO.Viewer();

// view
viewer.viewWidth = 800;
viewer.viewHeight = 600;
viewer.gravity = new JPRO.Vec(0,0,-16);
viewer.view = new JPRO.View(viewer);
viewer.viewAngle = -50;
viewer.zoomDistance = 9000;
viewer.dwellRatio = 0.5;
viewer.basePeriod = 22;

// jugglers
// Set Abe.hands=0 at creation 
var Abe = new JPRO.Juggler(viewer, 'Abe', 0, new JPRO.Vec(360,0,100), -180);
// Abe's hand movement functions
var AbeLFunc = JPRO.Handfun.cascL(Abe);
var AbeRFunc = JPRO.Handfun.cascR(Abe);
AbeLFunc.name = 'AbeLFunc';
AbeRFunc.name = 'AbeRFunc';
// Abe's hands
var AbeL = new JPRO.Hand(viewer, Abe.name + '_LH', AbeLFunc, 0);
var AbeR = new JPRO.Hand(viewer, Abe.name + '_RH', AbeRFunc, 1);
Abe.hands = [AbeL, AbeR];

// Let Bob's hands default (to cascade)
var Bob = new JPRO.Juggler(viewer, 'Bob', null, new JPRO.Vec(-360,-150,100), 0);
Bob.hands[0].hFunc.name = 'BobLFunc';
Bob.hands[1].hFunc.name = 'BobRFunc';
var Cat = new JPRO.Juggler(viewer, 'Cat', null, new JPRO.Vec(-360,150,100), 0);
Cat.hands[0].hFunc.name = 'CatLFunc';
Cat.hands[1].hFunc.name = 'CatRFunc';
viewer.jugglers = [Abe, Bob, Cat];

// routine
var rhMap = new JPRO.RowHandMapper('rhm',
				   [[Abe.hands[0],Abe.hands[1]],
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
