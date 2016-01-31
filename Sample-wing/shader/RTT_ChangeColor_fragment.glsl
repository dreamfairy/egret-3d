varying vec2 uv ;
uniform sampler2D diffuseTex ;
uniform vec4 uniform_changeColor;
void main(void){
   vec4 color = texture2D( diffuseTex , uv );
   color *= uniform_changeColor;
   gl_FragColor = color; 
}