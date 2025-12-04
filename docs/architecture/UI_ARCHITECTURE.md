# UI Architecture & Component Design

## 1. Overview
The Bulgarian-German Learning App follows a **component-based architecture** with **Atomic Design principles** and **Svelte 5 Runes** for state management. The UI is built using Svelte components with Tailwind CSS for styling, ensuring a consistent and maintainable design system.

## 2. Component Structure

### 2.1 Atomic Design Hierarchy
```
components/
├── ui/                  # Atoms: Basic building blocks (buttons, dialogs, etc.)
│   ├── button/          # Button component with variants
│   ├── dialog/          # Dialog component with portal, overlay, etc.
│   └── ...              # Other atomic components
│
├── flashcard/           # Molecules: Composed components
│   ├── FlashCard.svelte # Flashcard component with flip animation
│   └── QuizController.svelte # Quiz control logic
│
├── gamification/        # Organisms: Complex components
│   ├── LevelUp.svelte   # Level up animation
│   └── LevelUpModal.svelte # Level up modal
│
├── ContextCard.svelte   # Contextual information display
├── SearchList.svelte    # Search results display
├── TandemPractice.svelte # Core practice functionality
├── TandemToggle.svelte  # Language direction toggle
└── TestCard.svelte      # Test/quiz card component
```

### 2.2 Component Design Principles
- **Reusability**: Components are designed to be reusable across different parts of the application
- **Composability**: Complex components are built by combining simpler ones
- **Accessibility**: All components follow WCAG 2.1 AA standards
- **Responsive Design**: Components adapt to different screen sizes using Tailwind's responsive utilities
- **Performance**: Components are optimized for minimal re-renders using Svelte 5 Runes

## 3. State Management

### 3.1 Svelte 5 Runes
- **`$state`**: Used for all reactive state within components
- **`$derived`**: Used for computed values that depend on other state
- **`$effect`**: Used for side effects that should run when dependencies change
- **`$props`**: Used for component props (replacing `export let`)

### 3.2 Component Communication
- **Parent-to-Child**: Via props using `$props()`
- **Child-to-Parent**: Via dispatched events
- **Global State**: Via the `AppState` singleton in `src/lib/state/app.svelte.ts`

## 4. Styling Approach

### 4.1 Tailwind CSS v4
- **Utility-First**: Most styling is done using Tailwind's utility classes
- **Custom Components**: Complex reusable styles are encapsulated in `@layer components`
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Dark Mode**: Support for dark mode via Tailwind's dark variant

### 4.2 Animation & Transitions
- **Svelte Transitions**: For enter/exit animations
- **CSS Animations**: For complex animations
- **Reduced Motion**: Support for `prefers-reduced-motion` media query
- **Haptic Feedback**: Mobile-specific feedback using `navigator.vibrate()`

## 5. Key UI Components

### 5.1 Practice Mode Components
- **TandemPractice.svelte**: Core practice functionality with flip animation
- **FlashCard.svelte**: Individual flashcard with front/back content
- **QuizController.svelte**: Quiz logic and answer validation

### 5.2 Navigation Components
- **Main Navigation**: File-based routing via SvelteKit
- **Contextual Navigation**: "Practice This" quick action from search results
- **Mobile Navigation**: Responsive navigation for mobile devices

### 5.3 Data Display Components
- **SearchList.svelte**: Search results display with filtering
- **ContextCard.svelte**: Contextual information display
- **TestCard.svelte**: Quiz/test card with question/answer format

### 5.4 UI Primitives
- **Button**: Reusable button component with variants
- **Dialog**: Modal dialog system with portal functionality
- **LessonCard**: Interactive lesson display with flip animation (new)

## 6. Accessibility Standards
- **WCAG 2.1 AA Compliance**: All components meet accessibility standards
- **ARIA Attributes**: Proper use of ARIA roles, states, and properties
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Semantic HTML**: Proper use of HTML5 semantic elements
- **Focus Management**: Proper focus handling for modals and interactive elements
- **Color Contrast**: Minimum 4.5:1 contrast ratio for text

## 7. Mobile & Responsive Design
- **Touch Targets**: Minimum 44x44px touch targets
- **Virtual Keyboard Handling**: Prevent layout shifts when keyboard opens
- **PWA Support**: Standalone mode for mobile devices
- **Viewport Configuration**: Proper viewport settings for mobile devices
- **Progressive Enhancement**: Features work across different device capabilities

## 8. Performance Considerations
- **Lazy Loading**: Data and components loaded on demand
- **Animation Optimization**: Reduced motion support and efficient animations
- **Component Optimization**: Minimal re-renders using Svelte 5 Runes
- **Data Optimization**: Chunked data loading for large datasets

## 9. Testing Strategy
- **Component Testing**: Isolated component tests with `playwright-ct-svelte`
- **Visual Regression**: Snapshot testing for critical components
- **Accessibility Testing**: axe-core integration for accessibility audits
- **Interaction Testing**: Testing user flows and component interactions