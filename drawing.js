var canvas, checkbox;
var gl = null;
modelsDir = "http://0.0.0.0:8000/models/";
shaderDir = "http://0.0.0.0:8000/shaders/";
baseDir = "http://0.0.0.0:8000/";
var vU = [];
var shaderProgram = new Array(2); //Two handles, one for each shaders' couple. 0 = goureaud; 1 = phong

//Parameters for Camera
var cx = 4.5;
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
// The following arrays have sceneObjects as dimension.
var vertexBufferObjectId= new Array();
var indexBufferObjectId = new Array();
var objectWorldMatrix = new Array();
var projectionMatrix= new Array();
var facesNumber     = new Array();
var diffuseColor    = new Array();  //diffuse material colors of objs
var specularColor   = new Array();
var diffuseTextureObj   = new Array();  //Texture material
var nTexture        = new Array();  //Number of textures per object

var currentLightType = 1;
var currentShader = 0;                //Defines the current shader in use.
var textureInfluence = 1.0;
var ambientLightInfluence = 0.35;
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

//parameters for room mapping
var roomList = {'Pianta rettangolare': 'empty_room/room_rect.json', 'Pianta quadrata': 'empty_room/room_square.json', 'Pianta a L': 'empty_room/room_elle.json', 'Pianta semi-esagonale': 'empty_room/room_esa.json'};

//Use the Utils 0.2 to use mat3
var lightDirection = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
                      Math.sin(dirLightAlpha),
                      Math.cos(dirLightAlpha) * Math.sin(dirLightBeta),
                      ];

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

// Eye parameters;
// We need now 4 eye vector, one for each cube
// As well as 4 light direction vectors for the same reason
var observerPositionObj = new Array();
var lightDirectionObj = new Array();
var lightPositionObj = new Array();

var lightPosition = [0.0, 3.0, 0.0];
var lightColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
var moveLight = 0; //0 : move the camera - 1 : Move the lights
// event handler

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
}
function doMouseWheel(event) {
    var nLookRadius = lookRadius + event.wheelDelta/200.0;
    if((nLookRadius > 4.0) && (nLookRadius < 100.0)) {
        lookRadius = nLookRadius;
    }
}

function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}


function main(){

	canvas = document.getElementById("my-canvas");
	canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    canvas.addEventListener("mousewheel", doMouseWheel, false);
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
        
        //gl.enable(gl.BLEND);
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
		loadShaders();
		fpsInterval = 1000 / fps;
		then = Date.now();
		startTime = then;
		one_second = Date.now();
        fps_html_target.innerHTML = (fps).toFixed(1);
     	drawScene(); 
    }

    else{
            alert("Error: WebGL not supported by your browser!");
        }
}

function loadModel(modelName) {
        utils.get_json(modelsDir + modelName, function(loadedModel){roomModel = loadedModel;});
        sceneObjects = roomModel.meshes.length; 
		console.log(sceneObjects);
        perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
        viewMatrix = utils.MakeView(1.5, 1.9, 3.0, 10.0, 30.0);

        vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

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
			//*** Getting vertex and normals                    
            var objVertex = [];
            for (n = 0; n < roomModel.meshes[i].vertices.length/3; n++){
                objVertex.push(roomModel.meshes[i].vertices[n*3],
                               roomModel.meshes[i].vertices[n*3+1],
                               roomModel.meshes[i].vertices[n*3+2]);
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
                var imageName = roomModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value;
				imageName = modelName.split('/')[0] + '/' + imageName;
		

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
        	}else {
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
        if (sceneObjects) {
		    utils.resizeCanvasToDisplaySize(gl.canvas);
    	    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.useProgram(shaderProgram[currentShader]);
		    cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    	    cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    	    cy = lookRadius * Math.sin(utils.degToRad(-elevation));
		    eyeTemp = [cx, cy, cz];
            viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);

		    projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);
        }
        for(i=0; i < sceneObjects; i++){
            gl.uniformMatrix4fv(matrixPositionHandle[currentShader], gl.FALSE, utils.transposeMatrix(projectionMatrix));
			lightDirectionObj[i] = utils.multiplyMatrix3Vector3(utils.transposeMatrix3(utils.sub3x3from4x4(objectWorldMatrix[i])), lightDirection);

        	lightPositionObj[i] = utils.multiplyMatrix3Vector3(utils.invertMatrix3(utils.sub3x3from4x4(objectWorldMatrix[i])),lightPosition);

        	observerPositionObj[i] = utils.multiplyMatrix3Vector3(utils.invertMatrix3(utils.sub3x3from4x4(objectWorldMatrix[i])), eyeTemp);
			gl.uniform1f(textureInfluenceHandle[currentShader], textureInfluence);
			gl.uniform1f(ambientLightInfluenceHandle[currentShader], ambientLightInfluence);
			
			gl.uniform1i(textureFileHandle[currentShader], 0);
            if (nTexture[i] == true && read_prop(diffuseTextureObj[i], "webGLTexture")) {
				gl.activeTexture(gl.TEXTURE0);
            	gl.bindTexture(gl.TEXTURE_2D, read_prop(diffuseTextureObj[i], "webGLTexture"));
			}
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectId[i]);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectId[i]);

			gl.uniform4f(lightColorHandle[currentShader], lightColor[0],
                                                          lightColor[1],
                                                          lightColor[2],
                                                          lightColor[3]);
            gl.uniform4f(materialDiffColorHandle[currentShader], diffuseColor[i][0],
                                                                 diffuseColor[i][1],
                                                                 diffuseColor[i][2],
                                                                 diffuseColor[i][3]);

            gl.uniform4f(materialSpecColorHandle[currentShader], specularColor[i][0],
                                                                 specularColor[i][1],
                                                                 specularColor[i][2],
                                                                 specularColor[i][3]);
            gl.uniform4f(ambientLightColorHandle[currentShader], ambientLightColor[0],
                                                                 ambientLightColor[1],
                                                                 ambientLightColor[2],
                                                                 ambientLightColor[3]);

			gl.uniform3f(lightDirectionHandle[currentShader], lightDirectionObj[i][0],
                                                              lightDirectionObj[i][1],
                                                              lightDirectionObj[i][2]);
            gl.uniform3f(lightPositionHandle[currentShader], lightPositionObj[i][0],
                                                              lightPositionObj[i][1],
                                                              lightPositionObj[i][2]);

            gl.uniform1i(lightTypeHandle[currentShader], currentLightType);
            gl.uniform1f(materialSpecPowerHandle[currentShader], objectSpecularPower);

            gl.enableVertexAttribArray(vertexPositionHandle[currentShader]);
            gl.vertexAttribPointer(vertexPositionHandle[currentShader], 3, gl.FLOAT, gl.FALSE, 4 * 8, 0);

            gl.enableVertexAttribArray(vertexNormalHandle[currentShader]);
            gl.vertexAttribPointer(vertexNormalHandle[currentShader], 3, gl.FLOAT, gl.FALSE, 4 * 8, 4 * 3);

            gl.enableVertexAttribArray(vertexUVHandle[currentShader]);
            gl.vertexAttribPointer(vertexUVHandle[currentShader], 2, gl.FLOAT, gl.FALSE, 4 * 8, 4 * 6);
			//console.log(gl.getParameter(gl.TEXTURE_2D));
            gl.drawElements(gl.TRIANGLES, facesNumber[i]*3, gl.UNSIGNED_SHORT, 0);
            gl.disableVertexAttribArray(vertexPositionHandle[currentShader]);
            gl.disableVertexAttribArray(vertexNormalHandle[currentShader]);
        }
	}
        window.requestAnimationFrame(drawScene);
  }



function loadShaders(){

        utils.loadFiles([shaderDir + 'vs_p.glsl',
                         shaderDir + 'fs_p.glsl',
                         shaderDir + 'vs_g.glsl',
                         shaderDir + 'fs_g.glsl'
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
			var obj = $(this)
			obj.find('.field').click(function() { //onclick event, 'list' fadein
            $.find('.list').forEach(function(e) 
                    {
                            $(e).fadeOut();
                    });
			obj.find('.list').fadeIn(400);
			
			$(document).keyup(function(event) { //keypress event, fadeout on 'escape'
				if(event.keyCode == 27) {
				obj.find('.list').fadeOut(400);
				}
			});
			
			obj.find('.list').hover(function(){ },
				function(){
					$(this).fadeOut(400);
				});
			});
			obj.find('.list li').click(function() { 
            var toLoad = roomList[$(this)[0].innerHTML];
            loadModel(toLoad);
			obj.find('.list').fadeOut(400);
			});
		});
	};
})(jQuery);

$(function(){
	$('.size').styleddropdown();
});

function topView() {
        //lookRadius = ;
        angle = 0.0;
        elevation = -90.0;
}
