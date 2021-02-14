// Event handlers

var Tx = 0.0, Ty = 0.0, Tz = 0.0;
var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
var mouseX;
var mouseY;
function doMouseDown(event) {
    lastMouseX = event.pageX;
    lastMouseY = event.pageY;
    mouseState = true;
}
function doMouseUp(event) {
    lastMouseX = -100;
    lastMouseY = -100;
    mouseState = false;
}

function doMouseMove(event) {
    if(mouseState) {
        var dx = event.pageX - lastMouseX;
        var dy = lastMouseY - event.pageY;
        lastMouseX = event.pageX;
        lastMouseY = event.pageY;

        if((dx != 0) || (dy != 0)) {
            angle = angle + deltaTime * 10 * dx;
            elevation = elevation + deltaTime * 10 * dy;
			if (elevation >= 0) {elevation = 0;}
			if (elevation <= -90) {elevation = -90;}
            console.log(elevation, angle);
        }
    }
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
}

function doMouseWheel(event) {
    var nLookRadius = lookRadius + event.wheelDelta/200.0;
	if (nLookRadius < 2.0) nLookRadius = 2.0;
	if (nLookRadius > 7.0) nLookRadius = 7.0;
        lookRadius = nLookRadius;
}

//this is used to select the desired furniture already in the scene
function doDoubleClick(event) {
    if (underMouseCursorID > 0) {
        loadedObjects.forEach(i => {
            if (i.u_id == underMouseCursorID) {
               if (i.isFurniture) {
               currentControlledObject = i; 
               playAudio(doubleClick);
               }
            }
        }); 
    }
}

//a sound to notice the user that the object that is double clicked is selected
var doubleClick = "/music/selection.wav";
function playAudio(url) {
  new Audio(url).play();
}

// these are used to recompute the new position of the object after applying a transformation
var movementAlongAxis = 1.0;
var uniformScale = 5.0;
var rotationAlongY = 100;

var currentControlledObject = null; //this var will take care of the current object that is selected by the user
var collisionDisabled = false;

function onKeyDown(event) {
    console.log(event.key);
    if (currentControlledObject && !currentControlledObject.isRoom) {

        //copy of the current state of the object
        var newPosition = {
            currentMoveX: currentControlledObject.currentMoveX,
            currentMoveY: currentControlledObject.currentMoveY,
            currentMoveZ: currentControlledObject.currentMoveZ,
            currentRotation: currentControlledObject.currentRotation,
            currentScale: currentControlledObject.currentScale,
        };

        //update of the current position based on key press
        if (event.key == 'q') {
            newPosition.currentRotation += rotationAlongY*deltaTime;
        } else if (event.key == 'e') {
            newPosition.currentRotation -= rotationAlongY*deltaTime;
        } else if (event.key == 'w') {
            console.log("elapsed", elapsed);
            newPosition.currentMoveZ -= movementAlongAxis*deltaTime;
        } else if (event.key == 's') {
            newPosition.currentMoveZ += movementAlongAxis*deltaTime;
        } else if (event.key == 'a') {
            newPosition.currentMoveX -= movementAlongAxis*deltaTime;
        } else if (event.key == 'd') {
            newPosition.currentMoveX += movementAlongAxis*deltaTime;
        } else if (event.key == 'z') {
            newPosition.currentScale += uniformScale*deltaTime;
        } else if (event.key == 'x') {
            newPosition.currentScale -= uniformScale*deltaTime;
        } else if (event.key == 'u') {
            newPosition.currentMoveY += movementAlongAxis*deltaTime;
        } else if (event.key == 'i') {
            newPosition.currentMoveY -= movementAlongAxis*deltaTime;
        } else if (event.key == 'Delete') {
            loadedObjects.splice(loadedObjects.indexOf(currentControlledObject), 1); //deleting the object from the scene
            currentControlledObject = null;
            //avoid checking collision if the object was deleted
            return;
        }
        //the object that is controlled, and need to check collision for it with all the other objects in the scene
        //to check collision, we need the 3 axis coordinates, the position in the space (origin), half_size to know how scaled is the object
        objectB = {
			AxisX: utils.makeAxisX(newPosition.currentRotation),
			AxisY: utils.makeAxisY(newPosition.currentRotation),
			AxisZ: utils.makeAxisZ(newPosition.currentRotation),
            Pos: [
                currentControlledObject.originX + newPosition.currentMoveX,
				currentControlledObject.originY + newPosition.currentMoveY,
            	currentControlledObject.originZ + newPosition.currentMoveZ,
            ],
            Half_size: {
            	x: 0.5 * currentControlledObject.x * newPosition.currentScale,
            	y: 0.5 * currentControlledObject.y * newPosition.currentScale,
            	z: 0.5 * currentControlledObject.z * newPosition.currentScale,
			}
        }
        if (!collisionDisabled) {
            if (!checkCollision(currentControlledObject.u_id, objectB)){
                //if the object does not collide with any, update currentControlledObject with new values
                Object.keys(newPosition).forEach(function(key) {
                    currentControlledObject[key] = newPosition[key];
                });
            }
        } else {
                //if collision is disabled, just update the values for the new object
                Object.keys(newPosition).forEach(function(key) {
                    currentControlledObject[key] = newPosition[key];
                });
        }
    }
}

