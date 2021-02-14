// check if there's a separating plane in between the selected axes
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

