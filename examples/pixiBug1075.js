// Pixi
// Issue #1075 (bug)
var stage = new PIXI.Stage(0);
// create a renderer instance
var renderer = PIXI.autoDetectRenderer(800, 600);
// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

var g = new PIXI.Graphics();
g.lineStyle(16, 0xffcc66, 1);
g.moveTo(50, 100);
g.lineTo(200, 400);
g.moveTo(200, 400);
g.lineTo(75, 100);
g.moveTo(75, 100);
g.lineTo(150, 200);
g.lineStyle(1, 0xff0000, 1);
g.moveTo(50, 100);
g.lineTo(200, 400);
g.moveTo(200, 400);
g.lineTo(75, 100);
g.moveTo(75, 100);
g.lineTo(150, 200);
g.setStageReference(stage);
stage.addChild(g);

// workaround?

// Start animation
requestAnimFrame( animate );

// Animate
function animate() {
    // render the stage
    renderer.render(stage);
}
