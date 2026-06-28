

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  // --- UNIFORMS ---
  uniform float uTime;
  uniform vec2 uResolution;
  
  // Audio
  uniform float uLow;
  uniform float uMid;
  uniform float uHigh;
  uniform float uIntegrated;
  uniform float uBeat;
  uniform float uDrums; // NEW: Snappy transient envelope
  uniform sampler2D uAudioTexture;
  
  // Settings & FX
  uniform float uBloomIntensity;
  uniform float uBloomReact;
  uniform sampler2D uUserTexture;
  uniform float uHasTexture;
  uniform float uTextureHue; 
  uniform sampler2D uVideoTexture;
  uniform float uHasVideo;
  uniform float uVideoScale;
  uniform float uSceneMode;
  uniform float uWarpMode;
  uniform float uSpin;
  uniform float uOscilloscope; 
  uniform float uColorDodgeMix;
  uniform float uOscDodge; 
  uniform float uHueShift; 
  uniform float uMirrorOsc; 
  uniform float u3DOscilloscope; 
  uniform float uZoom;
  uniform float uVibrance;
  uniform float uPaletteMode;
  uniform float uBrightness;
  uniform float uStretch; 
  uniform float uContrast;
  uniform float uGrain;
  uniform float uVHS;
  uniform float uTransition;
  uniform float uBlur;
  uniform float uOptics;
  
  // Geometry Modifiers
  uniform float uGeoScale;     // Controls density/scale [0.0 - 1.0]
  uniform float uGeoDeform;    // Controls displacement/twist intensity [0.0 - 1.0]
  uniform float uGeoThickness; // Controls object weight/inflation [0.0 - 1.0]
  uniform float uGeoDetail;    // Controls surface noise/complexity [0.0 - 1.0]
  
  // Camera Pan
  uniform float uCamX;
  uniform float uCamY;
  
  // Video FX
  uniform float uVideoWarp;
  uniform float uVideoDodge;
  uniform float uVideoMirror;
  uniform float uVideoGlitch;
  uniform float uVideoFade;       // New
  uniform float uVideoPaletteMix; // New
  uniform float uVideoDiffusion;  // New
  uniform float uVideoBlendMode;  // [NEW] 0=Replace, 1=Add, 2=Screen, 3=Multiply, 4=Overlay

  // Audio Reactive FX
  uniform float uFxShake;
  uniform float uFxFlash;
  uniform float uFxSolarize;
  uniform float uSwing;

  varying vec2 vUv;

  // --- CONSTANTS ---
  #define PI 3.14159265359
  #define MAX_STEPS 64
  #define MAX_DIST 120.0
  #define SURF_DIST 0.01

  // --- GLOBALS ---
  float g_glow = 0.0;
  float g_sceneMode;
  float g_warpMode;
  float g_matID = 0.0; 
  vec3 g_hitPos = vec3(0.0);

  // --- UTILS ---

  // Rotation Matrix
  mat2 rot(float a) {
      float s = sin(a);
      float c = cos(a);
      return mat2(c, -s, s, c);
  }

  // Random Hash
  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // 3D Noise for textures
  float noise(vec3 p) {
      vec3 ip = floor(p);
      vec3 fp = fract(p);
      fp = fp * fp * (3.0 - 2.0 * fp);
      vec2 tap = vec2(1.0, 57.0);
      float res = mix(
          mix(hash(ip.xy + vec2(0.0, 0.0)), hash(ip.xy + vec2(1.0, 0.0)), fp.x),
          mix(hash(ip.xy + vec2(0.0, 1.0)), hash(ip.xy + vec2(1.0, 1.0)), fp.x),
          fp.y);
      return res; // simplified 2d slice for speed
  }

  // Smooth Min
  float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
  }

  // ACES Tone Mapping (Cinematic Look)
  vec3 aces(vec3 x) {
    const float a = 2.51;
    const float b = 0.03;
    const float c = 2.43;
    const float d = 0.59;
    const float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  // Palette Generator
  vec3 getColorPalette(float t) {
      vec3 a, b, c, d;
      
      // 0: CYBER (Cyan, Blue, Magenta)
      if (uPaletteMode < 0.5) {
          a = vec3(0.5); b = vec3(0.5); c = vec3(1.0); d = vec3(0.0, 0.33, 0.67);
          if (uBeat > 0.8) d = vec3(0.0, 0.10, 0.20);
      }
      // 1: INFERNO (Red, Orange, Yellow)
      else if (uPaletteMode < 1.5) {
          a = vec3(0.8, 0.5, 0.4); b = vec3(0.2, 0.4, 0.2); c = vec3(2.0, 1.0, 1.0); d = vec3(0.0, 0.25, 0.25);
      }
      // 2: TOXIC (Green, Purple)
      else if (uPaletteMode < 2.5) {
          a = vec3(0.2, 0.7, 0.4); b = vec3(0.6, 0.2, 0.6); c = vec3(1.0); d = vec3(0.0, 0.33, 0.67);
      }
      // 3: CANDY (Pink, Teal)
      else if (uPaletteMode < 3.5) {
          a = vec3(0.5); b = vec3(0.5); c = vec3(1.0); d = vec3(0.3, 0.20, 0.20);
      }
      // 4: GOLDEN (Gold, Dark)
      else {
          a = vec3(1.0, 0.8, 0.5); b = vec3(0.5, 0.3, 0.1); c = vec3(1.0); d = vec3(0.0, 0.10, 0.20);
      }
      return a + b * cos(6.28318 * (c * t + d));
  }
  
  vec3 getRainbow(float t) {
      return 0.5 + 0.5 * cos(6.28318 * (vec3(1.0) * t + vec3(0.0, 0.33, 0.67)));
  }

  vec3 rotateHue(vec3 col, float shift) {
      const vec3 k = vec3(0.57735);
      float cosAngle = cos(shift);
      return vec3(col * cosAngle + cross(k, col) * sin(shift) + k * dot(k, col) * (1.0 - cosAngle));
  }

  // --- SDF PRIMITIVES ---
  float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
  }
  float sdOctahedron(vec3 p, float s) {
    p = abs(p);
    return (p.x + p.y + p.z - s) * 0.57735027;
  }
  float sdSphere(vec3 p, float s) { return length(p) - s; }
  float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz)-t.x,p.y);
    return length(q)-t.y;
  }
  float sdGyroid(vec3 p, float scale, float thickness, float bias) {
      p *= scale;
      return abs(dot(sin(p), cos(p.zxy)) - bias) / scale - thickness;
  }

  float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
      vec3 pa = p - a, ba = b - a;
      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      return length(pa - ba * h) - r;
  }

  // --- STAR FIELD FUNCTION (RESTORED) ---
  vec3 getStars(vec3 rd) {
      vec3 col = vec3(0.0);
      float travel = uTime * 0.1; 
      
      for(float i=0.0; i<1.0; i+=0.5) {
          float t = fract(travel + i);
          float fade = smoothstep(0.0, 0.2, t) * smoothstep(1.0, 0.8, t);
          vec2 uv = rd.xy / max(0.01, t * 1.5); 
          uv *= rot(t * 0.5);
          
          vec2 id = floor(uv * 15.0);
          float rnd = hash(id + i * 50.0);
          
          if (rnd > 0.98) {
              float bright = (rnd - 0.98) * 50.0 * fade;
              vec3 starCol = getColorPalette(rnd * 10.0 + i + uTime * 0.01);
              col += starCol * bright;
          }
      }
      return col;
  }

  // --- DOMAIN WARPING ---
  vec3 applyWarp(vec3 p, float mode) {
      // Global Spin
      if (uSpin > 0.01) {
          float len = length(p.xy);
          float angle = uSpin * (len + 1.0) * 0.2 + uTime * uSpin * 0.05; 
          p.xy *= rot(angle);
      }

      if (mode < 0.5) return p; // Normal
      if (mode < 1.5) { // Liquid
          float t = uTime * 0.4;
          float flow = 1.0 + uLow * 0.5;
          p.x += sin(p.z * 0.2 + t) * 2.0 * flow;
          p.y += cos(p.z * 0.15 + t * 0.8) * 2.0 * flow;
          p.z += sin(length(p.xy) * 0.5 - t);
          return p;
      }
      if (mode < 2.5) { // Bend
          p.x += sin(p.z * 0.3 + uTime * 0.25) * 0.5 * uMid;
          return p;
      }
      if (mode < 3.5) { // Kaleidoscope
          p *= 0.4; p.xy = abs(p.xy); p.xy *= rot(uTime * 0.5); 
          p.xy = abs(p.xy); p.xy -= 1.0; p.xy *= rot(uTime * -0.25);
          return p;
      }
      // Portal
      float len = length(p.xy);
      float angle = atan(p.y, p.x);
      angle += (3.0 / (len + 0.5) * sin(uTime * 0.5)) * (1.0 + uLow); 
      p.x = len * cos(angle); p.y = len * sin(angle);
      p.z += sin(len * 2.0 - uTime) * uMid;
      return p;
  }

  // --- SCENE MAPS ---
  
  float mapTessellation(vec3 p) {
      vec3 z = p;
      float pulse = 1.0 + uLow * 0.08; 
      // GeoScale Mod: Controls recursive scale factor (1.5 to 2.5)
      float scale = 1.5 + uGeoScale * 1.0; 
      
      z = mod(z + 2.0, 4.0) - 2.0;
      float s = 1.0;
      for(int i = 0; i < 3; i++) {
          z = abs(z);
          if (z.x < z.y) z.xy = z.yx;
          if (z.x < z.z) z.xz = z.zx;
          if (z.y < z.z) z.yz = z.zy;
          z = z * scale - vec3(scale - 1.0) * pulse; 
          
          // GeoDeform Mod: Controls z-axis rotation offset
          // GeoDetail Mod: Additional fractal rotation complexity
          z.z += sin(uTime * 0.2) * 0.2 * float(i) * (uGeoDeform * 3.0); 
          z.xy *= rot(0.1 + uIntegrated * 0.05 + uGeoDetail * float(i) * 0.2); 
          s *= scale;
      }
      // GeoThickness Mod: Inflate/Deflate boxes
      float box = sdBox(z, vec3(1.2 + (uGeoThickness - 0.5))) / s;
      return box;
  }

  float mapHyperspace(vec3 p) {
      vec3 q = p;
      // GeoScale Mod: Controls segment length
      float segLen = 4.0 - uGeoScale * 2.0; 
      q.z = mod(q.z, segLen) - segLen * 0.5; 
      q.xy = abs(q.xy);
      
      // GeoDeform Mod: Controls radius
      float r = 2.5 - uLow * 0.5 - (uGeoDeform * 1.5);
      // GeoThickness Mod: Frame thickness
      float thickness = 0.2 + (uGeoThickness - 0.5) * 0.3;
      
      float frame = max(max(q.x, q.y) - r, -(max(q.x, q.y) - (r - thickness)));
      float gate = max(frame, abs(q.z) - thickness); 
      vec3 d = p;
      d.z = mod(d.z + uTime * 2.0, 20.0) - 10.0; 
      d.xy *= rot(d.z * 0.1);
      return min(gate, sdOctahedron(d, 0.2 + (uGeoThickness * 0.3)));
  }

  float mapCity(vec3 p) {
      float floorY = -5.0;
      // GeoScale Mod: Controls building density (spacing 8.0 down to 3.0)
      float spacing = 8.0 - (uGeoScale * 5.0); 
      vec3 q = p;
      q.x = abs(q.x);
      float xIdx = floor(q.x / spacing);
      q.x = mod(q.x, spacing) - spacing * 0.5;
      q.z = mod(q.z, spacing) - spacing * 0.5;
      
      float freqUV = clamp(xIdx * 0.06 + 0.02, 0.0, 0.95);
      float fft = texture2D(uAudioTexture, vec2(freqUV, 0.75)).r;
      
      // GeoDeform Mod: Controls building height amplification
      float h = 0.5 + fft * (10.0 + uGeoDeform * 40.0); 
      // GeoThickness Mod: Building Width
      float w = 1.5 + (uGeoThickness - 0.5) * 2.0;
      
      float dBox = sdBox(q - vec3(0.0, floorY + h, 0.0), vec3(w, h, w)) - 0.1;
      
      if (dBox < 0.2) {
         vec3 localPos = q - vec3(0.0, floorY + h, 0.0);
         // GeoDetail Mod: Noise on building surface
         if (uGeoDetail > 0.5 && noise(localPos * 10.0) > 0.8) dBox -= 0.1;

         if (abs(localPos.x) > (w - 0.1) || abs(localPos.z) > (w - 0.1)) {
             float wx = fract(p.y * 0.5);
             float wy = fract(p.x * 0.5 + p.z * 0.5);
             if (wx > 0.4 && wy > 0.4 && fft > 0.4) g_matID = 2.5; 
             else g_matID = 2.0; 
         } else {
             g_matID = 2.0;
         }
      }

      return min(p.y - floorY, dBox);
  }

  float mapSaturn(vec3 p) {
      p.yz *= rot(0.4); 
      p.xz *= rot(uTime * 0.05);
      // GeoScale Mod: Planet Size
      float dPlanet = length(p) - (2.5 + uGeoScale * 2.0);
      float r = length(p.xz);
      
      // GeoDeform Mod: Rings turbulence
      float dRings = abs(p.y) - 0.05 + sin(r * (20.0 + uGeoDeform * 40.0)) * 0.05;
      // GeoThickness Mod: Ring thickness
      dRings -= (uGeoThickness * 0.2); 

      float fftIndex = clamp((r - 4.5) / 8.0, 0.01, 0.99);
      float fft = texture2D(uAudioTexture, vec2(fftIndex, 0.25)).r;
      dRings -= fft * 0.3 * uLow;
      dRings += sin(r * 150.0 + uTime * 2.0) * 0.02 * uHigh;
      
      float shape = max(dRings, max(4.5 - r, r - 12.0));
      if (abs(r - 8.0) < 0.5) shape = max(shape, 0.2); 

      float finalD = min(dPlanet, shape);
      if (finalD == shape && finalD < 0.1) g_matID = 2.0; 
      else g_matID = 0.0;
      return finalD;
  }
  
  float mapInfiniteMirror(vec3 p) {
      vec3 q = p;
      q.z += uTime * 2.0;
      float zSpan = 2.5;
      vec3 id = floor((q + zSpan*0.5) / zSpan);
      q.z = mod(q.z + zSpan*0.5, zSpan) - zSpan*0.5;
      // GeoDeform Mod: Rotation speed of frames
      q.xy *= rot(id.z * 0.2 + sin(uTime * 0.5) * 0.1 * (1.0 + uGeoDeform * 5.0));
      
      // GeoScale Mod: Frame thickness/size
      float size = 1.0 + uLow * 0.3 + uGeoScale * 1.5;
      // GeoThickness Mod: Adjust internal thickness
      float th = 0.2 + uGeoThickness * 0.2;
      
      float frame = max(sdBox(q, vec3(size, size, 0.1)), -sdBox(q, vec3(size - th, size - th, 0.3)));
      vec3 q2 = abs(q) - vec3(size, size, 0.0);
      float spheres = length(q2) - (0.2 + uGeoDetail * 0.3); // GeoDetail adds spheres
      float d = min(frame, spheres);
      if (d < 0.1) g_matID = 6.0; 
      return d;
  }
  
  float mapSineWave(vec3 p) {
      vec3 q = p;
      q.x -= uTime * 6.0;
      // GeoDeform: Amplitude
      float amp = 1.0 + uMid * 5.0 * (0.5 + uGeoDeform); 
      // GeoScale: Frequency
      q.y -= sin(q.x * (0.25 + uGeoScale * 0.5)) * amp;
      q.z += cos(q.x * 0.15) * 2.0;
      // GeoThickness: Tube Radius
      float radius = (0.3 + uLow * 0.2) * (0.5 + uGeoThickness);
      float dTube = length(q.yz) - radius;
      if (dTube < 0.5) g_matID = 5.0; 
      return min(dTube, p.y + 8.0);
  }
  
  float mapPsychedelic(vec3 p) {
      vec3 q = p; q.z += uTime * 2.0; q.y += sin(uTime) * 2.0;
      // GeoScale: Gyroid Scale
      // GeoDeform: Gyroid Thickness/Bias
      // GeoThickness: Thickness of structure
      return smin(
          sdGyroid(q, 4.5 * (0.5 + uGeoScale), 0.1 * uGeoDeform, 0.0), 
          sdGyroid(q + vec3(1.0), 9.0, 0.05 + uGeoThickness * 0.1, 0.0), 
          0.5) * 0.5; 
  }
  
  float mapGyroscope(vec3 p) {
     vec3 q = p;
     // GeoScale: Ring size multiplier
     float s = 1.0 + uGeoScale;
     float t1 = sdTorus(vec3(q.x*cos(uTime)-q.z*sin(uTime), q.y, q.x*sin(uTime)+q.z*cos(uTime)), vec2(10.0 * s, 0.5 * uGeoThickness));
     float t2 = sdTorus(vec3(q.x, q.y*cos(uTime*1.6)-q.z*sin(uTime*1.6), q.y*sin(uTime*1.6)+q.z*cos(uTime*1.6)), vec2(7.0 * s, 0.4 * uGeoThickness));
     if (min(t1, t2) < 0.1) g_matID = 6.0; 
     return min(min(t1, t2), sdSphere(q, (1.5 + uBeat * 0.5) * (1.0 + uGeoDeform)));
  }

  // Fallback for other maps using generic mods if needed, or leave specific ones
  float mapMandala(vec3 p) {
      p.xy *= rot(uTime * 0.1);
      float r = length(p.xy);
      // GeoDeform: Complexity of petals
      float shape = cos(atan(p.y, p.x) * (8.0 + floor(uMid * 8.0) * 2.0 + floor(uGeoDeform * 10.0)) + uTime);
      // GeoThickness: Thickness of ring
      return min(max(abs(r - (2.5 + shape * 0.3) * (1.0 + uLow * 0.2)) - (0.04 * (1.0 + uGeoThickness)), abs(p.z) - 0.05), length(p) - (1.0 + uBeat));
  }
  
  float mapMirrorDimension(vec3 p) {
      vec3 q = p; q.z = mod(q.z + uTime * 1.25, 20.0) - 10.0; 
      // GeoScale: Recursion depth or size (simulated by box size)
      for(int i = 0; i < 4; i++) { q = abs(q) - vec3(1.0 + uLow * 0.2 + uGeoScale, 1.0, 1.0); q.xy *= rot(0.5); q.xz *= rot(0.3 + uTime * 0.1); }
      // GeoThickness: Box thickness
      float th = 0.5 + (uGeoThickness - 0.5) * 0.4;
      if (sdBox(q, vec3(th, 3.0, th)) * 0.6 < 0.1) g_matID = 6.0;
      return sdBox(q, vec3(th, 3.0, th)) * 0.6;
  }
  
  float mapNeural(vec3 p) {
      vec3 q = p; q.z += uTime * 3.0; q.xy *= rot(q.z * 0.1 + sin(uTime * 0.2) * 0.5);
      // GeoScale: Neuron density
      float d = smin(sdGyroid(q, 0.8 * (0.5+uGeoScale), 0.03 + uLow * 0.15, 0.0), sdGyroid(q + vec3(2.1), 1.6, 0.02 + uLow * 0.1, 0.0), 0.2);
      // GeoThickness: overall thickness
      d -= (uGeoThickness - 0.5) * 0.2;
      if (d < 0.05) g_matID = 3.0; else g_matID = 0.0;
      return d * 0.8; 
  }
  
  float mapQuantum(vec3 p) {
      p.z += uTime * 4.0; p.xy *= rot(uTime * 0.1); 
      vec3 q = mod(p + 1.5, 3.0) - 1.5;
      float d = mix(sdOctahedron(q, 0.5+uMid*0.8), sdBox(q, vec3(0.35+uMid*0.56)), smoothstep(0.4, 0.6, sin(uTime + floor((p.z+1.5)/3.0))));
      if (d < 0.1) g_matID = 4.0; else g_matID = 0.0;
      return max(d, -sdSphere(q, (0.5+uMid*0.8)*1.1)) * 0.7;
  }

  // Dancing Shadows - Alien silhouettes dancing in fire
  float mapDancingShadows(vec3 p) {
      // Fire-like background glow
      g_glow += 0.05 / (0.1 + abs(p.y + 2.0));
      
      // Create multiple dancing figures
      float d = MAX_DIST;
      
      for(float i = 0.0; i < 5.0; i += 1.0) {
          // Position each figure in a circle
          float angle = i * 1.2566 + uTime * 0.3; // 2*PI/5
          float radius = 8.0 + sin(uTime * 0.5 + i) * 2.0;
          vec3 offset = vec3(cos(angle) * radius, 0.0, sin(angle) * radius);
          
          vec3 q = p - offset;
          
          // Rotate figure to face center
          q.xz *= rot(-angle);
          
          // Dance movement
          float dance = sin(uTime * 2.0 + i * 1.5) * 0.5;
          float bounce = abs(sin(uTime * 3.0 + i)) * 0.3;
          
          // Alien body - elongated capsule
          vec3 bodyPos = q;
          bodyPos.y += bounce;
          float body = sdCapsule(bodyPos, vec3(0.0, -1.0, 0.0), vec3(0.0, 1.0, 0.0), 0.4 + uLow * 0.2);
          
          // Head - sphere
          vec3 headPos = q - vec3(0.0, 1.5 + bounce, 0.0);
          float head = sdSphere(headPos, 0.5 + uBeat * 0.1);
          
          // Arms - dancing
          vec3 armL = q - vec3(-0.5, 0.3 + bounce, 0.0);
          armL.xy *= rot(dance * 1.5);
          float leftArm = sdCapsule(armL, vec3(0.0), vec3(0.0, -0.8, 0.0), 0.15);
          
          vec3 armR = q - vec3(0.5, 0.3 + bounce, 0.0);
          armR.xy *= rot(-dance * 1.5);
          float rightArm = sdCapsule(armR, vec3(0.0), vec3(0.0, -0.8, 0.0), 0.15);
          
          // Legs - dancing
          vec3 legL = q - vec3(-0.2, -1.0, 0.0);
          legL.xy *= rot(dance * 0.8);
          float leftLeg = sdCapsule(legL, vec3(0.0), vec3(0.0, -1.0, 0.0), 0.2);
          
          vec3 legR = q - vec3(0.2, -1.0, 0.0);
          legR.xy *= rot(-dance * 0.8);
          float rightLeg = sdCapsule(legR, vec3(0.0), vec3(0.0, -1.0, 0.0), 0.2);
          
          // Combine figure
          float figure = min(body, head);
          figure = min(figure, leftArm);
          figure = min(figure, rightArm);
          figure = min(figure, leftLeg);
          figure = min(figure, rightLeg);
          
          d = min(d, figure);
      }
      
      // Ground plane (fire floor)
      float ground = p.y + 2.0;
      d = min(d, ground);
      
      if (d < 0.1) g_matID = 7.0; // Fire material
      return d;
  }

  
  float mapFishEye(vec3 p) { return mapSaturn(p*(1.0 + 0.15 * length(p)*length(p))); } 
  float mapOscilloCity(vec3 p) { return mapCity(p - vec3(0,0,uTime*10.0)); } 

  float map(vec3 p) {
      vec3 wp = applyWarp(p, g_warpMode);
      float d = MAX_DIST;
      g_matID = 0.0;
      
      if (g_sceneMode < 0.5) d = mapTessellation(wp);
      else if (g_sceneMode < 1.5) d = mapHyperspace(wp);
      else if (g_sceneMode < 2.5) d = mapCity(wp);
      else if (g_sceneMode < 3.5) d = mapSaturn(wp);
      else if (g_sceneMode < 4.5) d = mapInfiniteMirror(wp);
      else if (g_sceneMode < 5.5) d = mapPsychedelic(wp); 
      else if (g_sceneMode < 6.5) d = mapGyroscope(wp);
      else if (g_sceneMode < 7.5) d = mapMandala(wp); 
      else if (g_sceneMode < 8.5) d = mapMirrorDimension(wp);
      else if (g_sceneMode < 9.5) d = mapNeural(wp); 
      else if (g_sceneMode < 10.5) d = mapFishEye(wp); 
      else if (g_sceneMode < 11.5) d = mapQuantum(wp); 
      else if (g_sceneMode < 12.5) d = mapOscilloCity(wp);
      else if (g_sceneMode < 13.5) d = MAX_DIST; // Mode 13: Superformula (Raymarcher yields)
      else if (g_sceneMode < 14.5) d = mapDancingShadows(wp); // Mode 14: Dancing Shadows
      else d = mapSineWave(wp); 
      
      if (u3DOscilloscope > 0.5) {
          vec3 op = wp; op.z = mod(op.z + 10.0, 20.0) - 10.0;
          float u = clamp((op.x + 15.0) / 30.0, 0.0, 1.0);
          float wave = texture2D(uAudioTexture, vec2(u, 0.25)).r;
          float dOsc = length(vec2(op.y - (wave - 0.5) * 8.0, op.z)) - 0.2;
          if (u > 0.01 && u < 0.99 && dOsc < d) { d = dOsc; g_matID = 1.0; }
      }
      return d; 
  }

  // --- CAMERA ---
  // (Simplified for performance, moved detailed logic inside main or maintained)
  vec3 getCamPos(float t) {
      if (g_sceneMode > 12.5) return vec3(0.0, 0.0, 18.0);
      if (g_sceneMode > 11.5) return vec3(sin(t*0.1)*5.0, 15.0, -5.0); // OscilloCity
      if (g_sceneMode > 10.5) return vec3(0.0, 0.0, -t * 2.0); // Quantum
      if (g_sceneMode > 9.5) return vec3(sin(t*0.5), cos(t*0.3), 9.0); // Lens
      if (g_sceneMode > 8.5) return vec3(sin(t*0.3)*2.0, cos(t*0.4)*2.0, -t * 4.0); // Neural
      if (g_sceneMode > 7.5) return vec3(0.0, 0.0, sin(t)*2.0); // Mirror Dim
      if (g_sceneMode > 6.5) return vec3(0.0, 0.0, -9.0 + sin(uTime)*2.0); // Gyro
      if (g_sceneMode > 5.5) return vec3(sin(t*0.4)*14.0, cos(t*0.2)*5.0, cos(t*0.4)*14.0); // Mandala
      if (g_sceneMode > 4.5) return vec3(sin(t)*2.0, cos(t*0.7)*2.0, t*2.0); // Psych
      if (g_sceneMode > 3.5) return vec3(0.0, 0.0, -2.0); // Mirror Feedback
      if (g_sceneMode > 2.5) return vec3(cos(t*0.1)*25.0, 8.0+sin(t*0.2)*4.0, sin(t*0.1)*25.0); // Saturn
      if (g_sceneMode > 1.5) return vec3(sin(t*0.2)*10.0, 15.0, t*8.0); // City
      if (g_sceneMode > 0.5) return vec3(sin(t*0.5), cos(t*0.5), t*8.0); // Hyper
      return vec3(sin(t*0.1+0.3)*3.0, cos(t*0.15)*3.0, t*2.0); // Tess
  }
  
  vec3 getCamTgt(float t, vec3 ro) {
      if (g_sceneMode > 11.5) return vec3(ro.x*0.5, 14.0, 40.0);
      if (g_sceneMode > 10.5) return ro + vec3(0.0, 0.0, 5.0);
      if (g_sceneMode > 9.5) return vec3(0.0);
      if (g_sceneMode > 8.5) return ro + vec3(0.0, 0.0, -5.0);
      if (g_sceneMode > 7.5) return vec3(0.0, 0.0, 1.0);
      if (g_sceneMode > 3.5 && g_sceneMode < 4.5) return vec3(0.0, 0.0, 10.0);
      if (g_sceneMode > 1.5 && g_sceneMode < 2.5) return ro + vec3(0.0, -2.0, 30.0);
      if (g_sceneMode > 0.5 && g_sceneMode < 1.5) return ro + vec3(0.0, 0.0, 10.0);
      if (g_sceneMode < 0.5) return ro + vec3(0.0, 0.0, 5.0);
      return vec3(0.0);
  }

  // --- BUMP MAPPING (Surface Detail) ---
  vec3 bumpMap(vec3 p, vec3 n, float dist) {
      if (dist > 50.0) return n; // LOD
      
      // GeoDetail Mod: Scale of noise pattern
      float scale = 20.0 + uGeoDetail * 50.0;
      
      if (g_sceneMode < 0.5) scale = 40.0 + uGeoDetail * 20.0; // Finer for tessellation
      if (g_sceneMode > 8.5 && g_sceneMode < 9.5) scale = 10.0; // Neural
      
      float strength = 0.002 + uGeoDetail * 0.005; // Increase strength with detail
      vec2 e = vec2(0.001, 0.0);
      
      float n1 = noise(p * scale);
      float n2 = noise((p + e.xyy) * scale);
      float n3 = noise((p + e.yxy) * scale);
      float n4 = noise((p + e.yyx) * scale);
      
      vec3 grad = normalize(vec3(n2 - n1, n3 - n1, n4 - n1));
      return normalize(n - grad * strength); // Perturb normal
  }

  void main() {
      g_sceneMode = uSceneMode;
      g_warpMode = uWarpMode;
      
      // UVs
      vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;
      uv.x /= uStretch;
      
      // FX: AUDIO REACTIVE SHAKE
      if (uFxShake > 0.0) {
          float shakeAmount = uFxShake * (uHigh + uDrums) * 0.1; // Use drums for shake
          uv += (vec2(hash(uv + uTime), hash(uv - uTime)) - 0.5) * shakeAmount;
      }
      
      // FX: Optics
      if (uOptics > 0.5) uv *= (1.0 + 0.2 * dot(uv, uv));
      // FX: Blur/Jitter
      if (uBlur > 0.5) uv += (hash(uv + uTime) - 0.5) * 0.02;
      // FX: VHS
      if (uVHS > 0.5 && hash(vec2(uTime * 10.0, floor(gl_FragCoord.y / 4.0))) > 0.96) uv.x += 0.05;
      
      // --- IMAGE MODE 2D ---
      if (g_sceneMode > 3.5 && g_sceneMode < 4.5 && uHasTexture > 0.5 && false) {
          // DISABLED: Image Mode is now Mirror Feedback. 
          // Keeping block structure for logic safety if reverted.
      } 
      
      // --- RAYMARCHING ---
      vec3 ro = getCamPos(uTime);
      vec3 ta = getCamTgt(uTime, ro);
      
      vec3 fwd = normalize(ta - ro);
      vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
      vec3 up = cross(fwd, right);
      
      // --- MANUAL CAMERA PAN ---
      vec3 offset = right * uCamX + up * uCamY;
      ro += offset;
      ta += offset;
      
      // APPLY SWING (Rotation around Forward axis - Camera Roll)
      // This creates the "head banging" rhythmic feel
      float s = uSwing * 0.5; 
      float cs = cos(s);
      float ss = sin(s);
      vec3 r_new = right * cs - up * ss;
      vec3 u_new = right * ss + up * cs;
      right = r_new;
      up = u_new;
      
      if (g_sceneMode > 7.5 && g_sceneMode < 8.5) { // Mirror Dim roll
         float r = uTime * 0.1;
         right = right * cos(r) + up * sin(r);
         up = right * -sin(r) + up * cos(r);
      }

      float fov = (g_sceneMode > 4.5) ? 2.0 : 1.0;
      if (g_sceneMode > 11.5) fov = 1.2;
      fov /= uZoom;
      
      vec3 rd = normalize(fwd + (uv.x * right + uv.y * up) * fov);
      
      float d = hash(uv * 100.0) * 0.1; // Dither start
      float t = 0.0;
      bool hit = false;
      g_glow = 0.0;
      
      for(int i = 0; i < MAX_STEPS; i++) {
          vec3 p = ro + rd * d;
          t = map(p);
          // Accumulate Glow
          g_glow += 0.02 / (0.02 + t * t + abs(sin(p.y*0.5+uTime)*0.5)); 
          d += t * 0.8; // Slower march for quality
          if (abs(t) < SURF_DIST) { hit = true; g_hitPos = p; break; }
          if (d > MAX_DIST) break;
      }
      
      vec3 col = vec3(0.0);
      vec3 bg = getStars(rd) * 0.5;
      
      // --- BACKGROUNDS ---
      if (g_sceneMode > 11.5) { // City Sky
           float horiz = smoothstep(-0.1, 0.2, rd.y);
           bg = mix(getColorPalette(uTime * 0.1) * 0.5, vec3(0.01, 0.02, 0.05), horiz);
           bg += getStars(rd) * smoothstep(0.0, 0.2, rd.y);
      } else if (g_sceneMode > 4.5) {
           bg = getColorPalette(length(uv) + uTime * 0.1) * 0.1;
      }
      if (uHasTexture > 0.5 && g_sceneMode > 4.5) { // Texture BG override
           vec3 tex = texture2D(uUserTexture, uv * 0.5 + 0.5).rgb;
           if (uHueShift != 0.0) tex = rotateHue(tex, uHueShift);
           bg = mix(bg, tex, 0.5);
      }
      
      // --- SKYBOX VIDEO ---
      if (uHasVideo > 0.5) {
          // Map to screen space, center, and apply scaling
          vec2 screenUV = gl_FragCoord.xy / uResolution.xy;
          
          // VIDEO FX: WARP
          if (uVideoWarp > 0.0) {
              vec2 warp = vec2(sin(screenUV.y * 10.0 + uTime), cos(screenUV.x * 10.0 + uTime)) * 0.05 * uVideoWarp;
              screenUV += warp;
          }
          
          screenUV = (screenUV - 0.5) / uVideoScale + 0.5;
          
          // VIDEO FX: MIRROR (Kaleidoscope)
          if (uVideoMirror > 0.0) {
              vec2 mUV = abs(screenUV - 0.5) * 2.0; 
              screenUV = mix(screenUV, mUV, uVideoMirror);
          }
          
          // Clamp to avoid streaking at edges if zoomed out, or use if statement
          if (screenUV.x >= 0.0 && screenUV.x <= 1.0 && screenUV.y >= 0.0 && screenUV.y <= 1.0) {
              vec3 vid = vec3(0.0);
              
              // VIDEO FX: DIFFUSION (Box Blur)
              if (uVideoDiffusion > 0.0) {
                  float dist = uVideoDiffusion * 0.02; // Blur radius
                  vid += texture2D(uVideoTexture, screenUV).rgb;
                  vid += texture2D(uVideoTexture, screenUV + vec2(dist, 0.0)).rgb;
                  vid += texture2D(uVideoTexture, screenUV - vec2(dist, 0.0)).rgb;
                  vid += texture2D(uVideoTexture, screenUV + vec2(0.0, dist)).rgb;
                  vid += texture2D(uVideoTexture, screenUV - vec2(0.0, dist)).rgb;
                  vid /= 5.0;
              } else {
                  // VIDEO FX: GLITCH (RGB Split) only if diffusion is low/off to save perf or combine
                  if (uVideoGlitch > 0.0) {
                      float shift = uVideoGlitch * 0.03;
                      float r = texture2D(uVideoTexture, screenUV + vec2(shift, 0.0)).r;
                      float g = texture2D(uVideoTexture, screenUV).g;
                      float b = texture2D(uVideoTexture, screenUV - vec2(shift, 0.0)).b;
                      vid = vec3(r,g,b);
                  } else {
                      vid = texture2D(uVideoTexture, screenUV).rgb;
                  }
              }
              
              // VIDEO FX: DODGE (Luma)
              if (uVideoDodge > 0.0) {
                  float lum = dot(vid, vec3(0.299, 0.587, 0.114));
                  vid += vid * smoothstep(0.4, 1.0, lum) * uVideoDodge * 5.0; 
              }

              // VIDEO FX: PALETTE MIX (Tint)
              if (uVideoPaletteMix > 0.0) {
                  float lum = dot(vid, vec3(0.299, 0.587, 0.114));
                  vec3 pal = getColorPalette(lum * 2.0 + uTime * 0.1);
                  vid = mix(vid, pal, uVideoPaletteMix);
              }

              // VIDEO FX: FADE
              vid *= (1.0 - uVideoFade);

              // BLEND MODES
              if (uVideoBlendMode < 0.5) {
                  // 0: Replace (Default)
                  bg = vid;
              } else if (uVideoBlendMode < 1.5) {
                  // 1: Add (Linear Dodge)
                  bg += vid;
              } else if (uVideoBlendMode < 2.5) {
                  // 2: Screen
                  bg = 1.0 - (1.0 - bg) * (1.0 - vid);
              } else if (uVideoBlendMode < 3.5) {
                  // 3: Multiply
                  bg *= vid;
              } else if (uVideoBlendMode < 4.5) {
                  // 4: Overlay
                  // Standard Overlay formula: (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))
                  // Simplified/approx for now or use proper:
                  vec3 c;
                  c.r = bg.r < 0.5 ? (2.0 * bg.r * vid.r) : (1.0 - 2.0 * (1.0 - bg.r) * (1.0 - vid.r));
                  c.g = bg.g < 0.5 ? (2.0 * bg.g * vid.g) : (1.0 - 2.0 * (1.0 - bg.g) * (1.0 - vid.g));
                  c.b = bg.b < 0.5 ? (2.0 * bg.b * vid.b) : (1.0 - 2.0 * (1.0 - bg.b) * (1.0 - vid.b));
                  bg = c;
              } else if (uVideoBlendMode < 5.5) {
                  // 5: Color Dodge
                  // Formula: base / (1.0 - blend)
                  bg = bg / (vec3(1.0) - vid);
              } else {
                  // 6: Background (Behind Geometry)
                  // Simply replaces the initial sky/stars with the video.
                  // Since 'bg' is initialized with stars and then used to fill 
                  // the screen if !hit, this makes the video the true backdrop.
                  bg = vid;
              }

          } else {
              // Black bars for out of bounds, but only if replacing. 
              // If blending, we might want to keep underlying BG.
              // For now simpler:
              if (uVideoBlendMode < 0.5) bg = vec3(0.0);
          }
      }
      
      if (hit) {
          // --- LIGHTING & MATERIAL ---
          vec3 p = g_hitPos;
          
          // Calc Normal
          vec2 e = vec2(0.005, 0.0);
          vec3 n = normalize(vec3(
              map(p + e.xyy) - map(p - e.xyy),
              map(p + e.yxy) - map(p - e.yxy),
              map(p + e.yyx) - map(p - e.yyx)
          ));
          
          // Apply Bump Map for detail
          n = bumpMap(p, n, d);
          
          // Material Properties
          vec3 baseColor = getColorPalette(d * 0.05 + uTime * 0.05);
          float roughness = 0.5;
          float metallic = 0.0;
          
          if (g_matID == 6.0) { // Mirror / Metal
              baseColor = vec3(0.1); 
              roughness = 0.1;
              metallic = 1.0;
          } else if (g_matID == 2.0) { // City Building
              baseColor = vec3(0.1, 0.1, 0.15);
              roughness = 0.8;
          } else if (g_matID == 2.5) { // City Window
              baseColor = vec3(1.0, 0.8, 0.5) * 5.0 * uDrums; // Use snappy drums
              roughness = 0.0;
          } else if (g_matID == 5.0) { // Sine Neon
              baseColor = getColorPalette(p.x * 0.1 + uTime);
              roughness = 0.2;
              metallic = 0.5;
          } else if (g_matID == 1.0) { // Oscilloscope
               baseColor = vec3(0.1, 1.0, 0.5);
          } else if (g_matID == 7.0) { // Fire (Dancing Shadows)
              // Fire colors: orange, red, yellow
              float fireNoise = noise(p * 2.0 + uTime * 2.0);
              vec3 fireOrange = vec3(1.0, 0.4, 0.0);
              vec3 fireRed = vec3(1.0, 0.1, 0.0);
              vec3 fireYellow = vec3(1.0, 0.9, 0.0);
              baseColor = mix(fireOrange, fireRed, fireNoise);
              baseColor = mix(baseColor, fireYellow, uHigh * 0.5);
              baseColor *= (1.0 + uBeat * 2.0); // Pulse with beat
              roughness = 0.3;
              metallic = 0.0;
          }
          
          // Lighting Setup
          vec3 lightPos = ro + vec3(2.0, 5.0, -2.0);
          vec3 l = normalize(lightPos - p);
          vec3 v = -rd;
          vec3 h = normalize(l + v);
          
          // PBR-Lite
          float NdotL = max(dot(n, l), 0.0);
          float NdotV = max(dot(n, v), 0.001);
          float NdotH = max(dot(n, h), 0.0);
          
          // Diffuse
          vec3 diffuse = baseColor * NdotL;
          
          // Specular (Blinn-Phong)
          float specPower = mix(10.0, 100.0, 1.0 - roughness);
          float spec = pow(NdotH, specPower) * ((metallic + 0.2));
          
          // Fresnel (Rim)
          float fresnel = pow(1.0 - NdotV, 5.0);
          vec3 rim = vec3(1.0) * fresnel * (metallic * 0.5 + 0.5);
          
          // Ambient / Environment Reflection
          vec3 ref = reflect(rd, n);
          vec3 env = getColorPalette(ref.y * 2.0 + uTime) * 0.5 * (1.0 - roughness);
          if (g_sceneMode > 3.5 && g_sceneMode < 4.5) env *= 2.0; // Boost mirror mode
          
          // If Video loaded, reflection should use it (Environment Mapping)
          // Simplified Screen-Space Reflection for video
          if (uHasVideo > 0.5) {
             vec2 refUV = (gl_FragCoord.xy / uResolution.xy) + ref.xy * 0.1;
             
             // Apply Warp to Reflections too
             if (uVideoWarp > 0.0) {
                 vec2 warp = vec2(sin(refUV.y * 10.0 + uTime), cos(refUV.x * 10.0 + uTime)) * 0.05 * uVideoWarp;
                 refUV += warp;
             }
             
             refUV = (refUV - 0.5) / uVideoScale + 0.5;
             
             // Apply Mirror to Reflections
             if (uVideoMirror > 0.0) {
                vec2 mUV = abs(refUV - 0.5) * 2.0; 
                refUV = mix(refUV, mUV, uVideoMirror);
             }
             
             // Reuse fading/mixing logic for reflections if desired, or keep raw
             // For consistency, let's keep raw to make reflections "pop" or apply simple fade
             vec3 refVid = texture2D(uVideoTexture, refUV).rgb;
             refVid *= (1.0 - uVideoFade); // at least fade it if video is faded
             
             env = refVid * (1.0 - roughness) * 2.0;
          }
          
          col = diffuse + vec3(spec) + rim * 0.5 + env * metallic;
          
          // Add self-emission/glow for special mats
          if (g_matID == 2.5) col += baseColor; 
          
          // Distance Fog
          float fog = 1.0 - exp(-d * d * 0.0005);
          col = mix(col, bg, fog);
      } else {
          col = bg;
          
          // Hyperspace Dust
          if (g_sceneMode > 0.5 && g_sceneMode < 1.5 && uHasVideo < 0.5) {
              float dust = hash(uv + uTime * 10.0);
              if (dust > 0.99) col += vec3(1.0) * (dust - 0.99) * 100.0 * uHigh;
          }
      }
      
      // --- POST PROCESSING ---
      
      // 1. Volumetric Glow Add
      vec3 glowCol = getColorPalette(uTime * 0.1);
      if (g_sceneMode > 3.5 && g_sceneMode < 4.5) glowCol = vec3(0.2, 0.8, 1.0); // Mirror Blue
      if (g_matID == 2.5) glowCol = vec3(1.0, 0.6, 0.2); // Window Orange
      
      // FX: AUDIO REACTIVE BLOOM
      // Use uDrums for punchy reactive bloom instead of smoothed beat
      float reactiveBloom = uBloomIntensity + (uBloomReact * uDrums * 2.0);
      col += g_glow * glowCol * reactiveBloom * 0.05;
      
      // 2. Oscilloscope Overlay
      if (uOscilloscope > 0.5) {
          float waveY = texture2D(uAudioTexture, vec2(uv.x * 0.5 + 0.5, 0.25)).r;
          float y = 0.5 + (waveY - 0.5);
          float dist = abs(gl_FragCoord.y / uResolution.y - y);
          float beam = 0.002 / (dist + 0.0001);
          col += vec3(0.2, 1.0, 0.5) * beam;
      }

      // 3. Grading
      if (uHueShift != 0.0) col = rotateHue(col, uHueShift);
      vec3 gray = vec3(dot(col, vec3(0.299, 0.587, 0.114)));
      col = mix(gray, col, uVibrance);
      col = (col - 0.5) * uContrast + 0.5;
      col *= uBrightness;

      // 4. ACES Tone Mapping (The secret sauce)
      col = aces(col);
      
      // 5. Film Grain & Dithering (Smooth gradients)
      float grain = (hash(uv + uTime) - 0.5) * (uGrain + 0.05); // Always a little dither
      col += grain;
      
      // 6. Vignette
      vec2 vUv = uv * (1.0 - uv.yx); // simple vignette
      float vig = 1.0 - dot(uv, uv) * 0.2;
      col *= vig;
      
      // FX: AUDIO REACTIVE SOLARIZE / POLARIZE
      if (uFxSolarize > 0.0) {
          float sol = uFxSolarize * uMid; // Drive by Mids
          vec3 solarized = abs(col - 0.5) * 2.0;
          col = mix(col, solarized, sol);
      }
      
      // FX: AUDIO REACTIVE NEGATIVE FLASH
      if (uFxFlash > 0.0) {
          float flash = smoothstep(0.8, 1.0, uDrums) * uFxFlash; // Use Drums for Flash too
          col = mix(col, 1.0 - col, flash);
      }

      // 7. Transition Flash
      col += vec3(smoothstep(0.8, 1.0, uTransition));

      gl_FragColor = vec4(col, 1.0);
  }
`;

export const particleVertexShader = `
  uniform float uTime;
  uniform float uBeat;
  uniform float uLow;
  uniform float uHigh;
  
  attribute float size;
  attribute vec3 random;
  
  varying vec3 vColor;
  
  void main() {
    vColor = random;
    vec3 pos = position;
    
    // Simple movement
    float time = uTime * (0.1 + random.x * 0.2);
    pos.x += sin(time * random.y + position.y) * 0.5;
    pos.y += cos(time * random.z + position.x) * 0.5;
    pos.z += sin(time * 0.5 + position.z) * (1.0 + uLow * 5.0);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (10.0 + uHigh * 20.0) * (10.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleFragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    float alpha = 1.0 - (r * 2.0);
    alpha = pow(alpha, 1.5);
    
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// --- SUPERFORMULA SHADERS ---

// Exported Chunks for Injection (MeshStandardMaterial)
export const superformulaFunctions = `
  #define PI 3.14159265359

  // Rotation Matrix
  mat2 rot(float a) {
      float s = sin(a);
      float c = cos(a);
      return mat2(c, -s, s, c);
  }

  // Gielis Formula
  float superformula(float phi, float m, float n1, float n2, float n3, float a, float b) {
    float t1 = abs(cos(m * phi / 4.0) / a);
    t1 = pow(t1, n2);
    float t2 = abs(sin(m * phi / 4.0) / b);
    t2 = pow(t2, n3);
    float r = pow(t1 + t2, -1.0 / n1);
    return r;
  }
`;

export const warpFunctions = `
  vec3 applyWarp(vec3 p, float mode, float time, float low, float mid, float high) {
      // 0: None
      if (mode < 0.5) return p;

      // 1: Liquid
      if (mode < 1.5) {
          float t = time * 0.5;
          float flow = 0.5 + low * 0.5;
          p.x += sin(p.z * 1.0 + t) * flow;
          p.y += cos(p.z * 0.8 + t) * flow;
          return p;
      }

      // 2: Bend
      if (mode < 2.5) {
          float t = time * 0.5;
          p.xz *= rot(p.y * 0.5 + t);
          p.x += sin(p.y * 2.0 + t) * mid;
          return p;
      }

      // 3: Kaleidoscope (Sym)
      if (mode < 3.5) {
          p.xy = abs(p.xy);
          p.xy *= rot(time * 0.2);
          p.xy = abs(p.xy); 
          p.z += sin(length(p.xy) * 5.0 - time) * 0.2;
          return p;
      }

      // 4: Portal (Twist)
      float angle = length(p.xy) * 2.0 + time;
      p.xy *= rot(angle);
      p.z += sin(angle) * high;
      return p;
  }
`;

export const superformulaVertexShader = `
  uniform float uTime;
  uniform float uGeoScale;     
  uniform float uGeoDeform;    
  uniform float uGeoThickness; 
  uniform float uGeoDetail;    
  uniform float uBeat;
  uniform float uLow;
  uniform float uMid;          
  uniform float uHigh;
  uniform float uWarpMode;     
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vDisplace;

  ` + superformulaFunctions + warpFunctions + `

  void main() {
    vUv = uv;
    vNormal = normal;

    // Map Props to Formula Parameters
    float m = 2.0 + floor(uGeoScale * 18.0); 
    if (m < 2.0) m = 0.0; 
    
    float n1 = 0.2 + uGeoDeform * 5.0;
    float n2 = 0.5 + uGeoThickness * 5.0;
    float n3 = n2;

    float m_anim = m + sin(uTime * 0.5) * uLow * 2.0;
    float n1_anim = n1 + sin(uTime) * uBeat * 0.5;

    vec3 p = position;
    float r = length(p);
    float longitude = atan(p.y, p.x); 
    float latitude = acos(p.z / r);   
    
    float r1 = superformula(longitude, m_anim, n1_anim, n2, n3, 1.0, 1.0);
    float r2 = superformula(latitude, m_anim, n1_anim, n2, n3, 1.0, 1.0);
    float finalR = r1 * r2;
    
    vec3 newPos = normalize(p) * finalR;
    newPos *= (1.0 + uLow * 0.2);
    
    // Pass args to warp (uniforms not available in chunk context if strictly pure, but here we inline)
    newPos = applyWarp(newPos, uWarpMode, uTime, uLow, uMid, uHigh);

    vDisplace = finalR;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

export const superformulaFragmentShader = `
  uniform float uTime;
  uniform float uPaletteMode;
  uniform float uLow;
  uniform float uHigh;
  uniform float uHue;
  uniform float uSat;
  uniform float uBright;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vDisplace;

  // Reuse Palette from main shader (duplicated for standalone)
  vec3 getColorPalette(float t) {
      vec3 a, b, c, d;
      // 0: CYBER
      if (uPaletteMode < 0.5) { a = vec3(0.5); b = vec3(0.5); c = vec3(1.0); d = vec3(0.0, 0.33, 0.67); }
      // 1: INFERNO
      else if (uPaletteMode < 1.5) { a = vec3(0.8, 0.5, 0.4); b = vec3(0.2, 0.4, 0.2); c = vec3(2.0, 1.0, 1.0); d = vec3(0.0, 0.25, 0.25); }
      // 2: TOXIC
      else if (uPaletteMode < 2.5) { a = vec3(0.2, 0.7, 0.4); b = vec3(0.6, 0.2, 0.6); c = vec3(1.0); d = vec3(0.0, 0.33, 0.67); }
      // 3: CANDY
      else if (uPaletteMode < 3.5) { a = vec3(0.5); b = vec3(0.5); c = vec3(1.0); d = vec3(0.3, 0.20, 0.20); }
      // 4: GOLDEN
      else { a = vec3(1.0, 0.8, 0.5); b = vec3(0.5, 0.3, 0.1); c = vec3(1.0); d = vec3(0.0, 0.10, 0.20); }
      return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    // Basic lighting
    vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    
    // Color based on displacement + Hue Shift (via palette cycling)
    vec3 col = getColorPalette(vDisplace * 0.5 + uTime * 0.2 + uHue);
    
    // Saturation
    float gray = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(gray), col, uSat);
    
    // Rim Light
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0)); // Simplified View
    float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
    rim = pow(rim, 3.0);
    
    col += vec3(1.0) * rim * 0.5;
    col *= (0.5 + diff * 0.5);
    
    // Audio Flash
    col += uHigh * 0.5 * vec3(1.0, 1.0, 1.0) * rim;
    
    // Brightness
    col *= uBright;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const superformulaInstancedVertexShader = `
uniform float uTime;
uniform float uLow;
uniform float uMid;
uniform float uHigh;
uniform float uEnergy;
uniform float uReactivity;
uniform float uDistortion;
uniform float uFlow;

// Arrays for History/Echoes (Size 9)
uniform float uM1[9];
uniform float uN11[9];
uniform float uN21[9];
uniform float uN31[9];
uniform float uA1[9];
uniform float uB1[9];

uniform float uM2[9];
uniform float uN12[9];
uniform float uN22[9];
uniform float uN32[9];
uniform float uA2[9];
uniform float uB2[9];

uniform float uTopology[9];

// Instance specific state passed via Uniforms
uniform float uInstanceScale[9]; // Expansion
uniform float uInstanceAlpha[9]; // Opacity

varying vec2 vUv;
varying float vDisplacement;
varying vec3 vNormal;
varying float vNoise;
varying vec3 vViewPosition;
varying float vSpike;
varying float vAlpha; // Pass opacity to frag
attribute float instanceID;

// Simplex 3D Noise 
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

float superformula(float phi, float m, float n1, float n2, float n3, float a, float b) {
  float t1 = abs(cos(m * phi / 4.0) / a);
  t1 = pow(t1, n2);
  float t2 = abs(sin(m * phi / 4.0) / b);
  t2 = pow(t2, n3);
  float r = pow(t1 + t2, -1.0 / n1);
  return r;
}

void main() {
  vUv = uv;
  
  // We use instanceID attribute to fetch parameters from uniform arrays
  int id = int(instanceID);
  
  float iScale = uInstanceScale[id];
  vAlpha = uInstanceAlpha[id];
  float iTopo = uTopology[id];
  
  // Coordinate Mapping
  float phi = uv.x * 2.0 * 3.14159;
  float theta = (uv.y - 0.5) * 3.14159; 

  // Audio reactivity (Applied mostly to live instance 0, but echoes get some ripple)
  float audioMod = (uLow * 0.5 + uMid * 0.3 + uHigh * 0.2) * uReactivity;
  
  // Superformula Calculation using indexed uniforms
  float r1 = superformula(phi, uM1[id], uN11[id] + (uHigh * uReactivity * 2.0), uN21[id], uN31[id], uA1[id], uB1[id]);
  float r2 = superformula(theta, uM2[id], uN12[id] + (uLow * uReactivity * 2.0), uN22[id], uN32[id], uA2[id], uB2[id]);
  
  // --- DISTORTION & SPIKES ---
  vec3 noisePos = vec3(cos(theta)*cos(phi), cos(theta)*sin(phi), sin(theta));
  
  float noiseIntensity = uDistortion + (uHigh * uReactivity * uDistortion);
  float noiseVal = snoise(noisePos * 3.0 + uTime);
  vNoise = noiseVal;

  float spikeFreq = 50.0;
  float spikeVal = sin(vUv.y * spikeFreq + uTime * 20.0) * cos(vUv.x * spikeFreq);
  float spikeAmp = (uMid * 0.5 + uHigh * 0.8) * uReactivity * 0.5;
  vSpike = spikeVal * spikeAmp;

  vec3 finalPos;
  
  if (iTopo < 0.5) {
     // --- SPHERICAL ---
     float r = r1 * r2;
     r *= (1.0 + (uLow * uReactivity * 0.5));
     r += noiseVal * noiseIntensity + vSpike;
     vDisplacement = r;
     finalPos.x = r * cos(theta) * cos(phi);
     finalPos.y = r * cos(theta) * sin(phi);
     finalPos.z = r * sin(theta);
     
  } else if (iTopo < 1.5) {
     // --- TOROIDAL ---
     float R = 2.0; 
     float rad = r2 * (1.0 + noiseVal * noiseIntensity + vSpike);
     float ringMod = r1; 
     vDisplacement = rad; 
     finalPos.x = ringMod * (R + rad * cos(theta)) * cos(phi);
     finalPos.y = ringMod * (R + rad * cos(theta)) * sin(phi);
     finalPos.z = rad * sin(theta);
     
  } else if (iTopo < 2.5) {
     // --- CYLINDRICAL (Tunnel) ---
     float rad = r1 * (1.0 + noiseVal * noiseIntensity + vSpike);
     float profile = r2; 
     rad *= profile;
     vDisplacement = rad;
     finalPos.x = rad * cos(phi);
     finalPos.z = rad * sin(phi);
     finalPos.y = (vUv.y - 0.5) * 6.0; 
     
  } else if (iTopo < 3.5) {
     // --- PLANE (Terrain) ---
     float height = (r1 * r2);
     height *= (1.0 + (uLow * uReactivity)); 
     height += noiseVal * noiseIntensity + vSpike;
     vDisplacement = height;
     finalPos.x = (vUv.x - 0.5) * 8.0;
     finalPos.y = (vUv.y - 0.5) * 8.0;
     finalPos.z = height;
     
  } else if (iTopo < 4.5) {
     // --- MOBIUS STRIP ---
     float u = uv.x * 2.0 * 3.14159; 
     float v = (uv.y - 0.5) * 2.0; 
     
     v *= r2; 
     float R = 2.0 + (r1 * 0.5); 
     
     v += noiseVal * noiseIntensity + vSpike;
     vDisplacement = v;

     finalPos.x = (R + v * cos(u/2.0)) * cos(u);
     finalPos.y = (R + v * cos(u/2.0)) * sin(u);
     finalPos.z = v * sin(u/2.0);
     
  } else if (iTopo < 5.5) {
     // --- KLEIN BOTTLE (Figure 8) ---
     float u = uv.x * 2.0 * 3.14159;
     float v = uv.y * 2.0 * 3.14159;
     
     float rad = 2.0 + (r2 * 0.5); // Modulate base radius
     
     float cosU = cos(u);
     float sinU = sin(u);
     float cosV = cos(v);
     float sinV = sin(v);
     float sin2V = sin(2.0*v);
     float cosHalfU = cos(u/2.0);
     float sinHalfU = sin(u/2.0);
     
     // Modulate thickness with r1
     float thickness = r1 * 0.5 * (1.0 + noiseVal * noiseIntensity);
     
     finalPos.x = (rad + thickness * cosHalfU * sinV - thickness * sinHalfU * sin2V) * cosU;
     finalPos.y = (rad + thickness * cosHalfU * sinV - thickness * sinHalfU * sin2V) * sinU;
     finalPos.z = thickness * sinHalfU * sinV + thickness * cosHalfU * sin2V;
     
     vDisplacement = thickness;
     
  } else if (iTopo < 6.5) {
     // --- KNOT (Trefoil variation) ---
     float t = phi * 2.0; // Wrap twice for complexity
     float tubeAngle = theta;
     
     // Trefoil core path
     float R = 2.5;
     float P = 2.0;
     float Q = 3.0;
     
     // Core curve
     float cx = (R + cos(Q * t)) * cos(P * t);
     float cy = (R + cos(Q * t)) * sin(P * t);
     float cz = sin(Q * t);
     
     // Tube radius modulated by shape 2
     float tubeR = 0.6 * r2 * (1.0 + noiseVal * noiseIntensity);
     
     // Approximate Frenet frame for tube extrusion (simplified)
     vec3 normal = normalize(vec3(cos(P*t)*cos(tubeAngle), sin(P*t)*cos(tubeAngle), sin(tubeAngle)));
     
     // Displace along normal by superformula 1 (r1)
     tubeR *= r1;
     
     finalPos = vec3(cx, cy, cz) + normal * tubeR;
     
     // Add some audio spikes to Z
     finalPos.z += vSpike * 2.0;
     
     vDisplacement = tubeR;
     
  } else if (iTopo < 7.5) {
     // --- CONE (Hourglass/Vortex) ---
     float h = (vUv.y - 0.5) * 6.0; // Height
     float t = phi;
     
     float baseR = 0.5 + abs(h) * 0.8; 
     float rad = baseR * r1; // Modulate cross section
     rad *= (1.0 + noiseVal * noiseIntensity); // Add noise
     float swirl = h * 1.0; 
     
     finalPos.x = rad * cos(t + swirl);
     finalPos.z = rad * sin(t + swirl);
     finalPos.y = h + (vSpike * 0.5); // Spike vertically
     
     vDisplacement = rad;

  } else if (iTopo < 8.5) {
     // --- LISSAJOUS 3D ---
     // Uses Shape 1 params (m, n1, n2) as frequency multipliers for chaos
     float t = uv.x * 6.28 * 2.0; // Long curve
     float tubePhi = uv.y * 6.28;
     
     // Lissajous frequencies derived from Shape 1 params for interactivity
     float fx = 3.0 + floor(mod(uM1[id], 5.0));
     float fy = 4.0 + floor(mod(uN11[id], 5.0));
     float fz = 5.0 + floor(mod(uN21[id], 5.0));
     
     // Core curve
     float scale = 2.5;
     vec3 curve;
     curve.x = sin(fx * t + uTime * 0.2);
     curve.y = cos(fy * t);
     curve.z = sin(fz * t + uTime * 0.1);
     curve *= scale;

     // Tube thickness modulated by Shape 2 and Audio
     float r = 0.3 * r2 * (1.0 + vSpike);
     
     // Simple tube expansion
     finalPos = curve + vec3(r * cos(tubePhi), r * sin(tubePhi), 0.0);
     vDisplacement = r;

  } else if (iTopo < 9.5) {
     // --- SHELL (Logarithmic Spiral) ---
     // uM1 controls spiral tightness, uN11 controls opening rate
     float t = uv.x * 20.0; // Number of windings
     float v = uv.y * 6.28;
     
     float tightness = 0.1 + (uM1[id] * 0.02);
     float growth = exp(tightness * t);
     
     float scale = 0.1;
     
     // Spiral base
     float rx = scale * growth * cos(t);
     float ry = scale * growth * sin(t);
     float rz = -scale * growth; // Move down as it grows
     
     // Cross section modulated by r1
     float crossR = scale * growth * (0.5 + (r1 * 0.5));
     
     finalPos.x = rx + crossR * cos(t) * cos(v);
     finalPos.y = ry + crossR * sin(t) * cos(v);
     finalPos.z = rz + crossR * sin(v);
     
     // Apply audio noise
     finalPos += vNormal * vSpike;
     vDisplacement = crossR;

  } else {
     // --- HYPERBOLOID (Twisted Saddle) ---
     // One-sheet hyperboloid: x^2 + y^2 - z^2 = 1
     float u = (uv.x - 0.5) * 4.0;
     float v = uv.y * 6.28;
     
     // Waist size modulated by uA1
     float a = 0.5 + (uA1[id] * 0.5);
     
     // Calculate radius at height u
     float r = a * sqrt(1.0 + u*u);
     
     // Superformula r1 modulates the circular cross-section
     r *= r1;
     
     // Add noise/spike
     r += vSpike + (noiseVal * noiseIntensity);
     
     finalPos.x = r * cos(v);
     finalPos.y = r * sin(v);
     finalPos.z = u * 2.0; // Height
     
     // Twist effect driven by uM2 (Shape 2) and Time
     float twist = u * (uM2[id] * 0.5 + sin(uTime) * 0.5);
     float cT = cos(twist);
     float sT = sin(twist);
     
     float tx = finalPos.x * cT - finalPos.y * sT;
     float ty = finalPos.x * sT + finalPos.y * cT;
     finalPos.x = tx;
     finalPos.y = ty;
     
     vDisplacement = r;
  }

  // --- FLUID SIMULATION (Domain Warping) ---
  if (uFlow > 0.01) {
     float t = uTime * 0.5;
     vec3 flowOffset;
     // Sample noise at different offsets for each axis to create swirling
     flowOffset.x = snoise(finalPos + vec3(0.0, t, 0.0));
     flowOffset.y = snoise(finalPos + vec3(43.0, t, 43.0));
     flowOffset.z = snoise(finalPos + vec3(-43.0, t, -43.0));
     
     // Mix the flow based on uFlow and high frequency audio (turbulence)
     float turbulence = uFlow * (1.0 + uHigh * uReactivity);
     finalPos += flowOffset * turbulence;
  }
  
  // -- APPLY INSTANCE SCALE --
  // We apply the echo scale here on vertex position
  finalPos *= iScale;

  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  vNormal = normalize(finalPos); 
  vViewPosition = -mvPosition.xyz;
}
`;

export const superformulaInstancedFragmentShader = `
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;
uniform float uColorShift;
uniform float uLow;
uniform float uMid;
uniform float uHigh;
uniform float uRimStrength;
uniform float uScanlines;
uniform float uReactivity;

varying vec2 vUv;
varying float vDisplacement;
varying vec3 vNormal;
varying float vNoise;
varying vec3 vViewPosition;
varying float vSpike;
varying float vAlpha;

vec3 hueShift(vec3 color, float hue) {
    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(hue);
    return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

void main() {
  // Base Gradient with movement
  float gradPos = vUv.y + sin(uTime * 0.5 + vDisplacement * 0.2);
  vec3 baseColor = mix(uColor1, uColor2, gradPos);
  
  // --- COLOR SHIFT ---
  float shiftAmount = uColorShift * 6.28 + (uLow * uColorShift * 2.0);
  vec3 color = hueShift(baseColor, shiftAmount);

  // --- REACTIVE FLASH / STROBE ---
  float strobe = smoothstep(0.6, 1.0, uHigh) * uReactivity;
  color = mix(color, vec3(1.0), strobe * 0.5);

  // --- RIM LIGHTING (Fresnel) ---
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vNormal);
  
  float fresnel = 1.0 - abs(dot(viewDir, normal));
  fresnel = pow(fresnel, 2.0); 
  
  float dynamicRim = uRimStrength + (uLow * uReactivity * 5.0);
  color += vec3(fresnel * dynamicRim * 0.8);
  
  // --- SCANLINES / GRID ---
  float scanOffset = uTime * 5.0 + (uMid * uReactivity * 10.0);
  float scanline = sin(vUv.y * 100.0 + scanOffset) * 0.5 + 0.5;
  color = mix(color, color * (0.5 + 0.5 * scanline), uScanlines);

  // Detail
  color += vec3(vNoise * 0.05);
  color += vec3(abs(vSpike) * 2.0); 
  color += vec3(vDisplacement * 0.05);
  
  // Apply Instance Alpha (for echoes)
  gl_FragColor = vec4(color, vAlpha);
}
`;