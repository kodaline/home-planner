precision mediump float;
 
uniform samplerCube u_skybox;
uniform mat4 u_viewDirectionProjectionInverse;
uniform vec4 ambientLightColor;
uniform float ambientLightInfluence;
//uniform float textureInfluence;
//uniform vec4 mDiffColor;
 

varying vec4 v_position;
void main() {
    vec4 t = u_viewDirectionProjectionInverse * v_position;
    vec4 ambLight = textureCube(u_skybox, normalize(t.xyz / t.w)) * ambientLightColor * ambientLightInfluence;
  
    gl_FragColor = ambLight;
}

