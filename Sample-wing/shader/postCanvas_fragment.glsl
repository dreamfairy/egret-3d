varying vec2 uv ;
uniform sampler2D texture2D_1 ;
void main(void){
   vec4 color = texture2D( texture2D_1 , uv );
   gl_FragColor = color; 
}