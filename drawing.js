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

var lookRadius = 10.0;

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
      
        utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
            var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
            var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
            program = utils.createProgram(gl, vertexShader, fragmentShader);
      
          });
        gl.useProgram(program);
      
        utils.get_json(baseDir + 'models/bed.json', function(loadedModel){roomModel = loadedModel;});
      
        var roomVertices = roomModel.meshes[0].vertices;
        var roomIndices = [].concat.apply([], roomModel.meshes[0].faces);
        var roomTexCoords = roomModel.meshes[0].texturecoords[0];
      
        var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        var uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
        var matrixLocation = gl.getUniformLocation(program, "matrix");
        var textLocation = gl.getUniformLocation(program, "u_texture");
      
        var perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
        var viewMatrix = utils.MakeView(1.5, 1.9, 3.0, 10.0, 30.0);
      
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
      
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(roomVertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(roomTexCoords), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(uvAttributeLocation);
        gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(roomIndices), gl.STATIC_DRAW);
      

        var meshMatIndex = roomModel.meshes[0].materialindex;
      
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
      
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
      
        var image = new Image();
        requestCORSIfNotSameOrigin(image, modelsDir + imageName);
        image.src = modelsDir + imageName;
        image.onload= function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
			
        };
      
        drawScene();
      

	function drawScene() {
		utils.resizeCanvasToDisplaySize(gl.canvas);
    	gl.clearColor(0.85, 0.85, 0.85, 1.0);
    	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    	cy = lookRadius * Math.sin(utils.degToRad(-elevation));

        //worldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, cubeRx, cubeRy, cubeRz, 1.0);
        //var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
        viewMatrix = utils.MakeView(cx, cy, cz, elevation, -angle);
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);

        gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(textLocation, texture);

        gl.bindVertexArray(vao);
        gl.drawElements(gl.TRIANGLES, roomIndices.length, gl.UNSIGNED_SHORT, 0 );

        window.requestAnimationFrame(drawScene);
  }

    }else{
        alert("Error: WebGL not supported by your browser!");
    }

}


function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}
