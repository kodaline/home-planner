attribute vec3 b_position;
  
uniform mat4 u_matrix;
uniform mat4 rotationMatrix;
uniform mat4 translation;
void main() {
  // Multiply the position by the matrix.
  gl_Position = (u_matrix * (translation * rotationMatrix)) * vec4(b_position,1.0);
}
