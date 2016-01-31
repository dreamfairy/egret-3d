varying vec2 uv ;
uniform sampler2D diffuseTex ;
uniform sampler2D maskTex;
uniform vec2 uniform_uvCenterPos; //fc0 x,y
uniform vec4 uniform_godray_params; //fc1 num_samples, density, num_samples * num_samples, 1/density
uniform vec4 uniform_weight_decay_exposure;  //fc2
uniform vec2 uniform_screenlightPos; //fc3 x,y
const int numSampler = 30;
const float distance = 0.01;
void main(void){
   // Calculate vector from pixel to light source in screen space.
   //store current uv
   vec2 lightPos = uniform_screenlightPos;
   //计算灯光方向
   lightPos = uv - lightPos;
   // Divide by number of samples and scale by control factor.  
   lightPos.xy = lightPos.xy * uniform_godray_params.ww;
   // Store initial sample.  
   vec4 currentColor = texture2D( diffuseTex , uv );
   // Set up illumination decay factor.  
   float decay = 1.0;
   // Store the texcoords
   vec2 tmpUV = uv;

   for(int i = 0; i < numSampler; i++){
		// Step sample location along ray. 
		tmpUV.xy = tmpUV.xy - lightPos.xy;
		// Retrieve sample at new location.  
		vec4 stepColor = texture2D( diffuseTex , tmpUV );
		// Apply sample attenuation scale/decay factors.  
		float factors = decay * uniform_weight_decay_exposure.x;
		stepColor.rgb = stepColor.rgb *  factors;
		
		// Accumulate combined color.  
		currentColor.rgb = currentColor.rgb + stepColor.rgb;
		
		// Update exponential decay factor. 
		decay = decay * uniform_weight_decay_exposure.y;
   }

   // Output final color with a further scale control factor. 
   currentColor.rgb = currentColor.rgb * uniform_weight_decay_exposure.zzz;

   //for debug lightPos
   float dx = uv.x - uniform_screenlightPos.x;
   float dy = uv.y - uniform_screenlightPos.y;
   float dis = sqrt(dx * dx + dy * dy);
   if(dis < distance){
		currentColor.rgb = vec3(255.0,0.0,0.0);
   }

   //vec2 maskUv = vec2(uv.x, 1.0 - uv.y);
   //vec4 maskColor = texture2D( maskTex, maskUv);
   //currentColor.rgb += maskColor.rgb;
   
   gl_FragColor = currentColor;
}