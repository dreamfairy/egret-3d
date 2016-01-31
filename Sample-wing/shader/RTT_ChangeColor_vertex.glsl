attribute vec3 attribute_position ;
attribute vec2 attribute_uv0 ;

uniform mat4 uniform_ProjectionMatrix ;
uniform mat4 uniform_ModelMatrix;
varying vec2 uv ;
void main(void){
   uv = attribute_uv0 ;
   vec4 tmpPos = uniform_ModelMatrix * vec4(attribute_position,1.0);
   tmpPos = uniform_ProjectionMatrix * tmpPos;
   gl_Position = tmpPos;
}