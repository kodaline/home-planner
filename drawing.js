var canvas, checkbox;
var gl = null;

var base_url = window.location.origin;
var host = window.location.host;
var pathArray = window.location.pathname.split( '/' );

// Variables for the directories of models and shaders
baseDir = window.location.origin;
modelsDir = baseDir + "/models/";
shaderDir = baseDir + "/shaders/";

// Two handles, one for each shaders' couple. 0 = goureaud; 1 = phong
var shaderProgram = new Array(2); 

//Parameters for Camera
var cx = 0.0;
var cy = 0.0;
var cz = 0.0;
var elevation = -35.0;
var angle = -35.0;
var vao;
var roomTexCoords = null;
var perspectiveMatrix = null;
var viewMatrix = null;
var lookRadius = 10.0;
var currentShader = 0;
var uvBufferRoom = new Array();
var vertexNormalHandle = new Array(2);
var vertexPositionHandle = new Array(2);
var vertexUVHandle = new Array(2);
var textureFileHandle = new Array(2);
var textureInfluenceHandle = new Array(2);
var translation = new Array(2);
var ambLightInfluenceSkybox = new Array(2);
var ambLightColorSkybox = new Array(2);
var ambientLightInfluenceHandle = new Array(2);
var ambientLightColorHandle = new Array(2);
var matrixPositionHandle = new Array(2);
var materialDiffColorHandle = new Array(2);
var lightDirectionHandle = new Array(2);
var lightPositionHandle = new Array(2);
var lightColorHandle  = new Array(2);
var lightTypeHandle = new Array(2);
var eyePositionHandle = new Array(2);
var materialSpecColorHandle = new Array(2);
var materialSpecPowerHandle  = new Array(2);
var sceneObjects;
var roomVertices;
var roomIndices;

var nearPlane = 0.1;
var farPlane = 100;
var underMouseCursorID = 0;
var id = 0;
var currentLightType = 1;
var currentShader = 0;                //Defines the current shader in use.
var textureInfluence = 1.0;
var ambientLightInfluence = 0.1;
var ambientLightColor = [1.0, 1.0, 1.0, 1.0];

//Parameters for light definition (directional light)
var dirLightAlpha = -utils.degToRad(60);
var dirLightBeta  = -utils.degToRad(120);

// for fps limit
var fps = 30;
var fpsInterval, startTime, now, then, elapsed;
var frame = 0;
var one_second = Date.now();
var display_fps = 0;
var fps_html_target;
var fps_html_current;

var uidHandle;
var translationHandlePicker;
var rotationMatrixPicker;
var matrixHandle;
var positionHandle;
var fb;
var attachmentPoint;

// Variables for object types
var room = 'room';
var solid = 'solid';
var furniture = 'furniture';
var bedroom = 'bedroom';
var childroom = 'childroom';
var living_room = "living room";
var kitchen = 'kitchen';
var office = 'office';
var decor = 'decor';
var tool = 'tool';
var roomLoaded = false;
var rotationMatrix = utils.MakeRotateYMatrix(0);
var rotationMatrixHandle = new Array();
var loadedObjects = new Array();

// The set of objects of the project, with their type and location
var objectsList = {
	'Pianta rettangolare': {location: 'empty_room/room_rect.json', type: room}, 
	'Pianta quadrata': {location: 'empty_room/square_room.json', type: room}, 
    'Pianta a L': {location: 'empty_room/room_elle.json', type: room}, 
    'Bed': {location: 'bed/bed.json', type: furniture, place: bedroom},
    'Wardrobe': {location: 'wardrobe/wardrobe.json', type: furniture, place: bedroom},
    'Sideboard': {location: 'sideboard/sideboard.json', type: furniture, place: bedroom},
    'Child bed': {location: 'child_bed/child-bed.json', type: furniture, place: childroom},
    'Baby bed': {location: 'baby_bed/baby-bed.json', type: furniture, place: childroom},
    'Changing table': {location: 'changing_table/changing-table.json', type: furniture, place: childroom},
    'Child desk': {location: 'child_desk/child-desk.json', type: furniture, place: childroom},
    'Child desk 2': {location: 'child_desk_second/child-desk-second.json', type: furniture, place: childroom},
    'Toy xylophone': {location: 'xylophone/xylophone.json', type: furniture, place: childroom},
    'Toy train': {location: 'toy_train/toy-train.json', type: furniture, place: childroom},
    'Toy letter cubes': {location: 'letter_cubes/letter-cubes.json', type: furniture, place: childroom},
    'Shelf double': {location: 'shelf/shelf.json', type: furniture, place: childroom},
    'Shelf type1': {location: 'shelf3/shelf3.json', type: furniture, place: childroom},
    'Shelf type2': {location: 'shelf2/shelf2.json', type: furniture, place: childroom},
    'Coffee table': {location: 'coffee_table/coffee-table.json', type: furniture, place: living_room},
    'Coffee table2': {location: 'coffee_table2/coffee-table2.json', type: furniture, place: living_room},
    'Side table': {location: 'side_table/side-table.json', type: furniture, place: living_room},
    'Table lamp': {location: 'table_lamp/table-lamp.json', type: furniture, place: living_room},
    'Sofa': {location: 'sofa/sofa.json', type: furniture, place: living_room},
    'Sofa2': {location: 'sofa2/sofa2.json', type: furniture, place: living_room},
    'Armchair': {location: 'relax_chair/relax-chair.json', type: furniture, place: living_room},
    'Relax sofa': {location: 'relax_sofa/relax-sofa.json', type: furniture, place: living_room},
    'TV stand': {location: 'tv_stand/stand-tv.json', type: furniture, place: living_room},
    'TV': {location: 'tv/tv.json', type: furniture, place: living_room},
    'Wash basin': {location: 'wash_basin/wash-basin.json', type: furniture, place: kitchen},
    'Dining set': {location: 'dining_set/dining-set.json', type: furniture, place: kitchen},
    'Dining table': {location: 'dining_table/table-dining.json', type: furniture, place: kitchen},
    'Modern chair': {location: 'modern_chair/modern-chair.json', type: furniture, place: kitchen},
    'Dresser': {location: 'dresser/dresser.json', type: furniture, place: kitchen},
    'Fridge': {location: 'fridge/fridge.json', type: furniture, place: kitchen},
    'Lower cabinet': {location: 'lower_cabinet/lower-cabinet.json', type: furniture, place: kitchen},
    'Cooker': {location: 'cooker/cooker.json', type: furniture, place: kitchen},
    'Vent': {location: 'vent/vent.json', type: furniture, place: kitchen},
    'Coffee machine': {location: 'coffee_machine/coffee-machine.json', type: furniture, place: kitchen},
    'Coffee chair': {location: 'coffee_chair/coffee-chair.json', type: furniture, place: kitchen},
    'High coffee table': {location: 'high_coffee_table/high-co-table.json', type: furniture, place: kitchen},
    'Tea set': {location: 'tea_set/tea-set.json', type: furniture, place: kitchen},
    'Bar stool': {location: 'bar_stool/bar-stool.json', type: furniture, place: kitchen},
    'Isle cabinet': {location: 'isle/isle.json', type: furniture, place: kitchen},
    'Picture': {location: 'picture/picture.json', type: furniture, place: decor},
    'Car model': {location: 'car_decor/car-decor.json', type: furniture, place: decor},
    'Office set': {location: 'office_set/office-set.json', type: furniture, place: office},
    'Bookcase': {location: 'bookcase/bookcase.json', type: furniture, place: office},
    'Bookcase empty': {location: 'bookcase_empty/bookcase-empty.json', type: furniture, place: office},
    'PC': {location: 'pc/pc.json', type: furniture, place:office},
    'iMac pc': {location: 'imac_pc/pc-imac.json', type: furniture, place:office},
    'Angled desk': {location: 'angled_desk/angled-desk.json', type: furniture, place:office},
    'Ikea desk-bookcase': {location: 'ikeabookcase_desk/ikea-bookcase-desk.json', type: furniture, place:office},
    'Office chair': {location: 'office_chair/office-chair.json', type: furniture, place:office},
    'Notebook set': {location: 'notebook_set/notebook-set.json', type: furniture, place:office},

    'Wall': {location: 'wall/wall.json', type: furniture, place: tool},
    'Plane': {location: 'plane/new_grid.json', type: solid, currentMoveY: -0.1},
};

var submenuVisibility = null; 

//Use the Utils 0.2 to use mat3
var lightDirection = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
                      Math.sin(dirLightAlpha),
                      Math.cos(dirLightAlpha) * Math.sin(dirLightBeta),
                      ];
var targetTexture;
var depthBuffer;
var matrixPositionHandle = new Array(2);
var materialDiffColorHandle = new Array(2);
var lightDirectionHandle = new Array(2);
var lightPositionHandle = new Array(2);
var lightColorHandle  = new Array(2);
var lightTypeHandle = new Array(2);
var eyePositionHandle = new Array(2);
var materialSpecColorHandle = new Array(2);
var materialSpecPowerHandle  = new Array(2);
var objectSpecularPower = 20.0;

var lightPosition = [0.0, 3.0, 0.0];
var lightColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
var moveLight = 0; //0 : move the camera - 1 : Move the lights

var currentControlledObject = null;

// event handler
var Tx = 0.0, Ty = 0.0, Tz = 0.0;
var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
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

var mouseX;
var mouseY;
var collisionDisabled = false;
function doMouseMove(event) {
    if(mouseState) {
        var dx = event.pageX - lastMouseX;
        var dy = lastMouseY - event.pageY;
        lastMouseX = event.pageX;
        lastMouseY = event.pageY;

        if((dx != 0) || (dy != 0)) {
            angle = angle + 0.5 * dx;
            elevation = elevation + 0.5 * dy;
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

var doubleClick = "/music/selection.wav";
function playAudio(url) {
  new Audio(url).play();
}

var movementAlongAxis = 0.05;
var uniformScale = 0.1;
var rotationAlongY = 15;

function onKeyDown(event) {
    console.log(event.key);
    if (currentControlledObject && !currentControlledObject.isRoom) {

        //get diffs from current controlled (clicked) object
        var newPosition = {
            currentMoveX: currentControlledObject.currentMoveX,
            currentMoveY: currentControlledObject.currentMoveY,
            currentMoveZ: currentControlledObject.currentMoveZ,
            currentRotation: currentControlledObject.currentRotation,
            currentScale: currentControlledObject.currentScale,
        };

        //update diffs
        if (event.key == 'q') {
            newPosition.currentRotation += rotationAlongY;
        } else if (event.key == 'e') {
            newPosition.currentRotation -= rotationAlongY;
        } else if (event.key == 'w') {
            newPosition.currentMoveZ -= movementAlongAxis;
        } else if (event.key == 's') {
            newPosition.currentMoveZ += movementAlongAxis;
        } else if (event.key == 'a') {
            newPosition.currentMoveX -= movementAlongAxis;
        } else if (event.key == 'd') {
            newPosition.currentMoveX += movementAlongAxis;
        } else if (event.key == 'z') {
            newPosition.currentScale += uniformScale;
        } else if (event.key == 'x') {
            newPosition.currentScale -= uniformScale;
        } else if (event.key == 'u') {
            newPosition.currentMoveY += movementAlongAxis;
        } else if (event.key == 'i') {
            newPosition.currentMoveY -= movementAlongAxis;
        } else if (event.key == 'Delete') {
                debugger;
            loadedObjects.splice(loadedObjects.indexOf(currentControlledObject), 1);
            currentControlledObject = null;
            //avoid checking collision if deleted
            return;
        }

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
                //update currentControlledObject with new values
                Object.keys(newPosition).forEach(function(key) {
                    currentControlledObject[key] = newPosition[key];
                });
            }
        } else {

                Object.keys(newPosition).forEach(function(key) {
                    currentControlledObject[key] = newPosition[key];
                });
        }
    }
}

function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}

var lastDownTarget;

// Here the Main function begins
function main(){
    // Setup the webGL context
	canvas = document.getElementById("my-canvas");
    checkbox = document.getElementById("chbx");
    // Adding the event listeners
	canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    canvas.addEventListener("mousewheel", doMouseWheel, false);
    canvas.addEventListener("dblclick", doDoubleClick, false);
    document.addEventListener('keydown',onKeyDown,false);

    
    fps_html_target = document.getElementById("fps");
    fps_html_current = document.getElementById("display_fps");

    try{
    //This will make any GL errors show up in your browser JavaScript console.
    gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl2"));
    gl = canvas.getContext("webgl2");

    } catch(e){
        console.log(e);
    }

    if(gl){
        // Get the gl canvas
        utils.resizeCanvasToDisplaySize(gl.canvas);
		console.log(gl.canvas.width, gl.canvas.height);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.85, 0.85, 0.85, 1.0); 
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
		loadShaders();
		fpsInterval = 1000 / fps;
		then = Date.now();
		startTime = then;
		one_second = Date.now();
        fps_html_target.innerHTML = (fps).toFixed(1);
        //cubeMap();
        loadModel('Plane');
     	drawScene();
    }

    else{
            alert("Error: WebGL not supported by your browser!");
        }
}

  function setFramebufferAttachmentSizes(width, height) {
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border,
                  format, type, data);

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  }

// Here the function that loads models
function loadModel(modelName) {

        if (!modelName) return false;

        var objectCharacteristics = objectsList[modelName];
        if (!objectCharacteristics) return false; 
        var objectWorldMatrix = new Array();
        var projectionMatrix= new Array();
        var diffuseColor    = new Array();  //diffuse material colors of objs
        var facesNumber     = new Array();
        var specularColor   = new Array();
        var diffuseTextureObj   = new Array();  //Texture material
        var nTexture        = new Array();  //Number of textures per object

        // Eye parameters;
        // We need now 4 eye vector, one for each cube
        // As well as 4 light direction vectors for the same reason
        var observerPositionObj = new Array();
        var lightDirectionObj = new Array();
        var lightPositionObj = new Array();
        var vertexBufferObjectId= new Array();
        var indexBufferObjectId = new Array();

        utils.get_json(modelsDir + objectCharacteristics.location, function(loadedModel){roomModel = loadedModel;});
        if (objectCharacteristics.type == room) {
                if (roomLoaded) {
                    alert('Room already loaded, refresh the page to change room type.');
                    return;
                }
                else { 
                    roomLoaded = true;
                }
        }
        sceneObjects = roomModel.meshes.length; 
		console.log(sceneObjects);
        perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, nearPlane, farPlane);
        viewMatrix = utils.MakeView(1.5, 1.9, 3.0, 10.0, 30.0);
        vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        id = id + 1;
        for(i=0; i < sceneObjects; i++){ 
            objectWorldMatrix[i] = new utils.identityMatrix();
            projectionMatrix[i] =  new utils.identityMatrix();
            diffuseColor[i] = [1.0, 1.0, 1.0, 1.0];
            specularColor[i] = [1.0, 1.0, 1.0, 1.0];
            observerPositionObj[i] = new Array(3);
            lightDirectionObj[i] = new Array(3);
            lightPositionObj[i] = new Array(3);
        }     
        var minVertX = 1110;
        var maxVertX = -111110;
        var minVertY = 1110;
        var maxVertY = -111110;
        var minVertZ = 1110;
        var maxVertZ = -11110;

        for (i=0; i < sceneObjects ; i++) {        
            //roomVertices = roomModel.meshes[i].vertices;
		    //roomTexCoords = roomModel.meshes[i].texturecoords[i];	
            //roomIndices = [].concat.apply([], roomModel.meshes[i].faces);
            //console.log("Room Indices:" + roomIndices);

			//Creating the vertex data.
            
            console.log("Object["+i+"]:");
            console.log("MeshName: "+ roomModel.rootnode.children[i].name);
            console.log("Vertices: "+ roomModel.meshes[i].vertices.length);
            console.log("Normals: "+ roomModel.meshes[i].normals.length);
            if (roomModel.meshes[i].texturecoords){
                console.log("UVss: " + roomModel.meshes[i].texturecoords[0].length);
            } else {
                console.log("No UVs for this mesh!" );
            }

            //creating the objects' world matrix
            objectWorldMatrix[i] = roomModel.rootnode.children[i].transformation;      
            var meshMatIndex = roomModel.meshes[i].materialindex;
            var UVFileNamePropertyIndex = -1;
            var diffuseColorPropertyIndex = -1;
            var specularColorPropertyIndex = -1;
            for (n = 0; n < roomModel.materials[meshMatIndex].properties.length; n++){
                if(roomModel.materials[meshMatIndex].properties[n].key == "$tex.file") UVFileNamePropertyIndex = n;
                if(roomModel.materials[meshMatIndex].properties[n].key == "$clr.diffuse") diffuseColorPropertyIndex = n;
                if(roomModel.materials[meshMatIndex].properties[n].key == "$clr.specular") specularColorPropertyIndex = n;
            }

			//*** Getting vertex and normals                    
            var objVertex = [];
            for (n = 0; n < roomModel.meshes[i].vertices.length/3; n++){
                var x = roomModel.meshes[i].vertices[n*3];
                var y = roomModel.meshes[i].vertices[n*3+1];
                var z = roomModel.meshes[i].vertices[n*3+2];
                objVertex.push(x, y, z);

                if (x < minVertX)
                    minVertX = x;
                if (x > maxVertX)
                    maxVertX = x;

                if (y < minVertY)
                    minVertY = y;
                if (y > maxVertY)
                    maxVertY = y;

                if (z < minVertZ)
                    minVertZ = z;
                if (z > maxVertZ)
                    maxVertZ = z;

                if (objectCharacteristics.type == solid) {
                        objVertex.push(0.0, 0.0, 0.0, 0.0, 0.0)
                } else {
                    objVertex.push(roomModel.meshes[i].normals[n*3],
                                   roomModel.meshes[i].normals[n*3+1],
                                   roomModel.meshes[i].normals[n*3+2]);
                    if(UVFileNamePropertyIndex>=0 && roomModel.meshes[i].texturecoords){
                        objVertex.push( roomModel.meshes[i].texturecoords[0][n*2],
                                        1.0 - roomModel.meshes[i].texturecoords[0][n*2+1]);

                    } else {
                        objVertex.push( 0.0, 0.0);
                    }
                }   
            }

            facesNumber[i] = roomModel.meshes[i].faces.length; 
            console.log("Face Number: "+facesNumber[i]);

			if(UVFileNamePropertyIndex>=0){
                nTexture[i]=true;
                console.log(roomModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value);
                imageName = roomModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value;
                imageName = objectCharacteristics.location.split('/')[0] + '/' + imageName;

		        var getTexture = function(image_URL){                                                                                                               var image=new Image();          
                    image["webGLTexture"] = false;   
                    requestCORSIfNotSameOrigin(image, image_URL);                                                                                                           

                    image.onload=function(e) {                                                                                                                          
                        var texture=gl.createTexture();                                                                                                                 
                        gl.bindTexture(gl.TEXTURE_2D, texture);                                                                                                         
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);                                                                              
                        gl.generateMipmap(gl.TEXTURE_2D);                                                                                                               
                        gl.bindTexture(gl.TEXTURE_2D, null);
                        image["webGLTexture"] = texture; 
                   };
                    
                   image.src=image_URL;

                   return image;                   
                   };
			diffuseTextureObj[i] = getTexture(modelsDir + imageName);
        	} else {
                        nTexture[i] = false;
            }
			//*** mesh color
            diffuseColor[i] = roomModel.materials[meshMatIndex].properties[diffuseColorPropertyIndex].value; // diffuse value

            diffuseColor[i].push(1.0);                                                  // Alpha value added

            specularColor[i] = roomModel.materials[meshMatIndex].properties[specularColorPropertyIndex].value;
            console.log("Specular: "+ specularColor[i]);
            //vertices, normals and UV set 1
            vertexBufferObjectId[i] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectId[i]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objVertex), gl.STATIC_DRAW);

			//Creating index buffer
            facesData = [];
            for (n = 0; n < roomModel.meshes[i].faces.length; n++){

                facesData.push( roomModel.meshes[i].faces[n][0],
                                roomModel.meshes[i].faces[n][1],
                                roomModel.meshes[i].faces[n][2]
                                );
            }
            indexBufferObjectId[i]=gl.createBuffer ();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectId[i]);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(facesData),gl.STATIC_DRAW);

        } 

        loadedObjects.push({
            u_id: id,
            isRoom: objectCharacteristics.type == room,
            isFurniture: objectCharacteristics.type == furniture,
            isSolid: objectCharacteristics.type == solid,
            sceneObjects: sceneObjects,
            objectWorldMatrix: objectWorldMatrix,
            projectionMatrix: projectionMatrix,
            diffuseColor: diffuseColor,
            facesNumber: facesNumber,
            specularColor: specularColor,
            diffuseTextureObj: diffuseTextureObj,
            nTexture: nTexture,
            observerPositionObj: observerPositionObj,
            lightDirectionObj: lightDirectionObj,
            lightPositionObj: lightPositionObj,
            vertexBufferObjectId: vertexBufferObjectId,
            indexBufferObjectId: indexBufferObjectId,
            currentRotation: 0,
            currentScale: 1,
            currentMoveZ: 0,
            currentMoveY: 'currentMoveY' in objectCharacteristics ? objectCharacteristics.currentMoveY : (objectCharacteristics.type == room ? -minVertY : -minVertY),
            currentMoveX: 0,
            x: maxVertX - minVertX,
            y: maxVertY - minVertY,
            z: maxVertZ - minVertZ,
            originX: (maxVertX + minVertX)/2.0,
            originY: (maxVertY + minVertY)/2.0,
            originZ: (maxVertZ + minVertZ)/2.0,
        });

        return true;
}

// This is the function that draws the scene
	function drawScene() {
		now = Date.now();
    	elapsed = now - then;
		if ((now - one_second) > 1000) {
			display_fps = frame/(now - one_second);
            fps_html_current.innerHTML = (display_fps * 1000).toFixed(1);
			frame = 0;
			one_second = Date.now();
}	
    	// if enough time has elapsed, draw the next frame

    	if (elapsed > fpsInterval) {

            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
            then = now - (elapsed % fpsInterval);

            // drawing code here
        
		frame ++;	
        if (loadedObjects.length) {
		    utils.resizeCanvasToDisplaySize(gl.canvas);
		    cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    	    cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    	    cy = lookRadius * Math.sin(utils.degToRad(-elevation));
		    eyeTemp = [cx, cy, cz];

            // ------ Draw the objects to the texture --------

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
            drawObjects(2);
        
            // ------ Figure out what pixel is under the mouse and read it
        
            const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
            const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
            const data = new Uint8Array(4);
            gl.readPixels(
                pixelX,            // x
                pixelY,            // y
                1,                 // width
                1,                 // height
                gl.RGBA,           // format
                gl.UNSIGNED_BYTE,  // type
                data);             // typed array to hold result
                underMouseCursorID = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
            //console.log("reading pixel " + pixelX + " " + pixelY + " yields" + data);
        
            // ------ Draw the objects to the canvas
        
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			//drawSkyBox();
            drawObjects(currentShader);

        }
}

function drawObjects(shaderProgramNumber) {
        
        shader = shaderProgram[shaderProgramNumber];
        gl.useProgram(shader);

        loadedObjects.forEach((todraw) => {
            viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);

            
            //Used to scale the object with "z-x"
            if (todraw.currentScale != 1) {
                viewMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeTranslateMatrix(todraw.originX + todraw.currentMoveX, todraw.originY + todraw.currentMoveY, todraw.originZ + todraw.currentMoveZ));
                viewMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeScaleMatrix(todraw.currentScale));
                viewMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeTranslateMatrix(-todraw.originX - todraw.currentMoveX, -todraw.originY - todraw.currentMoveY, -todraw.originZ - todraw.currentMoveZ));
            }
            //Used to rotate object around its center using "q-e"
            if (todraw.currentRotation){
                    debugger;
                viewMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeTranslateMatrix(todraw.originX + todraw.currentMoveX, 0, todraw.originZ + todraw.currentMoveZ));
                viewMatrix = utils.multiplyMatrices(viewMatrix, (utils.MakeRotateYMatrix(todraw.currentRotation)));
                viewMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeTranslateMatrix( -todraw.originX - todraw.currentMoveX, 0, -todraw.originZ - todraw.currentMoveZ));
            }
            //Used to move object using "w-a-s-d-u-i" 
            viewMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeTranslateMatrix(todraw.currentMoveX, todraw.currentMoveY, todraw.currentMoveZ));

		    projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);

            for(i=0; i < todraw.sceneObjects; i++){
                if (shaderProgramNumber == 0) {
                    
                    if (!todraw.isRoom) {
        	            gl.uniformMatrix4fv(rotationMatrixHandle[currentShader], gl.FALSE, rotationMatrix);
        	            gl.uniformMatrix4fv(translation[currentShader], gl.FALSE, utils.MakeTranslateMatrix(Tx, Ty, Tz));
                    } else {
        	            gl.uniformMatrix4fv(rotationMatrixHandle[currentShader], gl.FALSE, utils.identityMatrix());
        	            gl.uniformMatrix4fv(translation[currentShader], gl.FALSE, utils.MakeTranslateMatrix(0.0, 0.0, 0.0));

                    }

                    gl.uniformMatrix4fv(matrixPositionHandle[currentShader], gl.FALSE, utils.transposeMatrix(projectionMatrix));
    			    todraw.lightDirectionObj[i] = utils.multiplyMatrix3Vector3(utils.transposeMatrix3(utils.sub3x3from4x4(todraw.objectWorldMatrix[i])), lightDirection);
    
            	    todraw.lightPositionObj[i] = utils.multiplyMatrix3Vector3(utils.invertMatrix3(utils.sub3x3from4x4(todraw.objectWorldMatrix[i])),lightPosition);
    
            	    todraw.observerPositionObj[i] = utils.multiplyMatrix3Vector3(utils.invertMatrix3(utils.sub3x3from4x4(todraw.objectWorldMatrix[i])), eyeTemp);
    			    gl.uniform1f(textureInfluenceHandle[currentShader], textureInfluence);
    			    gl.uniform1f(ambientLightInfluenceHandle[currentShader], ambientLightInfluence);
    			    
    			    gl.uniform1i(textureFileHandle[currentShader], 0);
                    if (todraw.nTexture[i] == true && read_prop(todraw.diffuseTextureObj[i], "webGLTexture")) {
    			    	gl.activeTexture(gl.TEXTURE0);
                    	gl.bindTexture(gl.TEXTURE_2D, read_prop(todraw.diffuseTextureObj[i], "webGLTexture"));
    			    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, todraw.vertexBufferObjectId[i]);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, todraw.indexBufferObjectId[i]);
    
    			    gl.uniform4f(lightColorHandle[currentShader], lightColor[0],
                                                                  lightColor[1],
                                                                  lightColor[2],
                                                                  lightColor[3]);
                    gl.uniform4f(materialDiffColorHandle[currentShader], todraw.diffuseColor[i][0],
                                                                         todraw.diffuseColor[i][1],
                                                                         todraw.diffuseColor[i][2],
                                                                         todraw.diffuseColor[i][3]);
    
                    gl.uniform4f(materialSpecColorHandle[currentShader], todraw.specularColor[i][0],
                                                                         todraw.specularColor[i][1],
                                                                         todraw.specularColor[i][2],
                                                                         todraw.specularColor[i][3]);
                    gl.uniform4f(ambientLightColorHandle[currentShader], ambientLightColor[0],
                                                                         ambientLightColor[1],
                                                                         ambientLightColor[2],
                                                                         ambientLightColor[3]);
    
    			    gl.uniform3f(lightDirectionHandle[currentShader], todraw.lightDirectionObj[i][0],
                                                                      todraw.lightDirectionObj[i][1],
                                                                      todraw.lightDirectionObj[i][2]);
                    gl.uniform3f(lightPositionHandle[currentShader],  todraw.lightPositionObj[i][0],
                                                                      todraw.lightPositionObj[i][1],
                                                                      todraw.lightPositionObj[i][2]);
    
                    gl.uniform1i(lightTypeHandle[currentShader], currentLightType);
                    gl.uniform1f(materialSpecPowerHandle[currentShader], objectSpecularPower);
    
                    gl.enableVertexAttribArray(vertexPositionHandle[currentShader]);
                    gl.vertexAttribPointer(vertexPositionHandle[currentShader], 3, gl.FLOAT, gl.FALSE, 4 * 8, 0);
    
                    gl.enableVertexAttribArray(vertexNormalHandle[currentShader]);
                    gl.vertexAttribPointer(vertexNormalHandle[currentShader], 3, gl.FLOAT, gl.FALSE, 4 * 8, 4 * 3);
    
                    gl.enableVertexAttribArray(vertexUVHandle[currentShader]);
                    gl.vertexAttribPointer(vertexUVHandle[currentShader], 2, gl.FLOAT, gl.FALSE, 4 * 8, 4 * 6);
                    gl.drawElements(gl.TRIANGLES, todraw.facesNumber[i]*3, gl.UNSIGNED_SHORT, 0);
                    gl.disableVertexAttribArray(vertexPositionHandle[currentShader]);
                    gl.disableVertexAttribArray(vertexNormalHandle[currentShader]);
                    gl.disableVertexAttribArray(vertexUVHandle[currentShader]);
                } else {
                    //Pick shader
                    gl.bindBuffer(gl.ARRAY_BUFFER, todraw.vertexBufferObjectId[i]);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, todraw.indexBufferObjectId[i]);
                    gl.uniformMatrix4fv(matrixHandle, gl.FALSE, utils.transposeMatrix(projectionMatrix));

                    if (todraw.type == room) {
                            var u_id = new Array(4);
                    } else {
                        var u_id =  [
                          ((todraw.u_id >>  0) & 0xFF) / 0xFF,
                          ((todraw.u_id >>  8) & 0xFF) / 0xFF,
                          ((todraw.u_id >> 16) & 0xFF) / 0xFF,
                          ((todraw.u_id >> 24) & 0xFF) / 0xFF,
                        ];
                    }
                    gl.uniform4f(uidHandle, u_id[0], u_id[1], u_id[2], u_id[3]);
                    if (!todraw.isRoom) {
        	            gl.uniformMatrix4fv(translationHandlePicker, gl.FALSE, utils.MakeTranslateMatrix(Tx, Ty, Tz));
        	            gl.uniformMatrix4fv(rotationMatrixPicker, gl.FALSE, rotationMatrix);
                    } else {
        	            gl.uniformMatrix4fv(rotationMatrixPicker, gl.FALSE, utils.identityMatrix());
        	            gl.uniformMatrix4fv(translationHandlePicker, gl.FALSE, utils.MakeTranslateMatrix(0.0, 0.0, 0.0));

                    }
                    gl.vertexAttribPointer(positionHandle, 3, gl.FLOAT, gl.FALSE, 4 * 8, 0);
                    gl.enableVertexAttribArray(positionHandle);
                    gl.drawElements(gl.TRIANGLES, todraw.facesNumber[i]*3, gl.UNSIGNED_SHORT, 0);
                    gl.disableVertexAttribArray(positionHandle);
                }
            }
            });
    	}
        window.requestAnimationFrame(drawScene);
  }


// Here is the function that loads the shaders
function loadShaders(){

        utils.loadFiles([shaderDir + 'vs_p.glsl',
                         shaderDir + 'fs_p.glsl',
                         shaderDir + 'vs_g.glsl',
                         shaderDir + 'fs_g.glsl',
                         shaderDir + 'pick-v.glsl',
                         shaderDir + 'pick-f.glsl'
                         ],
                         function(shaderText){
                            // odd numbers are VSs, even are FSs
                            var numShader = 0;
                            for(i=0; i<shaderText.length; i+=2){
                                var vertexShader = gl.createShader(gl.VERTEX_SHADER);
                                gl.shaderSource(vertexShader, shaderText[i]);
                                gl.compileShader(vertexShader);
                                if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
                                    alert("ERROR IN VS SHADER : "+gl.getShaderInfoLog(vertexShader));
                                }
                                var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                                gl.shaderSource(fragmentShader, shaderText[i+1]);
                                gl.compileShader(fragmentShader);
                                if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
                                    alert("ERROR IN FS SHADER : "+gl.getShaderInfoLog(fragmentShader));
                                }
                                shaderProgram[numShader] = gl.createProgram();
                                gl.attachShader(shaderProgram[numShader], vertexShader);
                                gl.attachShader(shaderProgram[numShader], fragmentShader);
                                gl.linkProgram(shaderProgram[numShader]);
                                if(!gl.getProgramParameter(shaderProgram[numShader], gl.LINK_STATUS)){
                                alert("Unable to initialize the shader program...");}
                                numShader++;
                            }

                        });
        //*** Getting the handles to the shaders' vars
        for(i = 0; i <2; i++){


            vertexPositionHandle[i] = gl.getAttribLocation(shaderProgram[i], 'inPosition');
            vertexNormalHandle[i] = gl.getAttribLocation(shaderProgram[i], 'inNormal');
            vertexUVHandle[i] = gl.getAttribLocation(shaderProgram[i], 'inUVs');

            matrixPositionHandle[i] = gl.getUniformLocation(shaderProgram[i], 'wvpMatrix');

            materialDiffColorHandle[i] = gl.getUniformLocation(shaderProgram[i], 'mDiffColor');
            materialSpecColorHandle[i] = gl.getUniformLocation(shaderProgram[i], 'mSpecColor');
            materialSpecPowerHandle[i] = gl.getUniformLocation(shaderProgram[i], 'mSpecPower');
			
            textureFileHandle[i] = gl.getUniformLocation(shaderProgram[i], 'textureFile');
            textureInfluenceHandle[i] = gl.getUniformLocation(shaderProgram[i], 'textureInfluence');
            ambientLightInfluenceHandle[i] = gl.getUniformLocation(shaderProgram[i], 'ambientLightInfluence');
            ambientLightColorHandle[i]= gl.getUniformLocation(shaderProgram[i], 'ambientLightColor');

            eyePositionHandle[i] = gl.getUniformLocation(shaderProgram[i], 'eyePosition');

            lightDirectionHandle[i] = gl.getUniformLocation(shaderProgram[i], 'lightDirection');
            lightPositionHandle[i] = gl.getUniformLocation(shaderProgram[i], 'lightPosition');
            lightColorHandle[i] = gl.getUniformLocation(shaderProgram[i], 'lightColor');
            lightTypeHandle[i]= gl.getUniformLocation(shaderProgram[i],'lightType');

        }
        uidHandle = gl.getUniformLocation(shaderProgram[2], 'u_id');
        matrixHandle = gl.getUniformLocation(shaderProgram[2], 'u_matrix');
        positionHandle = gl.getAttribLocation(shaderProgram[2], 'b_position');
}


function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function read_prop(obj, prop) {
    return obj[prop];
}

// Some JQuery for the menu models
(function($){
	$.fn.styleddropdown = function(){
		return this.each(function(){
			var obj = $(this);
                
			obj.find('.field').click(function() { //onclick event, 'list' fadein
            var self = $(this)[0];
            if (!submenuVisibility) {
			    obj.find('.list').fadeIn(300);
                submenuVisibility = self.name;
            } else {
                    if (submenuVisibility == self.name) {
                        obj.find('.list').fadeOut(300);
                        submenuVisibility = null;
                    } else {
                        submenuVisibility = self.name;
                    }
            }
            
            if (self.name == "rooms") {
            
                obj.find('.list')[0].innerHTML = '\
		<li>Pianta rettangolare</li>\
		<li>Pianta quadrata</li>\
		<li>Pianta a L</li>'
            }
            else if (self.name == "furniture") {
                obj.find('.list')[0].innerHTML = '\
        <li onclick="openFurniture(1)">Bedroom</li>\
		<ul id="bedroom" style="display:none">\
		<li>Bed</li>\
		<li>Wardrobe</li>\
		<li>Sideboard</li>\
		</ul>\
        <li onclick="openFurniture(6)">Childroom</li>\
		<ul id="childroom" style="display:none">\
		<li>Child bed</li>\
		<li>Baby bed</li>\
		<li>Changing table</li>\
		<li>Shelf double</li>\
		<li>Shelf type1</li>\
		<li>Shelf type2</li>\
		<li>Child desk</li>\
		<li>Child desk 2</li>\
		<li>Toy xylophone</li>\
		<li>Toy train</li>\
		<li>Toy letter cubes</li>\
		</ul>\
        <li onclick="openFurniture(2)">Living room</li>\
		<ul id="living-room" style="display:none">\
		<li>Sofa</li>\
		<li>Sofa2</li>\
		<li>Coffee table</li>\
		<li>Coffee table2</li>\
		<li>Side table</li>\
		<li>Table lamp</li>\
		<li>Relax sofa</li>\
		<li>Armchair</li>\
		<li>TV stand</li>\
		<li>TV</li>\
		</ul>\
        <li onclick="openFurniture(3)">Kitchen</li>\
		<ul id="kitchen" style="display:none">\
		<li>Dining set</li>\
		<li>Dining table</li>\
		<li>Dresser</li>\
		<li>Fridge</li>\
		<li>Lower cabinet</li>\
		<li>Coffee machine</li>\
		<li>High coffee table</li>\
		<li>Coffee chair</li>\
		<li>Bar stool</li>\
		<li>Wash basin</li>\
		<li>Isle cabinet</li>\
		<li>Cooker</li>\
		<li>Vent</li>\
		<li>Tea set</li>\
		<li>Modern chair</li>\
		</ul>\
        <li onclick="openFurniture(4)">Decor</li>\
		<ul id="decor" style="display:none">\
		<li>Picture</li>\
		<li>Car model</li>\
		</ul>\
        <li onclick="openFurniture(5)">Office</li>\
		<ul id="office" style="display:none">\
		<li>Bookcase</li>\
		<li>Bookcase empty</li>\
		<li>PC</li>\
		<li>iMac pc</li>\
		<li>Angled desk</li>\
		<li>Ikea desk-bookcase</li>\
		<li>Office chair</li>\
		<li>Notebook set</li>\
		<li>Office set</li>\
		</ul>'
                
            }
            else if (self.name == "description") {
                obj.find('.list')[0].innerHTML = '\
		<li style="cursor:default">A home planner written in WebGL, with a little bit of Javascript, HTML, CSS and JQuery for Computer Graphics project. Read more<a style="text-decoration:none" href="https://dueacaso.it"> here</a></li>' 
            }
			$(document).keyup(function(event) { //keypress event, fadeout on 'escape'
				if(event.keyCode == 27) {
				obj.find('.list').fadeOut(300);
                submenuVisibility = false;
				}
			});
			obj.find('.list li').click(function() { 
            var toLoad = $(this)[0].innerHTML;
            if (loadModel(toLoad)){
			    obj.find('.list').fadeOut(300);
                submenuVisibility = false;
                }
			});
	    });
	});
};
})(jQuery);

function openFurniture(roomStyle) {
    if (roomStyle == 1) { 
         
        if (document.getElementById("bedroom").style.display == "block") document.getElementById("bedroom").style.display="none" 
        else
            document.getElementById("bedroom").style.display="block";}
    else if (roomStyle == 2) {    
        if (document.getElementById("living-room").style.display == "block") document.getElementById("living-room").style.display="none" 
        else
        document.getElementById("living-room").style.display="block";}
    else if (roomStyle == 3) {    
        if (document.getElementById("kitchen").style.display == "block") document.getElementById("kitchen").style.display="none" 
        else
        document.getElementById("kitchen").style.display="block";}
    else if (roomStyle == 4) {    
        if (document.getElementById("decor").style.display == "block") document.getElementById("decor").style.display="none" 
        else
        document.getElementById("decor").style.display="block";}
    else if (roomStyle == 5) {    
        if (document.getElementById("office").style.display == "block") document.getElementById("office").style.display="none" 
        else
        document.getElementById("office").style.display="block";}
    else if (roomStyle == 6) {    
        if (document.getElementById("childroom").style.display == "block") document.getElementById("childroom").style.display="none" 
        else
        document.getElementById("childroom").style.display="block";}

}

$(function(){
	$('.accordion').styleddropdown();
});

function topView() {
     angle = 0.0;
     elevation = -90.0;
}

function resetView() {
        elevation = -25;
        angle = -15;
}

function disableCollision() {
        if (collisionDisabled == false) {
                collisionDisabled = true;
                document.getElementById("disable-collision").innerHTML = "enable collision";
                }
        else if (collisionDisabled == true) {
                collisionDisabled = false;
                document.getElementById("disable-collision").innerHTML = "disable collision";
        }

}


  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

var program;
var positionlocation;
var positionBuffer;
var skyboxLocation;
var fieldOfViewRadians = degToRad(60);
var cameraYRotationRadians = degToRad(0);
var viewDirectionProjectionInverseLocation;

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

//Called when the slider for texture influence is changed
function updateTextureInfluence(val){
    textureInfluence = val;
}

function updateLightType(val){
    currentLightType = parseInt(val);
}

function updateLightMovement(){
        if (checkbox.checked == true) {
            moveLight = 1;
        } else {
            moveLight = 0;
        }
}

function updateShader(val){
    currentShader = parseInt(val);
}

function updateAmbientLightInfluence(val){
    ambientLightInfluence = val;
}

function updateAmbientLightColor(val){

    val = val.replace('#','');
    ambientLightColor[0] = parseInt(val.substring(0,2), 16) / 255;
    ambientLightColor[1] = parseInt(val.substring(2,4), 16) / 255;
    ambientLightColor[2] = parseInt(val.substring(4,6), 16) / 255;
    ambientLightColor[3] = 1.0;

}

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

/**
  function drawPlane() {
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);
    
    // Set the uniforms
    gl.uniformMatrix4fv(
        viewDirectionProjectionInverseLocation, false,
        projectionMatrix);
    gl.uniform4f(ambLightColorSkybox, ambientLightColor[0], ambientLightColor[1], ambientLightColor[2], ambientLightColor[3]);
    gl.uniform1f(ambLightInfluenceSkybox, ambientLightInfluence);

    // Tell the shader to use texture unit 0 for u_skybox
    gl.uniform1i(skyboxLocation, 0);

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);

    // Draw the geometry.
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    gl.disableVertexAttribArray(positionLocation);
  }

function cubeMap() {
  // look up where the vertex data needs to go.
  program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);
  positionLocation = gl.getAttribLocation(program, "a_position");
  ambLightColorSkybox = gl.getUniformLocation(program, "ambientLightColor");
  ambLightInfluenceSkybox = gl.getUniformLocation(program, "ambientLightInfluence");
  // lookup uniforms
  skyboxLocation = gl.getUniformLocation(program, "u_skybox");
  viewDirectionProjectionInverseLocation =
  gl.getUniformLocation(program, "u_viewDirectionProjectionInverse");
  // Create a buffer for positions
  positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put the positions in the buffer
  setGeometry(gl);
  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  const faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      url: '/img/sky_posx1.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: '/img/sky_negx1.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      url: '/img/sky_posy1.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      url: '/img/sky_negy1.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      url: '/img/sky_posz1.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: '/img/sky_negz1.png',
    },
  ];
  faceInfos.forEach((faceInfo) => {
    const {target, url} = faceInfo;

    // Upload the canvas to the cubemap face.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1024;
    const height = 1024;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    // setup each face so it's immediately renderable
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

    // Asynchronously load an image
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.texImage2D(target, level, internalFormat, format, type, image);
	  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

}

// Fill the buffer with the values that define a quad.
function setGeometry(gl) {
  var positions = new Float32Array(
    [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// Draw the scene.
  function drawSkyBox() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);
    // Set the uniforms
    gl.uniformMatrix4fv(
        viewDirectionProjectionInverseLocation, false,
        projectionMatrix);
    gl.uniform4f(ambLightColorSkybox, ambientLightColor[0], ambientLightColor[1], ambientLightColor[2], ambientLightColor[3]);
    gl.uniform1f(ambLightInfluenceSkybox, ambientLightInfluence);
    // Tell the shader to use texture unit 0 for u_skybox
    gl.uniform1i(skyboxLocation, 0);
    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);
    // Draw the geometry.
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    gl.disableVertexAttribArray(positionLocation);
  }
**/
