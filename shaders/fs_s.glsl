precision highp float;                                 
                                                       
  varying vec3 vNorm;                                  
                                                       
  uniform samplerCube uSampler;                        
                                                       
  void main(void) {                                    
    gl_FragColor = textureCube(uSampler, vNorm);       
  } 
