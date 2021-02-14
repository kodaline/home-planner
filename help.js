function openPopup() {
    document.getElementById('test').style.display = 'block';
    }

    function closePopup() {
        document.getElementById('test').style.display = 'none';
        }

function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}

function getTexture(image_URL){
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
   }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function read_prop(obj, prop) {
    return obj[prop];
}


/** 
 * The function used to display the menu with the objects when clicking on the menu on the left side.
 **/
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


//The function for the button to set the view on top
function topView() {
     angle = 0.0;
     elevation = -90.0;
}


//The function for the button to reset the view
function resetView() {
        elevation = -25;
        angle = -15;
}

//The button used to disable or enable collision
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

//Called when the slider for texture influence is changed
function updateTextureInfluence(val){
    textureInfluence = val;
}

function updateLightType(val){
    currentLightType = parseInt(val);
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


