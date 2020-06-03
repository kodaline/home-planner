precision highp float;                                 
                                                         
  attribute vec3 aPosition;                              
  attribute vec3 aNorm;                                  
                                                         
  uniform   mat4  uModelViewProjectionMatrix;            
                                                         
  varying vec3 vNorm;                                    
                                                         
  void main(void) {                                      
    vNorm = aNorm;                                       
                                                         
    gl_Position = 
      uModelViewProjectionMatrix * vec4(aPosition, 1.0); 
  }                                                      
