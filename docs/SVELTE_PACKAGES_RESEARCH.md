# Svelte Packages Research - Useful Libraries for the Project

**Research Date:** February 2025
**Source:** svelte.dev/packages, community recommendations, and npm registry

---

## 🎨 Animation & Motion

### [svelte-motion](https://github.com/huntabyte/svelte-motion) ⭐ Already Installed
**Description:** Declarative animations for Svelte 5 using Framer Motion-style API
**Install:** `npm install svelte-motion`
**Weekly Downloads:** ~50K+

**Features:**
- Declarative animations with `<Motion>` component
- `<AnimatePresence>` for exit animations
- Gestures (drag, hover, tap, pan)
- Variants for complex animation sequences
- Layout animations
- Spring physics

**Use Cases for Learning App:**
- Card swipe animations (Daily 10)
- Page transitions
- Toast enter/exit animations
- Micro-interactions on buttons

**Already Using:** ✅ SwipeableCard, Toast components

---

### [@animotion/core](https://github.com/animotionjs/animotion)
**Description:** Create slide decks and presentations with Svelte
**Install:** `npm install @animotion/core`
**Weekly Downloads:** ~5K+

**Features:**
- Slide deck creation
- Code animations
- Step-by-step reveals
- Transitions between slides

**Use Case:** Interactive lesson presentations, grammar explanations

---

### [svelte-typewriter](https://github.com/henriquehbr/svelte-typewriter)
**Description:** Typewriter effect for text
**Install:** `npm install svelte-typewriter`
**Weekly Downloads:** ~3K+

**Use Case:** Typing out example sentences, interactive prompts

---

## 🎮 3D & Graphics

### [Threlte](https://threlte.xyz/) - ⭐ HIGHLY RECOMMENDED
**Description:** Svelte wrapper for Three.js - build 3D scenes declaratively
**Install:** `npm install @threlte/core @threlte/extras three`
**Weekly Downloads:** ~20K+ (across Threlte packages)

**Core Packages:**
- `@threlte/core` - Core 3D components
- `@threlte/extras` - Additional helpers (GLTF, HTML overlay, etc.)
- `@threlte/rapier` - Physics engine integration
- `@threlte/flex` - Flexbox layouts in 3D

**Features:**
- Declarative Three.js scenes with Svelte components
- Reactive 3D objects (position, rotation, scale)
- Lighting, cameras, materials
- Import GLTF/GLB models
- Post-processing effects
- Physics simulation (with Rapier)
- Event handling (click, hover on 3D objects)

**Use Cases for Learning App:**
1. **3D Word Objects** - Visualize vocabulary as interactive 3D objects
2. **Scene Learning** - Learn "in the kitchen", "in the garden" with 3D environments
3. **Anatomy Lessons** - 3D body parts for vocabulary
4. **Geography** - 3D maps for cultural lessons
5. **Gamification** - 3D achievement badges, progress trophies
6. **Interactive Flashcards** - Flip 3D cards with physics

**Example Implementation:**
```svelte
<script>
  import { Canvas, T } from '@threlte/core'
  import { OrbitControls, GLTF } from '@threlte/extras'

  let rotation = $state(0)
</script>

<Canvas>
  <T.PerspectiveCamera makeDefault position={[5, 5, 5]} lookAt.y={0} />
  <OrbitControls enableDamping />

  <T.DirectionalLight position={[3, 10, 7]} intensity={1} />
  <T.AmbientLight intensity={0.5} />

  <!-- Interactive 3D card -->
  <T.Group rotation.y={rotation}>
    <T.Mesh onclick={() => rotation += Math.PI}>
      <T.BoxGeometry args={[2, 3, 0.1]} />
      <T.MeshStandardMaterial color="#3b82f6" />
    </T.Mesh>
  </T.Group>

  <!-- Load 3D model -->
  <GLTF url="/models/apple.glb" position={[0, 0, 0]} />
</Canvas>
```

**Priority for Project:** **LOW to MEDIUM** - Great for future gamification, but not essential for MVP

---

### [svelte-cubed](https://github.com/Rich-Harris/svelte-cubed)
**Description:** Simpler alternative to Threlte for basic 3D (by Rich Harris)
**Install:** `npm install svelte-cubed`
**Status:** Experimental, less active than Threlte

**Recommendation:** Use Threlte instead - more mature, better documentation

---

## 📊 Data Visualization (Already Documented)

See [COMPONENT_LIBRARY_ANALYSIS.md](./COMPONENT_LIBRARY_ANALYSIS.md) for:
- **Layer Cake** - Data visualization framework
- **LayerChart** - Pre-built charts
- **Svelte Flow** - Node-based diagrams

---

## 🎯 UI Components & Primitives

### [melt-ui](https://melt-ui.com/) - ⭐ WORTH CONSIDERING
**Description:** Headless UI components for Svelte
**Install:** `npm install @melt-ui/svelte`
**Weekly Downloads:** ~40K+

**Comparison to bits-ui:**
- Similar headless approach
- Uses Svelte 4 (stores) rather than Svelte 5 runes
- Good for Svelte 4 projects

**Verdict:** Stick with **bits-ui** (already in use) - it's built for Svelte 5 runes

---

### [carbon-components-svelte](https://github.com/carbon-design-system/carbon-components-svelte)
**Description:** IBM Carbon Design System components for Svelte
**Install:** `npm install carbon-components-svelte`
**Weekly Downloads:** ~25K+

**Features:**
- 60+ components
- Enterprise-grade design system
- Comprehensive accessibility

**Verdict:** Not recommended - too heavy, opinionated styling conflicts with Tailwind

---

### [agnosticui-svelte](https://github.com/AgnosticUI/agnosticui)
**Description:** Framework-agnostic UI components
**Install:** `npm install agnosticui-svelte`

**Verdict:** Not recommended - shadcn-svelte is more mature

---

## 🔧 Utilities & Helpers

### [svelte-persisted-store](https://github.com/joshnuss/svelte-persisted-store) ⭐ USEFUL
**Description:** Svelte store that persists to localStorage
**Install:** `npm install svelte-persisted-store`
**Weekly Downloads:** ~35K+

**Features:**
- Automatically sync store with localStorage
- TypeScript support
- Handles SSR
- Debounced writes

**Use Case:** Persist user settings, study progress, preferences

**Example:**
```svelte
<script>
  import { persisted } from 'svelte-persisted-store'

  // Automatically saves to localStorage
  const settings = persisted('app-settings', {
    languageMode: 'DE_BG',
    dailyGoal: 10
  })
</script>

<select bind:value={$settings.languageMode}>
  <option value="DE_BG">German → Bulgarian</option>
  <option value="BG_DE">Bulgarian → German</option>
</select>
```

**Verdict:** ✅ **USEFUL** - Could simplify our storage utilities

---

### [svelte-watchResize](https://github.com/joealden/svelte-watchResize)
**Description:** Action for watching element resize
**Install:** `npm install svelte-watchresize`

**Use Case:** Responsive charts, dynamic layouts

---

### [svelte-infinite-scroll](https://github.com/andrelmlins/svelte-infinite-scroll)
**Description:** Infinite scrolling component
**Install:** `npm install svelte-infinite-scroll`
**Weekly Downloads:** ~8K+

**Use Case:** Vocabulary list infinite scroll (alternative to virtual scrolling)

---

### [svelte-lazy](https://github.com/alex-sandri/svelte-lazy)
**Description:** Lazy loading component
**Install:** `npm install svelte-lazy`

**Use Case:** Defer loading heavy components, images

---

## 🎨 Styling & Theming

### [tailwind-merge](https://github.com/dcastil/tailwind-merge) ⭐ Already Using
**Description:** Merge Tailwind classes intelligently
**Install:** `npm install tailwind-merge`

**Already in project:** ✅ Part of `cn()` utility

---

### [clsx](https://github.com/lukeed/clsx) ⭐ Already Using
**Description:** Conditional class names
**Install:** `npm install clsx`

**Already in project:** ✅ Part of `cn()` utility

---

### [svelte-headlessui](https://github.com/rgossiaux/svelte-headlessui)
**Description:** Headless UI components (React HeadlessUI port)
**Install:** `npm install svelte-headlessui`

**Verdict:** Use bits-ui instead - native Svelte, Svelte 5 compatible

---

## 📝 Forms & Validation

### [formsnap](https://formsnap.dev/)
**Description:** Form components for SvelteKit + Superforms
**Install:** `npm install formsnap`

**Features:**
- Form field components
- Validation integration
- Error handling
- Accessible form patterns

**Use Case:** Contact forms, user settings, feedback forms

---

### [felte](https://felte.dev/)
**Description:** Form library for Svelte
**Install:** `npm install felte`
**Weekly Downloads:** ~15K+

**Features:**
- Form validation
- Error handling
- Reactive form state
- Integrates with Yup, Zod

**Verdict:** Good for complex forms, but not needed for simple inputs

---

### [sveltekit-superforms](https://github.com/ciscoheat/sveltekit-superforms) ⭐ POPULAR
**Description:** Form handling for SvelteKit
**Install:** `npm install sveltekit-superforms`
**Weekly Downloads:** ~60K+

**Features:**
- Server-side validation
- Client-side validation
- Progressive enhancement
- Zod integration

**Use Case:** Any server-side form handling

---

## 🧪 Testing

### [@testing-library/svelte](https://github.com/testing-library/svelte-testing-library) ⭐ Already Using
**Description:** Testing utilities for Svelte

**Already in project:** ✅ In devDependencies

---

### [vitest-svelte-kit](https://github.com/nickbreaton/vitest-svelte-kit)
**Description:** Vitest integration for SvelteKit

**Already in project:** ✅ Using Vitest

---

## 🚀 Performance

### [svelte-preprocess](https://github.com/sveltejs/svelte-preprocess) ⭐ Already Using
**Description:** Preprocessor for Svelte

**Already in project:** ✅ Via SvelteKit

---

### [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte) ⭐ Already Using
**Description:** Vite plugin for Svelte

**Already in project:** ✅ Core dependency

---

## 📱 Mobile & Touch

### [svelte-gestures](https://github.com/jangxx/svelte-gestures)
**Description:** Touch gesture support
**Install:** `npm install svelte-gestures`

**Features:**
- Swipe
- Pinch
- Rotate
- Pan

**Use Case:** Mobile swipe cards (Daily 10), pinch-to-zoom on vocabulary

**Note:** Could use svelte-motion instead for gestures

---

### [svelte-drag](https://github.com/robbrazier/svelte-drag)
**Description:** Drag and drop functionality
**Install:** `npm install svelte-drag`

---

## 🔍 Search & Filter

### [svelte-fuse](https://github.com/ConsoleTVs/svelte-fuse)
**Description:** Fuzzy search with Fuse.js
**Install:** `npm install svelte-fuse`

**Already using:** Fuse.js directly in search service

---

### [match-sorter](https://github.com/kentcdodds/match-sorter)
**Description:** Simple, expected, and deterministic best-match sorting
**Install:** `npm install match-sorter`

**Use Case:** Alternative to Fuse.js for search ranking

---

## 🎧 Media & Audio

### [svelte-audio](https://github.com/viktor-ku/svelte-audio)
**Description:** Audio playback component

**Use Case:** Pronunciation audio in vocabulary cards

---

### [howler-svelte](https://github.com/DmitriiTsyganov/howler-svelte)
**Description:** Svelte wrapper for Howler.js audio library

**Use Case:** Advanced audio playback, sound effects

---

## 📅 Date & Time

### [svelte-calendar](https://github.com/justinrey-svelte/svelte-calendar)
**Description:** Date picker component

**Verdict:** Use shadcn-svelte Calendar instead

---

### [date-picker-svelte](https://github.com/probablykasper/date-picker-svelte)
**Description:** Date picker with Svelte

**Verdict:** Use shadcn-svelte Calendar instead

---

## 🌐 Internationalization

### [svelte-i18n](https://github.com/kaisermann/svelte-i18n) ⭐ Popular Alternative
**Description:** Internationalization library
**Install:** `npm install svelte-i18n`
**Weekly Downloads:** ~100K+

**Features:**
- Message formatting
- Locale detection
- Store-based reactivity
- ICU message syntax

**Current project:** Using custom localization service

**Verdict:** Could migrate to svelte-i18n for more features, but current solution works

---

### [@inlang/paraglide-sveltekit](https://inlang.com/)
**Description:** Type-safe i18n for SvelteKit

**Features:**
- Type-safe translations
- IDE autocomplete
- Message extraction

**Verdict:** Good for new projects, not worth migration for existing

---

## 🎯 State Management

### [svelte-store-array](https://github.com/mrzen/svelte-store-array)
**Description:** Array operations for stores

---

### [svelte-zustand](https://github.com.com/DarrenDanielDay/svelte-zustand)
**Description:** Zustand state management for Svelte

**Verdict:** Using Svelte 5 runes instead of external stores

---

## 🛠️ Development Tools

### [svelte-check](https://github.com/sveltejs/language-tools) ⭐ Already Using
**Description:** TypeScript checking for Svelte

**Already in project:** ✅ `npm run check`

---

### [svelte-devtools](https://github.com/sveltejs/svelte-devtools)
**Description:** Browser devtools extension

**Recommendation:** Install for development debugging

---

### [storybook-addon-svelte-csf](https://github.com/storybookjs/addon-svelte-csf) ⭐ Already Using
**Description:** Storybook support for Svelte

**Already in project:** ✅ Storybook configured

---

## 📊 Recommended Packages Summary

### ✅ Install Immediately

| Package | Use Case | Priority |
|---------|----------|----------|
| `svelte-persisted-store` | Persist settings to localStorage | HIGH |

### ✅ Consider for Future

| Package | Use Case | Priority |
|---------|----------|----------|
| `@threlte/core` | 3D vocabulary scenes | MEDIUM |
| `svelte-gestures` | Mobile touch gestures | MEDIUM |
| `svelte-infinite-scroll` | Alternative to virtual scroll | LOW |
| `svelte-typewriter` | Animated text effects | LOW |

### ❌ Not Recommended

| Package | Reason |
|---------|--------|
| `carbon-components-svelte` | Too heavy, conflicts with Tailwind |
| `melt-ui` | bits-ui is better for Svelte 5 |
| `svelte-i18n` | Current solution works |

---

## 📦 Installation Commands

```bash
# High Priority
npm install svelte-persisted-store

# Medium Priority (Future enhancements)
npm install @threlte/core @threlte/extras three
npm install svelte-gestures
npm install svelte-infinite-scroll

# Low Priority (Optional)
npm install svelte-typewriter
npm install svelte-lazy
```

---

## 🎯 Implementation Recommendations

### Phase 1: Immediate (This Sprint)
1. **svelte-persisted-store** - Replace custom storage utilities
   - Simplifies settings persistence
   - Less code to maintain
   - Better TypeScript support

### Phase 2: Enhanced UX (Next Month)
2. **Threlte** - 3D vocabulary visualization
   - Create interactive 3D flashcards
   - Scene-based learning environments
   - Gamification elements

### Phase 3: Polish (Future)
3. **svelte-gestures** - Enhanced mobile interactions
4. **svelte-typewriter** - Animated lesson content

---

## 🔗 Related Documentation

- [EXTERNAL_LINKS.md](./EXTERNAL_LINKS.md) - All external library references
- [COMPONENT_LIBRARY_ANALYSIS.md](./COMPONENT_LIBRARY_ANALYSIS.md) - shadcn-svelte & bits-ui details
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Current implementation status

---

*Last Updated: February 2025*
