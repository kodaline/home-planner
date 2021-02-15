/**
 * The detection of collision is implemented using a technique called OBB (Oriented Bounding Boxes) collision detection. 
 * The theorem behind is SAT-Separating axis theorem. For reference: https://en.wikipedia.org/wiki/Hyperplane_separation_theorem
**/

// check if there's a separating plane in between the selected axes
// box1, box2 are the bounding boxes build around the objects coords (the box is the smallest possible that can encapsulate the object)
// Plane is the one that is checked to exist or not between the boxes 
// Rpos is the difference in position between box1, and box2
function getSeparatingPlane(RPos, Plane, box1, box2)
{
    return (Math.abs(utils.dotVector(RPos, Plane)) > 
       (Math.abs(utils.dotVector(utils.scalarVector(box1.AxisX, box1.Half_size.x), Plane)) +
        Math.abs(utils.dotVector(utils.scalarVector(box1.AxisY, box1.Half_size.y), Plane)) +
        Math.abs(utils.dotVector(utils.scalarVector(box1.AxisZ, box1.Half_size.z), Plane)) +
        Math.abs(utils.dotVector(utils.scalarVector(box2.AxisX, box2.Half_size.x), Plane)) + 
        Math.abs(utils.dotVector(utils.scalarVector(box2.AxisY, box2.Half_size.y), Plane)) +
        Math.abs(utils.dotVector(utils.scalarVector(box2.AxisZ, box2.Half_size.z), Plane))));
}

// test for separating planes in all 15 axes
// 9+6 axes: 6 for box1 and box2 separately, and 9 because we compute the normal vector to all the possible intersections between box1 and box2 planes
function getCollision(box1, box2)
{
    var RPos;
    RPos = utils.subVector(box2.Pos, box1.Pos);

    return !(getSeparatingPlane(RPos, box1.AxisX, box1, box2) ||
        getSeparatingPlane(RPos, box1.AxisY, box1, box2) ||
        getSeparatingPlane(RPos, box1.AxisZ, box1, box2) ||
        getSeparatingPlane(RPos, box2.AxisX, box1, box2) ||
        getSeparatingPlane(RPos, box2.AxisY, box1, box2) ||
        getSeparatingPlane(RPos, box2.AxisZ, box1, box2) ||
        getSeparatingPlane(RPos,utils.crossVector(box1.AxisX, box2.AxisX), box1, box2) ||
        getSeparatingPlane(RPos,utils.crossVector(box1.AxisX, box2.AxisY), box1, box2) ||
        getSeparatingPlane(RPos,utils.crossVector(box1.AxisX, box2.AxisZ), box1, box2) ||
        getSeparatingPlane(RPos,utils.crossVector(box1.AxisY, box2.AxisX), box1, box2) ||
        getSeparatingPlane(RPos,utils.crossVector(box1.AxisY, box2.AxisY), box1, box2) ||
        getSeparatingPlane(RPos,utils.crossVector(box1.AxisY, box2.AxisZ), box1, box2) ||
        getSeparatingPlane(RPos,utils.crossVector(box1.AxisZ, box2.AxisX), box1, box2) ||
        getSeparatingPlane(RPos,utils.crossVector(box1.AxisZ, box2.AxisY), box1, box2) ||
        getSeparatingPlane(RPos,utils.crossVector(box1.AxisZ, box2.AxisZ), box1, box2));
}

// Check collision function
function checkCollision(objectId, objectB) {

        for (i=0; i < loadedObjects.length; i++) { 
            //rebuild object position/dimension for collision check
            //ObjectA is the variable that takes one at a time the objects loaded in the scene
            //origin of the object is fixed, all the time we update the position of the object by summing up all the transformation applied by the user.
            //ObjectB is the current moving object
			
            objectA = {
				AxisX: utils.makeAxisX(loadedObjects[i].currentRotation),
				AxisY: utils.makeAxisY(loadedObjects[i].currentRotation),
				AxisZ: utils.makeAxisZ(loadedObjects[i].currentRotation),
                u_id: loadedObjects[i].u_id,
                isRoom: loadedObjects[i].isRoom,
                Pos: [
                    loadedObjects[i].originX + loadedObjects[i].currentMoveX,
					loadedObjects[i].originY + loadedObjects[i].currentMoveY,
                	loadedObjects[i].originZ + loadedObjects[i].currentMoveZ,
                ],
                Half_size: {
                	x: 0.5 * loadedObjects[i].x * loadedObjects[i].currentScale,
                	y: 0.5 * loadedObjects[i].y * loadedObjects[i].currentScale,
                	z: 0.5 * loadedObjects[i].z * loadedObjects[i].currentScale,
				}
            }
            if (objectA.u_id != objectId && 
                !objectA.isRoom && getCollision(objectA, objectB))
				 return true;
        }
        return false;
}

