# Leo Growth Log - June 28, 2026

## Insights & Preferences Learned
*   **GPU-Side Animation Integrity**: Jimmy prioritizes performance: visualizer math, Superformula shapes, and vertex transformations must run entirely on the GPU (via Three.js `InstancedMesh` and custom GLSL vertex/fragment shaders) rather than processing coordinate updates on the CPU.
*   **CSS Isolation**: When integrating TailwindCSS into pre-existing, custom-styled web applications, always load the CDN with `preflight: false` (and guard the initialization script for offline scenarios) to avoid breaking custom UI styling rules.
*   **Console Hygiene**: Suppress transient browser console warnings (such as HTML5 `<video>` elements throwing `Empty src attribute` before their source is initialized) to keep logs clean and diagnostic-friendly.
*   **Zero-Waste Event Sync**: For high-frequency musical trigger reactions (like looper pad or key hits), update animation uniform ref values directly inside event listeners instead of setting React states. This avoids costly React layout calculations, preventing glitches during dense drum patterns.
*   **Immersive Background VJ Layout**: Fullscreen visualizers placed behind hardware racks with semi-transparent glassmorphism panels (`background: rgba(..., 0.72)`, `backdrop-filter: blur(...)`) achieve a premium layout where the music interface stands out clearly, while the canvas shines underneath.
