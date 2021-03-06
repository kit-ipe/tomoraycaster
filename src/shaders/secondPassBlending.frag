precision mediump int;
precision mediump float;
varying vec4 frontColor;
varying vec4 pos;
uniform sampler2D uBackCoord;
uniform sampler2D uSliceMaps[<%= maxTexturesNumber %>];
uniform float uNumberOfSlices;
uniform float uOpacityVal;
uniform float uSlicesOverX;
uniform float uSlicesOverY;
uniform float darkness;
uniform float uMinGrayVal;
uniform float uMaxGrayVal;
uniform float uSlicemapWidth;
uniform float l;

//Acts like a texture3D using Z slices and trilinear filtering.
vec3 getVolumeValue(vec3 volpos) {
  float s1Original, s2Original, s1, s2;
  float dx1, dy1;
  vec2 texpos1,texpos2;
  float slicesPerSprite = uSlicesOverX * uSlicesOverY;
  s1Original = floor(volpos.z*uNumberOfSlices);
  int tex1Index = int(floor(s1Original / slicesPerSprite));
  s1 = mod(s1Original, slicesPerSprite);
  dx1 = fract(s1/uSlicesOverX);
  dy1 = floor(s1/uSlicesOverY)/uSlicesOverY;
  texpos1.x = dx1+(volpos.x/uSlicesOverX);
  texpos1.y = dy1+(volpos.y/uSlicesOverY);
  vec3 value = vec3(0.0,0.0,0.0);

  <% for(var i=0; i < maxTexturesNumber; i++) { %>
      if( tex1Index == <%=i%> )
      {
          value = texture2D(uSliceMaps[<%=i%>],texpos1).xyz;
      }
      <% if( i < maxTexturesNumber-1 ) { %>
          else
      <% } %>
  <% } %>
  return value;
}

void main(void) {
  const int uStepsI = 256;
  const float uStepsF = float(uStepsI);

  vec2 texC = ((pos.xy/pos.w) + 1.0) / 2.0;
  vec4 backColor = texture2D(uBackCoord,texC);
  vec3 dir = backColor.rgb - frontColor.rgb;
  vec4 vpos = frontColor;
  vec3 Step = dir/uStepsF;
  vec4 accum = vec4(0, 0, 0, 0);
  vec4 color = vec4(1.0);

  float opacityFactor = uOpacityVal;

  for(int i = 0; i < uStepsI; i++) {
    vec3 gray_val = getVolumeValue(vpos.xyz);

    if(gray_val.x > uMinGrayVal && gray_val.x < uMaxGrayVal) {
      color.a = 0.04;
      accum += color;
      if(accum.a >= 1.0) break;
    }

    //advance the current position
    vpos.xyz += Step;

    if(vpos.x > 1.0 || vpos.y > 1.0 || vpos.z > 1.0 || vpos.x < 0.0 || vpos.y < 0.0 || vpos.z < 0.0)
        break;
  }
  gl_FragColor = accum;
}
