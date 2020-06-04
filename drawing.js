var canvas, checkbox;
var gl = null;
modelsDir = "http://0.0.0.0:8000/models/";
shaderDir = "http://0.0.0.0:8000/shaders/";
baseDir = "http://0.0.0.0:8000/";
var vU = [];
var shaderProgram = new Array(2); //Two handles, one for each shaders' couple. 0 = goureaud; 1 = phong

//Parameters for Camera
var cx = 0.0;
var cy = 0.0;
var cz = 0.0;
var elevation = 0.0;
var angle = 0.0;
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

var underMouseCursorID = 0;
var id = 0;
var currentLightType = 1;
var currentShader = 0;                //Defines the current shader in use.
var textureInfluence = 1.0;
var ambientLightInfluence = 0.45;
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
var room = 'room';
var furniture = 'furniture';
var roomLoaded = false;
var rotationMatrix = utils.MakeRotateYMatrix(0);
var currentRotation = 0;
var currentMoveZ = 0;
var currentMoveX = 0;
var rotationMatrixHandle = new Array();
var loadedObjects = new Array();
//parameters for room mapping
var objectsList = {
	'Pianta rettangolare': {location: 'empty_room/room_rect.json', type: room}, 
	'Pianta quadrata': {location: 'empty_room/room_square.json', type: room}, 
    'Pianta a L': {location: 'empty_room/room_elle.json', type: room}, 
    'Pianta semi-esagonale': {location: 'empty_room/room_esa.json', type: room}, 
    'Letto': {location: 'bed/bed_sh3d.json', type: furniture},
    'Tavolino': {location: 'table/tableBasse2.json', type: furniture},
    'Sedia': {location: '', type: furniture},
    'Sofa': {location: 'sofa2/sofa2.json', type: furniture},
    'Tv-table': {location: '.json', type: furniture},
    'Frigo': {location: '.json', type: furniture},
};

var submenuVisibility = false; 

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

var currentControlledObject = 0;
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
	if (nLookRadius > 10.0) nLookRadius = 10.0;
        lookRadius = nLookRadius;
}

function doDoubleClick(event) {
    if (underMouseCursorID > 0) {
        loadedObjects.forEach(i => {
            if (i.u_id == underMouseCursorID) {
               playAudio(doubleClick);
               currentControlledObject = i; 
            }
        }); 
    }
}

var doubleClick = "/music/selection.wav";
function playAudio(url) {
  new Audio(url).play();
}

function onKeyDown(event) {
    console.log(event.key);
    if (currentControlledObject) {
        if (event.key == 'q') {
            currentControlledObject.currentRotation += 30;
        } else if (event.key == 'e') {
            currentControlledObject.currentRotation -= 30;
        } else if (event.key == 'w') {
            currentControlledObject.currentMoveZ -= 0.05;
        } else if (event.key == 's') {
            currentControlledObject.currentMoveZ += 0.05;
        } else if (event.key == 'a') {
            currentControlledObject.currentMoveX -= 0.05;
        } else if (event.key == 'd') {
            currentControlledObject.currentMoveX += 0.05;
        }
    }
}
function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}


var lastDownTarget;

function main(){

	canvas = document.getElementById("my-canvas");
	canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    canvas.addEventListener("mousewheel", doMouseWheel, false);
    canvas.addEventListener("dblclick", doDoubleClick, false);
    document.addEventListener('keydown',onKeyDown,false);

    
    fps_html_target = document.getElementById("fps");
    fps_html_current = document.getElementById("display_fps");

    try{
    gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl2"));
    gl = canvas.getContext("webgl2");

    } catch(e){
        console.log(e);
    }

    if(gl){
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
        cubeMap();
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

function loadModel(modelName) {

        if (!modelName) return; 

        var objectCharacteristics = objectsList[modelName];
        
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
        perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
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

            var minVertX = 0;
            var maxVertX = 0;
            var minVertY = 0;
            var maxVertY = 0;
            var minVertZ = 0;
            var maxVertZ = 0;

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

            facesNumber[i] = roomModel.meshes[i].faces.length; 
            console.log("Face Number: "+facesNumber[i]);

			if(UVFileNamePropertyIndex>=0){

                nTexture[i]=true;
                console.log(roomModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value);
                imageName = roomModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value;
				
                imageName = objectCharacteristics.location.split('/')[0] + '/' + imageName;

		        var getTexture = function(image_URL){                                                                                                                   
                var image=new Image();          
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
            currentMoveZ: 0,
            currentMoveX: 0,
            x: maxVertX - minVertX,
            y: maxVertY - minVertY,
            z: maxVertZ - minVertZ,
        });

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

    // Tell the shader to use texture unit 0 for u_skybox
    gl.uniform1i(skyboxLocation, 0);

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);

    // Draw the geometry.
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    gl.disableVertexAttribArray(positionLocation);
  }


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

            // Put your drawing code here
        
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

			drawSkyBox();
            drawObjects(currentShader);

        }
}

function drawObjects(shaderProgramNumber) {
        
        shader = shaderProgram[shaderProgramNumber];
        gl.useProgram(shader);

        loadedObjects.forEach((todraw) => {
            viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
            if (!todraw.isRoom) {
                //Used to move object using "w-a-s-d" 
                viewMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeTranslateMatrix(todraw.currentMoveX, 0, todraw.currentMoveZ));
                //Used to rotate object around its center using "q-e"
                viewMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeTranslateMatrix(+todraw.x/2, 0, +todraw.z/2));
                viewMatrix = utils.multiplyMatrices(viewMatrix, (utils.MakeRotateYMatrix(todraw.currentRotation)));
                viewMatrix = utils.multiplyMatrices(viewMatrix, utils.MakeTranslateMatrix(-todraw.x/2, 0, -todraw.z/2));
            }
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

		    translation[i] = gl.getUniformLocation(shaderProgram[i], 'translation');
		    rotationMatrixHandle[i] = gl.getUniformLocation(shaderProgram[i], 'rotationMatrix');
        }
        uidHandle = gl.getUniformLocation(shaderProgram[2], 'u_id');
        matrixHandle = gl.getUniformLocation(shaderProgram[2], 'u_matrix');
        positionHandle = gl.getAttribLocation(shaderProgram[2], 'b_position');
		translationHandlePicker = gl.getUniformLocation(shaderProgram[2], 'translation');
		rotationMatrixPicker = gl.getUniformLocation(shaderProgram[2], 'rotationMatrix');
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

(function($){
	$.fn.styleddropdown = function(){
		return this.each(function(){
			var obj = $(this);
                
			obj.find('.field').click(function() { //onclick event, 'list' fadein
            /**        
            $.find('.list').forEach(function(e) 
                    {
                            $(e).fadeOut();
                    });**/
            if (!submenuVisibility) {
			    obj.find('.list').fadeIn(400);
                submenuVisibility = true;
            }
            var self = $(this)[0];
            if (self.name == "rooms") {
            
                obj.find('.list')[0].innerHTML = '\
		<li>Pianta rettangolare</li>\
		<li>Pianta quadrata</li>\
		<li>Pianta a L</li>\
		<li>Pianta semi-esagonale</li>'
            }
            else if (self.name == "furniture") {
                obj.find('.list')[0].innerHTML = '\
		<li>Letto</li>\
		<li>Tavolino</li>\
		<li>Sedia</li>\
		<li>Sofa</li>\
		<li>Tv-table</li>\
		<li>Frigo</li>'
                
            }
            else if (self.name == "description") {
                obj.find('.list')[0].innerHTML = '\
		<li style="cursor:default">A home planner written in WebGL, with a little bit of Javascript, HTML, CSS and JQuery for Computer Graphics project. Read more<a style="text-decoration:none" href="https://dueacaso.it"> here</a></li>' 
            }
			$(document).keyup(function(event) { //keypress event, fadeout on 'escape'
				if(event.keyCode == 27) {
				obj.find('.list').fadeOut(400);
                submenuVisibility = false;
				}
			});
		/**	
			obj.find('.list').hover(function(){ },
				function(){
					$(this).fadeOut(400);
				});**/
			obj.find('.list li').click(function() { 
            var toLoad = $(this)[0].innerHTML;
            loadModel(toLoad);
			obj.find('.list').fadeOut(400);
            submenuVisibility = false;
			    });
			});
		});
	};
})(jQuery);

$(function(){
	$('.accordion').styleddropdown();
});

function topView() {
     angle = 0.0;
     elevation = -90.0;
}

function virtualVisitor() {
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

function cubeMap() {
  // look up where the vertex data needs to go.
  program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

  positionLocation = gl.getAttribLocation(program, "a_position");

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
      url: '/img/sky.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: '/img/sky.png',
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
      url: '/img/sky.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: '/img/sky.png',
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

