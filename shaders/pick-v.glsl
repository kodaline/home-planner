attribute vec3 b_position;
  
uniform mat4 u_matrix;
  
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * vec4(b_position,1.0);
}
