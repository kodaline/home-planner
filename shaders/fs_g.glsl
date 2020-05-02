precision highp float; 

uniform sampler2D textureFile;

uniform float textureInfluence;

uniform vec4 mDiffColor;

varying vec2 fsUVs;

varying vec4 goureaudSpecular;
varying vec4 goureaudDiffuseAndAmbient;

void main() { 
	//Computing the color contribution from the texture
	vec4 diffuseTextureColorMixture = mDiffColor * (1.0 - textureInfluence) + texture2D(textureFile, fsUVs) * textureInfluence ;
	gl_FragColor = min(diffuseTextureColorMixture * (goureaudSpecular + goureaudDiffuseAndAmbient), vec4(1.0, 1.0, 1.0, 1.0)); 
}