(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/ui/ColorBends.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ColorBends
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const MAX_COLORS = 8;
const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer; // in NDC [-1,1]
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3); // strong response across 0..1
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-6.0 / exp(6.0 * m));
            sumCol += uColors[i] * w;
            cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-6.0 / exp(6.0 * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    gl_FragColor = vec4(rgb, a);
}
`;
const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;
function ColorBends({ className, style, rotation = 45, speed = 0.2, colors = [], transparent = true, autoRotate = 0, scale = 1, frequency = 1, warpStrength = 1, mouseInfluence = 1, parallax = 0.5, noise = 0.1 }) {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rendererRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const materialRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const resizeObserverRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rotationRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(rotation);
    const autoRotateRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(autoRotate);
    const pointerTargetRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Vector2(0, 0));
    const pointerCurrentRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Vector2(0, 0));
    const pointerSmoothRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(8);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorBends.useEffect": ()=>{
            const container = containerRef.current;
            const scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Scene();
            const camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.PlaneGeometry(2, 2);
            const uColorsArray = Array.from({
                length: MAX_COLORS
            }, {
                "ColorBends.useEffect.uColorsArray": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Vector3(0, 0, 0)
            }["ColorBends.useEffect.uColorsArray"]);
            const material = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.ShaderMaterial({
                vertexShader: vert,
                fragmentShader: frag,
                uniforms: {
                    uCanvas: {
                        value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Vector2(1, 1)
                    },
                    uTime: {
                        value: 0
                    },
                    uSpeed: {
                        value: speed
                    },
                    uRot: {
                        value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Vector2(1, 0)
                    },
                    uColorCount: {
                        value: 0
                    },
                    uColors: {
                        value: uColorsArray
                    },
                    uTransparent: {
                        value: transparent ? 1 : 0
                    },
                    uScale: {
                        value: scale
                    },
                    uFrequency: {
                        value: frequency
                    },
                    uWarpStrength: {
                        value: warpStrength
                    },
                    uPointer: {
                        value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Vector2(0, 0)
                    },
                    uMouseInfluence: {
                        value: mouseInfluence
                    },
                    uParallax: {
                        value: parallax
                    },
                    uNoise: {
                        value: noise
                    }
                },
                premultipliedAlpha: true,
                transparent: true
            });
            materialRef.current = material;
            const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Mesh(geometry, material);
            scene.add(mesh);
            const renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.WebGLRenderer({
                antialias: false,
                powerPreference: 'high-performance',
                alpha: true
            });
            rendererRef.current = renderer;
            renderer.outputColorSpace = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.SRGBColorSpace;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.setClearColor(0x000000, transparent ? 0 : 1);
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
            renderer.domElement.style.display = 'block';
            container.appendChild(renderer.domElement);
            const clock = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Clock();
            const handleResize = {
                "ColorBends.useEffect.handleResize": ()=>{
                    const w = container.clientWidth || 1;
                    const h = container.clientHeight || 1;
                    renderer.setSize(w, h, false);
                    material.uniforms.uCanvas.value.set(w, h);
                }
            }["ColorBends.useEffect.handleResize"];
            handleResize();
            if ('ResizeObserver' in window) {
                const ro = new ResizeObserver(handleResize);
                ro.observe(container);
                resizeObserverRef.current = ro;
            } else {
                window.addEventListener('resize', handleResize);
            }
            const loop = {
                "ColorBends.useEffect.loop": ()=>{
                    const dt = clock.getDelta();
                    const elapsed = clock.elapsedTime;
                    material.uniforms.uTime.value = elapsed;
                    const deg = rotationRef.current % 360 + autoRotateRef.current * elapsed;
                    const rad = deg * Math.PI / 180;
                    const c = Math.cos(rad);
                    const s = Math.sin(rad);
                    material.uniforms.uRot.value.set(c, s);
                    const cur = pointerCurrentRef.current;
                    const tgt = pointerTargetRef.current;
                    const amt = Math.min(1, dt * pointerSmoothRef.current);
                    cur.lerp(tgt, amt);
                    material.uniforms.uPointer.value.copy(cur);
                    renderer.render(scene, camera);
                    rafRef.current = requestAnimationFrame(loop);
                }
            }["ColorBends.useEffect.loop"];
            rafRef.current = requestAnimationFrame(loop);
            return ({
                "ColorBends.useEffect": ()=>{
                    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
                    if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
                    else window.removeEventListener('resize', handleResize);
                    geometry.dispose();
                    material.dispose();
                    renderer.dispose();
                    if (renderer.domElement && renderer.domElement.parentElement === container) {
                        container.removeChild(renderer.domElement);
                    }
                }
            })["ColorBends.useEffect"];
        }
    }["ColorBends.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorBends.useEffect": ()=>{
            const material = materialRef.current;
            const renderer = rendererRef.current;
            if (!material) return;
            rotationRef.current = rotation;
            autoRotateRef.current = autoRotate;
            material.uniforms.uSpeed.value = speed;
            material.uniforms.uScale.value = scale;
            material.uniforms.uFrequency.value = frequency;
            material.uniforms.uWarpStrength.value = warpStrength;
            material.uniforms.uMouseInfluence.value = mouseInfluence;
            material.uniforms.uParallax.value = parallax;
            material.uniforms.uNoise.value = noise;
            const toVec3 = {
                "ColorBends.useEffect.toVec3": (hex)=>{
                    const h = hex.replace('#', '').trim();
                    const v = h.length === 3 ? [
                        parseInt(h[0] + h[0], 16),
                        parseInt(h[1] + h[1], 16),
                        parseInt(h[2] + h[2], 16)
                    ] : [
                        parseInt(h.slice(0, 2), 16),
                        parseInt(h.slice(2, 4), 16),
                        parseInt(h.slice(4, 6), 16)
                    ];
                    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Vector3(v[0] / 255, v[1] / 255, v[2] / 255);
                }
            }["ColorBends.useEffect.toVec3"];
            const arr = (colors || []).filter(Boolean).slice(0, MAX_COLORS).map(toVec3);
            for(let i = 0; i < MAX_COLORS; i++){
                const vec = material.uniforms.uColors.value[i];
                if (i < arr.length) vec.copy(arr[i]);
                else vec.set(0, 0, 0);
            }
            material.uniforms.uColorCount.value = arr.length;
            material.uniforms.uTransparent.value = transparent ? 1 : 0;
            if (renderer) renderer.setClearColor(0x000000, transparent ? 0 : 1);
        }
    }["ColorBends.useEffect"], [
        rotation,
        autoRotate,
        speed,
        scale,
        frequency,
        warpStrength,
        mouseInfluence,
        parallax,
        noise,
        colors,
        transparent
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ColorBends.useEffect": ()=>{
            const material = materialRef.current;
            const container = containerRef.current;
            if (!material || !container) return;
            const handlePointerMove = {
                "ColorBends.useEffect.handlePointerMove": (e)=>{
                    const rect = container.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / (rect.width || 1) * 2 - 1;
                    const y = -((e.clientY - rect.top) / (rect.height || 1) * 2 - 1);
                    pointerTargetRef.current.set(x, y);
                }
            }["ColorBends.useEffect.handlePointerMove"];
            container.addEventListener('pointermove', handlePointerMove);
            return ({
                "ColorBends.useEffect": ()=>{
                    container.removeEventListener('pointermove', handlePointerMove);
                }
            })["ColorBends.useEffect"];
        }
    }["ColorBends.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: `color-bends-container ${className}`,
        style: style
    }, void 0, false, {
        fileName: "[project]/app/ui/ColorBends.tsx",
        lineNumber: 309,
        columnNumber: 10
    }, this);
}
_s(ColorBends, "1RRNKepfqTAyKhfYAEjyJC34N9c=");
_c = ColorBends;
var _c;
__turbopack_context__.k.register(_c, "ColorBends");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_ui_ColorBends_tsx_3be4d440._.js.map