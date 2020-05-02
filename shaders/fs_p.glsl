precision highp float; 

uniform vec4 mDiffColor;
uniform vec4 mSpecColor;            
uniform float mSpecPower;

uniform sampler2D textureFile;
uniform float textureInfluence;
uniform float ambientLightInfluence;
uniform vec4 ambientLightColor;

uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform vec4 lightColor;
uniform int lightType;

uniform vec3 eyePosition;

varying vec3 fsNormal; 
varying vec3 fsPosition; 
varying vec2 fsUVs;
varying vec2 fsUV2s;

//Function to create different lights types
//int lt = the selected light source type
//vec3 pos = the surface position

vec4 lightModel(int lt, vec3 pos) {
	
	//The normalize light direction
    vec3 nLightDir;
	
	//Float to store light dimension and cone length
	float lDim, lCone;

	lDim = 1.0;
	
	if(lt == 1) { 			//Directional light
		nLightDir = - normalize(lightDirection);
	} else if(lt == 2) {	//Point light
		nLightDir = normalize(lightPosition - pos);
	} else if(lt == 3) {	//Point light (decay)
		float lLen = length(lightPosition - pos);
		nLightDir = normalize(lightPosition - pos);
		lDim = 160.0 / (lLen * lLen);
	} else if(lt == 4) {	//Spot light
		nLightDir = normalize(lightPosition - pos);
		lCone = -dot(nLightDir, normalize(lightDirection));
		if(lCone < 0.5) {
			lDim = 0.0;
		} else if(lCone > 0.7) {
			lDim = 1.0;
		} else {
			lDim = (lCone - 0.5) / 0.2;
		}
	}
	return vec4(nLightDir, lDim);
}

void main() { 

	vec3 nEyeDirection = normalize(eyePosition - fsPosition);
	vec3 nNormal = normalize(fsNormal);
	
	//Instead of computing it this way because directional
	//Now we call a function to define light direction and size.
	//vec3 nlightDirection = - normalize(lightDirection);
	
	vec4 lm = lightModel(lightType, fsPosition);
	vec3 nlightDirection = lm.rgb;
	float lightDimension = lm.a;
	
	//Computing the color contribution from the texture
	vec4 diffuseTextureColorMixture = texture2D(textureFile, fsUVs) * textureInfluence + mDiffColor * (1.0 - textureInfluence) ;

	//Computing the ambient light contribution
	//We assume that the ambient color of the object is identical to it diffuse color (including its texture contribution)
	vec4 ambLight = diffuseTextureColorMixture * ambientLightColor * ambientLightInfluence;
	
	if(lightType == 5){
		gl_FragColor = diffuseTextureColorMixture;
	}else{
		//Computing the diffuse component of light 
		vec4 diffuse = diffuseTextureColorMixture * lightColor * clamp(dot(nlightDirection, nNormal), 0.0, 1.0) * lightDimension;	
		
		//Reflection vector for Phong model
		vec3 reflection = -reflect(nlightDirection, nNormal);	
		vec4 specular = mSpecColor * lightColor * pow(clamp(dot(reflection, nEyeDirection),0.0, 1.0), mSpecPower) * lightDimension;
		gl_FragColor = min(ambLight + diffuse + specular, vec4(1.0, 1.0, 1.0, 1.0)); 		
	}
	

}