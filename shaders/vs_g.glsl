attribute vec3 inPosition; 
attribute vec3 inNormal; 
attribute vec2 inUVs;
attribute vec2 inUV2s;

uniform mat4 wvpMatrix; 

uniform vec4 mSpecColor;            
uniform float mSpecPower;

uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform vec4 lightColor;
uniform int lightType;

uniform vec4 ambientLightColor;
uniform float ambientLightInfluence;

uniform vec3 eyePosition;

varying vec2 fsUVs;
varying vec2 fsUV2s;

//We have to separate the components that require the texture from the others.
varying vec4 goureaudSpecular;
varying vec4 goureaudDiffuseAndAmbient;

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

	fsUVs = inUVs;
	fsUV2s = inUV2s;
	gl_Position = wvpMatrix * vec4(inPosition, 1.0);
	
	vec3 nEyeDirection = normalize(eyePosition - inPosition);
	vec3 nNormal = normalize(inNormal);
	

	vec4 lm = lightModel(lightType, inPosition);
	vec3 nlightDirection = lm.rgb;
	float lightDimension = lm.a;
	
	//Computing the ambient light contribution (Without the texture contribution)
	vec4 ambLight = ambientLightColor * ambientLightInfluence;
	if(lightType == 5){
		goureaudSpecular = vec4(0.0, 0.0, 0.0, 0.0);
		goureaudDiffuseAndAmbient = vec4(1.0, 1.0, 1.0, 1.0);
	}else {
		//Computing the diffuse component of light (Without the texture contribution)
		vec4 diffuse = lightColor * clamp(dot(nlightDirection, nNormal), 0.0, 1.0) * lightDimension;	
		
		//Reflection vector for Phong model
		vec3 reflection = -reflect(nlightDirection, nNormal);	
		vec4 specular = mSpecColor * lightColor * pow(clamp(dot(reflection, nEyeDirection),0.0, 1.0), mSpecPower) * lightDimension;
			
		goureaudSpecular = specular;
		goureaudDiffuseAndAmbient = diffuse + ambLight;
	}
	
}