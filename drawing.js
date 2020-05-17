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
var texture;
var vao;
var perspectiveMatrix = null;
var viewMatrix = null;
var lookRadius = 10.0;
var currentShader = 0;
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
var textureInfluence = 0.0;
var ambientLightInfluence = 0.0;
var ambientLightColor = [1.0, 1.0, 1.0, 1.0];
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
			if (elevation <= -100) {elevation = -100;}
			console.log(elevation);
        }
    }
}
function doMouseWheel(event) {
    var nLookRadius = lookRadius + event.wheelDelta/200.0;
    if((nLookRadius > 5.0) && (nLookRadius < 100.0)) {
        lookRadius = nLookRadius;
    }
}

function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}


function main(){

    //Cube parameters
    var cubeRx = 0.0;
    var cubeRy = 0.0;
    var cubeRz = 0.0;
    var cubeS  = 0.5;
    var lastUpdateTime = (new Date).getTime();

	canvas = document.getElementById("my-canvas");
	canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    canvas.addEventListener("mousewheel", doMouseWheel, false);

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
      
        utils.get_json(baseDir + 'models/EmptyRoom.json', function(loadedModel){roomModel = loadedModel;});
        sceneObjects = roomModel.meshes.length; 
		console.log(sceneObjects);
        perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
        viewMatrix = utils.MakeView(1.5, 1.9, 3.0, 10.0, 30.0);

        vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        for(i=0; i < sceneObjects; i++){ 
            objectWorldMatrix[i] = new utils.identityMatrix();
            projectionMatrix[i] =  new utils.identityMatrix();
            //diffuseColor[i] = [1.0, 1.0, 1.0, 1.0];
            //specularColor[i] = [1.0, 1.0, 1.0, 1.0];
            //observerPositionObj[i] = new Array(3);
            //lightDirectionObj[i] = new Array(3);
            //lightPositionObj[i] = new Array(3);
        }     
        for (i=0; i < sceneObjects ; i++) {        
            roomVertices = roomModel.meshes[i].vertices;
            roomIndices = [].concat.apply([], roomModel.meshes[i].faces);
            console.log("Room Indices:" + roomIndices);
            facesNumber[i] = roomIndices.length/3; 
            console.log("Face Number: "+facesNumber[i]);
            //vertices, normals and UV set 1
            vertexBufferObjectId[i] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectId[i]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(roomVertices), gl.STATIC_DRAW);

            indexBufferObjectId[i]=gl.createBuffer ();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectId[i]);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(roomIndices),gl.STATIC_DRAW);


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

            console.log(roomModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value);
            var imageName = roomModel.materials[meshMatIndex].properties[UVFileNamePropertyIndex].value;
			var getTexture = function(image_URL){                                                                                                                   


                var image=new Image();          
                image.webglTexture=false;   
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
                    image.webglTexture=texture; 
               };
               
               image.src=image_URL;                                                                                                                                

               return image;                   
               };
			diffuseTextureObj[i] = getTexture(modelsDir + imageName);
        } 
        loadShaders();
        drawScene();
      


    }else{
        alert("Error: WebGL not supported by your browser!");
    }

}
	function drawScene() {
		utils.resizeCanvasToDisplaySize(gl.canvas);
    	gl.clearColor(0.85, 0.85, 0.85, 1.0);
    	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(shaderProgram[currentShader]);
		cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    	cy = lookRadius * Math.sin(utils.degToRad(-elevation));

        //worldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, cubeRx, cubeRy, cubeRz, 1.0);
        //var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
        viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);
        for(i=0; i < sceneObjects; i++){
            gl.uniformMatrix4fv(matrixPositionHandle[currentShader], gl.FALSE, utils.transposeMatrix(projectionMatrix));
			gl.uniform1f(textureInfluenceHandle[currentShader], textureInfluence);
			gl.uniform1i(textureFileHandle[currentShader], 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(textureFileHandle[currentShader], texture);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObjectId[i]);

            gl.enableVertexAttribArray(vertexPositionHandle[currentShader]);
            gl.vertexAttribPointer(vertexPositionHandle[currentShader], 3, gl.FLOAT, gl.FALSE, 0, 0);

            gl.enableVertexAttribArray(vertexNormalHandle[currentShader]);
            gl.vertexAttribPointer(vertexNormalHandle[currentShader], 3, gl.FLOAT, gl.FALSE, 0, 0);

            gl.vertexAttribPointer(vertexUVHandle[currentShader], 2, gl.FLOAT, gl.FALSE, 0, 0);
            gl.enableVertexAttribArray(vertexUVHandle[currentShader]);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObjectId[i]);
            gl.drawElements(gl.TRIANGLES, facesNumber[i]*3, gl.UNSIGNED_SHORT, 0);
            gl.disableVertexAttribArray(vertexPositionHandle[currentShader]);
            gl.disableVertexAttribArray(vertexNormalHandle[currentShader]);
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
