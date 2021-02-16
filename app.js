var canvas, checkbox;
var gl = null;

var base_url = window.location.origin;
var host = window.location.host;
var pathArray = window.location.pathname.split( '/' );

// Variables for the directories of models and shaders
baseDir = window.location.origin;
modelsDir = baseDir + "/models/";
shaderDir = baseDir + "/shaders/";

var shaderProgram = new Array(2); 

//Parameters for Camera
var cx = 0.0;
var cy = 0.0;
var cz = 0.0;
var elevation = -35.0;
var angle = -35.0;
var vao;
var perspectiveMatrix = null;
var viewMatrix = null;
var lookRadius = 10.0;
var vertexNormalHandle = new Array(2);
var vertexPositionHandle = new Array(2);
var vertexUVHandle = new Array(2);
var textureFileHandle = new Array(2);
var textureInfluenceHandle = new Array(2);
var translation = new Array(2);
//var ambLightInfluenceSkybox = new Array(2);
//var ambLightColorSkybox = new Array(2);
var ambientLightInfluenceHandle = new Array(2);
var emitInfluenceHandle = new Array(2);
var ambientLightColorHandle = new Array(2);
var emissionColorHandle = new Array(2);
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

var nearPlane = 0.1; //used for the presp proj matrix
var farPlane = 100; //used for the persp proj matrix

var underMouseCursorID = 0; //the id of the object under the mouse cursor
var id = 0; //id object for picking shader

var currentLightType = 1; //current light type variable
var currentShader = 0; //Defines the current shader in use
var textureInfluence = 1.0;
var ambientLightInfluence = 0.1;
var emitInfluence = 0.1;
var ambientLightColor = [1.0, 1.0, 1.0, 1.0];
var emitColor = [0.533, 0.533, 0.533, 0.533];

//Parameters for light definition (directional light)
var dirLightAlpha = -utils.degToRad(60);
var dirLightBeta  = -utils.degToRad(120);

//Parameters for fps limit
var fps = 30;
var fpsInterval, startTime, now, then, elapsed;
var frame = 0;
var one_second = Date.now();
var display_fps = 0;
var fps_html_target;
var fps_html_current;
var deltaTime;

var uidHandle;
var translationHandlePicker;
var rotationMatrixPicker;
var matrixHandle;
var positionHandle;
var fb;
var attachmentPoint;

var roomLoaded = false; //variable to check if a room is loaded
var rotationMatrix = utils.MakeRotateYMatrix(0);
var rotationMatrixHandle = new Array();
var loadedObjects = new Array(); //array to manage the loaded objects

var submenuVisibility = null;

var lightDirection = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
                      Math.sin(dirLightAlpha),
                      Math.cos(dirLightAlpha) * Math.sin(dirLightBeta),
                      ];

var objectSpecularPower = 20.0;

var lightPosition = [0.0, 6.0, 0.0];
var lightColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);

/** 
 * Here the Main function begins 
 **/

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
    }

    if(gl){
        // Get the gl canvas
        utils.resizeCanvasToDisplaySize(gl.canvas);
		//console.log(gl.canvas.width, gl.canvas.height);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.906, 0.976, 1.0, 1.0); 
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
		loadShaders();
		fpsInterval = 1000 / fps;
		then = Date.now();
		startTime = then;
		one_second = Date.now();
        fps_html_target.innerHTML = (fps).toFixed(1);
        //cubeMap();
        loadModel('Plane'); //loading of the grid
     	drawScene();
    }

    else{
            alert("Error: WebGL not supported by your browser!");
        }
}

/**
 * The load model function that sets camera, various matrices etc
 **/
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

        utils.get_json(modelsDir + objectCharacteristics.location, function(loadedModel){objectModel = loadedModel;});

        if (objectCharacteristics.type == room) {
                if (roomLoaded) {
                    alert('Room already loaded, refresh the page to change room type.');
                    return;
                }
                else { 
                    roomLoaded = true;
                }
        }
        sceneObjects = objectModel.meshes.length; 
        perspectiveMatrix = utils.MakePerspective(70, gl.canvas.width/gl.canvas.height, nearPlane, farPlane);
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

            //creating the objects' world matrix
            objectWorldMatrix[i] = objectModel.rootnode.children[i].transformation;      
            var meshMatIndex = objectModel.meshes[i].materialindex;
            var UVFileNamePropertyIndex = -1;
            var diffuseColorPropertyIndex = -1;
            var specularColorPropertyIndex = -1;
            for (n = 0; n < objectModel.materials[meshMatIndex].properties.length; n++){
                if(objectModel.materials[meshMatIndex].properties[n].key == "$tex.file") UVFileNamePropertyIndex = n;
                if(objectModel.materials[meshMatIndex].properties[n].key == "$clr.diffuse") diffuseColorPropertyIndex = n;
                if(objectModel.materials[meshMatIndex].properties[n].key == "$clr.specular") specularColorPropertyIndex = n;
            }

			//*** Getting vertex and normals                    
            var objVertex = [];
            for (n = 0; n < objectModel.meshes[i].vertices.length/3; n++){
                var x = objectModel.meshes[i].vertices[n*3];
                var y = objectModel.meshes[i].vertices[n*3+1];
                var z = objectModel.meshes[i].vertices[n*3+2];
                objVertex.push(x, y, z);
                //these if's are used to determine how big the object is
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
                //used to have the grid at the beginning
                if (objectCharacteristics.type == solid) {
                        objVertex.push(0.0, 0.0, 0.0, 0.0, 0.0)
                } else {
                    objVertex.push(objectModel.meshes[i].normals[n*3],
                                   objectModel.meshes[i].normals[n*3+1],
                                   objectModel.meshes[i].normals[n*3+2]);
                    if(UVFileNamePropertyIndex>=0 && objectModel.meshes[i].texturecoords){
                        objVertex.push( objectModel.meshes[i].texturecoords[0][n*2],
                                        1.0 - objectModel.meshes[i].texturecoords[0][n*2+1]);

                    } else {
                        objVertex.push( 0.0, 0.0);
                    }
                }   
            }

            facesNumber[i] = objectModel.meshes[i].faces.length; 
            console.log("Face Number: "+facesNumber[i]);

			if(UVFileNamePropertyIndex>=0){
                nTexture[i]=true;
                console.log(objectModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value);
                imageName = objectModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value;
                imageName = objectCharacteristics.location.split('/')[0] + '/' + imageName;
			diffuseTextureObj[i] = getTexture(modelsDir + imageName);
        	} else {
                        nTexture[i] = false;
            }
			//*** mesh color
            diffuseColor[i] = objectModel.materials[meshMatIndex].properties[diffuseColorPropertyIndex].value; // diffuse value

            diffuseColor[i].push(1.0); // Alpha value added

            specularColor[i] = objectModel.materials[meshMatIndex].properties[specularColorPropertyIndex].value;
            console.log("Specular: "+ specularColor[i]);
            vertexBufferObjectId[i] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectId[i]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objVertex), gl.STATIC_DRAW);

			//Creating index buffer
            facesData = [];
            for (n = 0; n < objectModel.meshes[i].faces.length; n++){
                facesData.push( objectModel.meshes[i].faces[n][0],
                                objectModel.meshes[i].faces[n][1],
                                objectModel.meshes[i].faces[n][2]
                                );
            }
            indexBufferObjectId[i]=gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectId[i]);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(facesData),gl.STATIC_DRAW);
        } 
        //push all the required info about a loaded model, used to computations when applying transformations to the object etc
        //currentN are used to sum up all the transformation applied to the object, instead the origin of the object remains fixed. This could be helpful to allow a reset series of transformation applied. The origin is used also to apply the transformation around the middle of the object.
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
            currentMoveY: 'currentMoveY' in objectCharacteristics ? objectCharacteristics.currentMoveY :   -minVertY,
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


/**
 * This is the function that draws the scene, also fps for screen refreshing is here.
 * Code that reads the pixel under the mouse is also here.
 **/
	function drawScene() {
		now = Date.now();
    	elapsed = now - then;
        deltaTime = elapsed/1000.0; //smooth
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
            //picking shader. It is faster since using the GPU avoiding doing it in JS 
            drawObjects(2);
        
            /**
             * Figure out what pixel is under the mouse and read it
             * get the coordinates where the mouse is pointing 
             **/
            const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
            const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
            const data = new Uint8Array(4);
            //read the pixel where the mouse is pointing
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
    			    gl.uniform1f(emitInfluenceHandle[currentShader], emitInfluence);
    			    
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
                    gl.uniform4f(emissionColorHandle[currentShader], emitColor[0],
                                                                     emitColor[1],
                                                                     emitColor[2],
                                                                     emitColor[3]);
    
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
                } 
                    else {
                    
                    //Pick shader, to manage the selecting of an object. It creates a shader getting the id of the object, with a uniform color to identify it
                    gl.bindBuffer(gl.ARRAY_BUFFER, todraw.vertexBufferObjectId[i]);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, todraw.indexBufferObjectId[i]);
                    gl.uniformMatrix4fv(matrixHandle, gl.FALSE, utils.transposeMatrix(projectionMatrix));

                    if (todraw.type == room) {
                            var u_id = new Array(4);
                    } else {
                        //bit mask to take an integer and split it in 4 bytes; the id given to the object is split to apply it over the faces of the object
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


/** 
 * The function that loads the shaders
 **/
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
            emitInfluenceHandle[i] = gl.getUniformLocation(shaderProgram[i], 'emitInfluence');
            ambientLightColorHandle[i]= gl.getUniformLocation(shaderProgram[i], 'ambientLightColor');
            emissionColorHandle[i]= gl.getUniformLocation(shaderProgram[i], 'emitColor');

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

