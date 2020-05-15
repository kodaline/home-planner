#extension GL_OES_standard_derivatives : enable

precision highp float;

varying vec2 vUV;

void main(void) {
    float divisions = 10.0;
    float thickness = 0.04;
    float delta = 0.05 / 2.0;

    float x = fract(vUV.x * divisions);
    x = min(x, 1.0 - x);

    float xdelta = fwidth(x);
    x = smoothstep(x - xdelta, x + xdelta, thickness);

    float y = fract(vUV.y * divisions);
    y = min(y, 1.0 - y);

    float ydelta = fwidth(y);
    y = smoothstep(y - ydelta, y + ydelta, thickness);

    float c =clamp(x + y, 0.0, 1.0);

    gl_FragColor = vec4(c, c, c, 1.0);
}
