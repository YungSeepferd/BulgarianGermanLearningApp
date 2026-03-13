# External Libraries and Resources Reference

## Component Libraries

### [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte) | [Website](https://shadcn-svelte.com)
**Description:** Beautifully designed components built with Svelte 5 runes, Tailwind CSS, and Bits-UI primitives. Copy-paste accessible, customizable components for building modern web applications.

**Key Features:**
- 40+ accessible components
- Svelte 5 runes-based architecture
- Tailwind CSS styling
- Fully customizable (copy-paste, not dependency)
- Dark mode support
- TypeScript support
- Form validation ready

**Installation:**
```bash
npx shadcn-svelte@latest init
npx shadcn-svelte@latest add button
```

---

### [bits-ui](https://github.com/huntabyte/bits-ui) | [Website](https://bits-ui.com)
**Description:** Headless, accessible, and unstyled Svelte 5 UI primitives. The foundation for shadcn-svelte and other component libraries.

**Key Features:**
- Headless (bring your own styles)
- Full accessibility (WAI-ARIA compliant)
- Svelte 5 runes-based
- 30+ primitive components
- Customizable behavior
- No styling opinions

**Installation:**
```bash
npm install bits-ui
```

---

## Visualization & Graphics Libraries

### [Svelte Flow](https://svelteflow.dev/)
**Description:** A library for building node-based applications with Svelte. Build interactive diagrams, flowcharts, visual workflows, and node editors.

**Key Features:**
- Node-based graph visualization
- Pan, zoom, and drag interactions
- Custom node types
- Edge routing and styling
- Minimap support
- Background patterns
- Grid snapping
- Touch support

**Use Cases:**
- Grammar structure visualization
- Learning path flows
- Vocabulary relationship graphs
- Exercise flow builders

**Installation:**
```bash
npm install @xyflow/svelte
```

---

### [Layer Cake](https://layercake.graphics/)
**Description:** A graphics framework for Svelte with a declarative, component-based API for building data visualizations. Think of it as the Svelte equivalent of D3 or Recharts.

**Key Features:**
- Component-based chart system
- Scales and layouts handled automatically
- Responsive by default
- SSR compatible
- Extensive layer system
- Works with canvas, SVG, or WebGL

**Use Cases:**
- Learning progress charts
- Vocabulary mastery visualization
- Study time analytics
- CEFR level distribution

**Installation:**
```bash
npm install layercake
```

---

### [LayerChart](https://github.com/techniq/layerchart)
**Description:** A high-level charting library built on Layer Cake. Provides pre-built, customizable chart components.

**Key Features:**
- Pre-built chart types (Bar, Line, Area, Pie, etc.)
- Built on Layer Cake foundation
- Svelte 5 compatible
- Highly customizable
- Animation support
- TypeScript support

**Use Cases:**
- Dashboard statistics
- Progress tracking
- Comparative analytics

**Installation:**
```bash
npm install layerchart
```

---

## Map Libraries

### [svelte-maplibre](https://svelte-maplibre.imfeld.dev/)
**Description:** Svelte bindings for MapLibre GL JS. Create interactive maps with vector tiles.

**Key Features:**
- MapLibre GL JS integration
- Vector tile support
- Custom markers and popups
- Geolocation support
- Map controls
- Layer management

**Use Cases:**
- Cultural geography lessons
- Regional vocabulary exploration
- Travel scenario practice

**Installation:**
```bash
npm install svelte-maplibre maplibre-gl
```

---

### [svelte-maplibre-gl](https://svelte-maplibre-gl.mierune.dev/)
**Description:** Alternative Svelte components for MapLibre GL JS with different API design.

**Key Features:**
- Declarative component API
- Full MapLibre feature support
- Reactive props
- Event handling
- Custom layer components

**Installation:**
```bash
npm install svelte-maplibre-gl maplibre-gl
```

---

## Animation & 3D

### [Threlte](https://threlte.xyz/) | [GitHub](https://github.com/threlte/threlte)
**Description:** Svelte wrapper for Three.js - build 3D scenes declaratively with Svelte components.

**Key Features:**
- Declarative Three.js scenes
- Reactive 3D objects
- Physics simulation (with Rapier)
- GLTF/GLB model loading
- Post-processing effects
- Event handling on 3D objects

**Use Cases:**
- 3D vocabulary visualization
- Interactive learning environments
- Gamification elements
- 3D flashcards

**Installation:**
```bash
npm install @threlte/core @threlte/extras three
npm install @threlte/rapier  # For physics
```

---

### [svelte-motion](https://github.com/huntabyte/svelte-motion)
**Description:** Declarative animations for Svelte 5 using Framer Motion-style API.

**Key Features:**
- `<Motion>` component for animations
- `<AnimatePresence>` for exit animations
- Gestures (drag, hover, tap)
- Spring physics
- Layout animations

**Already installed in project.**

---

## Utilities

### [svelte-persisted-store](https://github.com/joshnuss/svelte-persisted-store)
**Description:** Svelte store that automatically persists to localStorage.

**Key Features:**
- Auto-sync with localStorage
- TypeScript support
- SSR compatible
- Debounced writes

**Installation:**
```bash
npm install svelte-persisted-store
```

---

### [svelte-infinite-scroll](https://github.com/andrelmlins/svelte-infinite-scroll)
**Description:** Infinite scrolling component for Svelte.

**Installation:**
```bash
npm install svelte-infinite-scroll
```

---

## Related Documentation

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Current implementation status
- [COMPONENT_LIBRARY_ANALYSIS.md](./COMPONENT_LIBRARY_ANALYSIS.md) - Detailed analysis of shadcn-svelte and bits-ui
- [SVELTE_PACKAGES_RESEARCH.md](./SVELTE_PACKAGES_RESEARCH.md) - Comprehensive Svelte ecosystem packages research
- [IMPLEMENTATION_PLAN_PHASE_1.md](./IMPLEMENTATION_PLAN_PHASE_1.md) - Current implementation phases

---

*Last Updated: 2025-02-10*
