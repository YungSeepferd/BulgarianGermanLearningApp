# Component Library Analysis: shadcn-svelte + bits-ui

## Executive Summary

This document analyzes the capabilities of **shadcn-svelte** and **bits-ui**, and provides a roadmap for integrating these libraries to enhance the Bulgarian-German Learning App. Both libraries are built specifically for Svelte 5 and use runes, making them ideal for this project's architecture.

---

## bits-ui: Headless Primitives

### Overview
**bits-ui** is a collection of headless, accessible, and unstyled UI primitives for Svelte 5. It serves as the foundation for shadcn-svelte and provides the underlying behavior without styling opinions.

### Core Philosophy
- **Headless:** Bring your own styles (CSS, Tailwind, etc.)
- **Accessible:** Full WAI-ARIA compliance out of the box
- **Runes-based:** Built for Svelte 5's reactive system
- **Composable:** Mix and match primitives

### Available Primitives (30+)

#### Navigation & Layout
| Component | Purpose | Current Project Use |
|-----------|---------|---------------------|
| `Accordion` | Collapsible content sections | FAQ, grammar rules |
| `Collapsible` | Expand/collapse single panel | Advanced options |
| `Dialog` | Modal windows | Currently using custom |
| `Popover` | Floating content attached to trigger | Tooltips, quick info |
| `Sheet` | Slide-out panels (side drawers) | Mobile navigation |
| `Sidebar` | Application sidebar layout | Could replace custom nav |

#### Form Controls
| Component | Purpose | Current Project Use |
|-----------|---------|---------------------|
| `Checkbox` | Binary input | Selection filters |
| `Combobox` | Autocomplete dropdown | Search with suggestions |
| `Date Picker` | Date selection | Scheduling study sessions |
| `Input` | Text input | Forms, search |
| `Label` | Form labels | Accessibility |
| `Pin Input` | OTP/code entry | Verification codes |
| `Radio Group` | Single selection from multiple | Quiz answers |
| `Select` | Dropdown selection | Filter categories |
| `Slider` | Range selection | Difficulty settings |
| `Switch` | Toggle input | Settings toggles |
| `Textarea` | Multi-line text | Notes, feedback |

#### Data Display
| Component | Purpose | Current Project Use |
|-----------|---------|---------------------|
| `Avatar` | User/profile images | User profiles |
| `Badge` | Status indicators | CEFR levels, tags |
| `Calendar` | Date display | Study streak calendar |
| `Hover Card` | Rich hover preview | Word preview on hover |
| `Progress` | Progress bars | Study progress |
| `Scroll Area` | Custom scrollable regions | Vocabulary lists |
| `Skeleton` | Loading placeholders | Already have custom |
| `Table` | Data tables | Vocabulary browser |
| `Tooltip` | Contextual hints | Icon explanations |

#### Interaction
| Component | Purpose | Current Project Use |
|-----------|---------|---------------------|
| `Alert Dialog` | Critical confirmation | Delete confirmation |
| `Button` | Clickable actions | Already using |
| `Command` | Command palette | Quick navigation |
| `Context Menu` | Right-click menus | Card actions |
| `Dropdown Menu` | Action menus | Filter options |
| `Menubar` | Application menu bar | Top-level navigation |
| `Navigation Menu` | Dropdown navigation | Category browsing |
| `Separator` | Visual divider | Section separation |
| `Toast` | Notifications | Already implemented |
| `Toggle` | Binary state button | View modes |
| `Toggle Group` | Multi-select toggle | Filter combinations |

---

## shadcn-svelte: Styled Components

### Overview
**shadcn-svelte** provides beautifully designed, accessible, and customizable components built on top of bits-ui primitives. Unlike traditional UI libraries, you copy-paste components into your project, giving you full control.

### Key Differentiators
- **Not a dependency:** Copy-paste components you need
- **Fully customizable:** Modify any component code
- **Built on bits-ui:** Inherits all accessibility
- **Tailwind styled:** Consistent with existing project
- **Svelte 5 native:** Uses runes throughout

### Component Collection (40+)

#### High-Priority Components for This Project

##### 1. Command Palette (`Command`)
```svelte
<Command>
  <CommandInput placeholder="Search vocabulary, lessons, or navigate..." />
  <CommandList>
    <CommandGroup heading="Vocabulary">
      <CommandItem>Search German words</CommandItem>
      <CommandItem>Search Bulgarian words</CommandItem>
    </CommandGroup>
    <CommandGroup heading="Lessons">
      <CommandItem>Quick lesson start</CommandItem>
      <CommandItem>Daily 10 practice</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```
**Use Case:** ⌘+K quick navigation, search across app

##### 2. Data Table (`Table`)
```svelte
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>German</TableHead>
      <TableHead>Bulgarian</TableHead>
      <TableHead>Level</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each vocabulary as item}
      <TableRow>
        <TableCell>{item.german}</TableCell>
        <TableCell>{item.bulgarian}</TableCell>
        <TableCell><Badge>{item.cefrLevel}</Badge></TableCell>
      </TableRow>
    {/each}
  </TableBody>
</Table>
```
**Use Case:** Enhanced vocabulary browser with sorting, filtering, pagination

##### 3. Combobox
```svelte
<Combobox
  items={categories}
  bind:value={selectedCategory}
  placeholder="Select category..."
/>
```
**Use Case:** Category filtering with type-ahead search

##### 4. Calendar & Date Picker
```svelte
<Calendar bind:value={studyDate} />
<DatePicker bind:value={goalDate} />
```
**Use Case:** Study streak tracking, goal setting

##### 5. Hover Card
```svelte
<HoverCard>
  <HoverCardTrigger>{word.german}</HoverCardTrigger>
  <HoverCardContent>
    <h4>{word.bulgarian}</h4>
    <p>{word.definition}</p>
    <Badge>{word.cefrLevel}</Badge>
  </HoverCardContent>
</HoverCard>
```
**Use Case:** Quick word preview in lists without navigating

##### 6. Sheet (Side Drawer)
```svelte
<Sheet>
  <SheetTrigger>Open Filters</SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Filter Vocabulary</SheetTitle>
    </SheetHeader>
    <!-- Filter controls -->
  </SheetContent>
</Sheet>
```
**Use Case:** Mobile filter panel, vocabulary detail sidebar

##### 7. Tabs
```svelte
<Tabs value="german">
  <TabsList>
    <TabsTrigger value="german">German → Bulgarian</TabsTrigger>
    <TabsTrigger value="bulgarian">Bulgarian → German</TabsTrigger>
  </TabsList>
  <TabsContent value="german">...</TabsContent>
  <TabsContent value="bulgarian">...</TabsContent>
</Tabs>
```
**Use Case:** Language direction toggle, lesson type selection

##### 8. Accordion
```svelte
<Accordion>
  <AccordionItem value="grammar">
    <AccordionTrigger>Grammar Rules</AccordionTrigger>
    <AccordionContent>
      <!-- Grammar explanations -->
    </AccordionContent>
  </AccordionItem>
</Accordion>
```
**Use Case:** Grammar guide, FAQ, collapsible lesson sections

##### 9. Toggle Group
```svelte
<ToggleGroup bind:value={selectedLevels} type="multiple">
  <ToggleGroupItem value="A1">A1</ToggleGroupItem>
  <ToggleGroupItem value="A2">A2</ToggleGroupItem>
  <ToggleGroupItem value="B1">B1</ToggleGroupItem>
</ToggleGroup>
```
**Use Case:** CEFR level filtering, multiple difficulty selection

##### 10. Slider
```svelte
<Slider bind:value={lessonSize} max={50} step={5} />
```
**Use Case:** Lesson size selector, difficulty range

---

## Implementation Plan

### Phase 1: Install Core Dependencies

```bash
# Already installed: bits-ui (as dependency of shadcn-svelte components)

# Install shadcn-svelte CLI
npx shadcn-svelte@latest init

# Install additional visualization libraries
npm install layercake
npm install @xyflow/svelte  # For Svelte Flow
```

### Phase 2: Add Components by Priority

#### Priority 1: High-Impact UX Improvements
```bash
npx shadcn-svelte add command      # Quick navigation
npx shadcn-svelte add hover-card   # Word previews
npx shadcn-svelte add sheet        # Mobile drawer
npx shadcn-svelte add tabs         # Better organization
```

#### Priority 2: Form Enhancements
```bash
npx shadcn-svelte add combobox     # Searchable dropdowns
npx shadcn-svelte add slider       # Range inputs
npx shadcn-svelte add toggle-group # Multi-select
npx shadcn-svelte add calendar     # Date selection
```

#### Priority 3: Data Display
```bash
npx shadcn-svelte add table        # Enhanced vocabulary grid
npx shadcn-svelte add accordion    # Grammar guide
npx shadcn-svelte add context-menu # Right-click actions
```

### Phase 3: Component Replacements

#### Replace Current Components

| Current Component | Replacement | Benefits |
|-------------------|-------------|----------|
| Custom Dialog | shadcn Dialog | Better accessibility, animations |
| Custom Button | shadcn Button | More variants, consistent styling |
| Custom Badge | shadcn Badge | Better color schemes |
| Custom Toast | shadcn Toast (or keep current) | Built-in queue management |
| SkeletonCard | shadcn Skeleton | More consistent shimmer |
| Filter dropdowns | Combobox | Searchable, better UX |
| Category pills | Toggle Group | Multi-select capability |

#### New Components to Add

| New Component | Use Case |
|--------------|----------|
| Command | ⌘+K global search |
| Data Table | Sortable/filterable vocabulary |
| Hover Card | Word preview tooltips |
| Sheet | Mobile filter drawer |
| Calendar | Study streak tracking |
| Tabs | Language direction toggle |
| Accordion | Grammar rule expansion |
| Slider | Lesson size selector |

### Phase 4: Visualization Integration

#### Learning Progress Dashboard
Using **Layer Cake** or **LayerChart**:
```svelte
<script>
  import { LayerCake, Svg, Bar } from 'layercake';

  const progressData = [
    { day: 'Mon', words: 10 },
    { day: 'Tue', words: 15 },
    // ...
  ];
</script>

<LayerCake data={progressData}>
  <Svg>
    <Bar />
  </Svg>
</LayerCake>
```

#### Grammar Structure Visualization
Using **Svelte Flow**:
```svelte
<script>
  import { SvelteFlow, Controls, Background } from '@xyflow/svelte';

  const nodes = [
    { id: '1', type: 'noun', data: { label: 'Nouns' } },
    { id: '2', type: 'verb', data: { label: 'Verbs' } },
    // ...
  ];

  const edges = [
    { id: 'e1-2', source: '1', target: '2', label: 'conjugate' },
  ];
</script>

<SvelteFlow {nodes} {edges}>
  <Controls />
  <Background />
</SvelteFlow>
```

---

## Detailed Component Analysis

### bits-ui vs Custom Implementation

#### Dialog/Modal
- **Current:** Custom implementation with basic accessibility
- **bits-ui:** Full WAI-ARIA compliance, focus trapping, escape handling
- **Migration effort:** Low (swap component, keep styling)
- **Benefit:** High (better accessibility)

#### Form Controls
- **Current:** Native HTML inputs
- **bits-ui:** Composable, accessible primitives
- **Migration effort:** Medium
- **Benefit:** High (better UX, validation support)

#### Navigation
- **Current:** Custom Navigation component
- **bits-ui:** Menubar, Navigation Menu primitives
- **Migration effort:** Medium
- **Benefit:** Medium (better keyboard navigation)

### shadcn-svelte Enhancement Opportunities

#### 1. Command Palette (Global Search)
**Current State:** No global search
**Implementation:**
```svelte
<!-- +layout.svelte -->
<script>
  import { Command } from '$lib/components/ui/command';
  let open = $state(false);

  // ⌘+K handler
  function handleKeydown(e) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      open = true;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<Command.Dialog bind:open>
  <Command.Input placeholder="Type to search..." />
  <Command.List>
    <!-- Search results -->
  </Command.List>
</Command.Dialog>
```

#### 2. Enhanced Vocabulary Browser
**Current State:** Grid of cards with basic filtering
**Enhanced Version:**
```svelte
<script>
  import * as Table from '$lib/components/ui/table';
  import { Input } from '$lib/components/ui/input';

  let searchQuery = $state('');
  let sortColumn = $state<'german' | 'bulgarian' | 'level'>('german');
  let sortDirection = $state<'asc' | 'desc'>('asc');
</script>

<div class="vocabulary-browser">
  <Input placeholder="Search..." bind:value={searchQuery} />

  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head onclick={() => setSort('german')}>
          German {sortColumn === 'german' && (sortDirection === 'asc' ? '↑' : '↓')}
        </Table.Head>
        <Table.Head onclick={() => setSort('bulgarian')}>Bulgarian</Table.Head>
        <Table.Head onclick={() => setSort('level')}>Level</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each filteredItems as item}
        <Table.Row>
          <Table.Cell>{item.german}</Table.Cell>
          <Table.Cell>{item.bulgarian}</Table.Cell>
          <Table.Cell>
            <Badge variant={item.cefrLevel === 'A1' ? 'default' : 'secondary'}>
              {item.cefrLevel}
            </Badge>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
```

#### 3. Study Streak Calendar
```svelte
<script>
  import { Calendar } from '$lib/components/ui/calendar';

  let studyDays = $state(['2025-01-15', '2025-01-16', '2025-01-18']);
</script>

<Calendar
  bind:value={selectedDate}
  modifiers={{
    studied: studyDays.map(d => new Date(d))
  }}
  modifiersClassNames={{
    studied: 'bg-green-100 text-green-900'
  }}
/>
```

---

## Visualization Libraries Analysis

### Svelte Flow
**Best for:**
- Grammar structure trees
- Learning path flows
- Word relationship graphs
- Sentence structure diagrams

**Integration Example:**
```svelte
<script>
  import { writable } from 'svelte/store';
  import { SvelteFlow, Background, Controls } from '@xyflow/svelte';

  const nodes = writable([
    {
      id: 'sentence',
      type: 'input',
      data: { label: 'Sentence Structure' },
      position: { x: 250, y: 0 }
    },
    {
      id: 'subject',
      data: { label: 'Subject (Nominativ)' },
      position: { x: 100, y: 100 }
    },
    {
      id: 'predicate',
      data: { label: 'Predicate (Verb)' },
      position: { x: 400, y: 100 }
    }
  ]);

  const edges = writable([
    { id: 'e1', source: 'sentence', target: 'subject' },
    { id: 'e2', source: 'sentence', target: 'predicate' }
  ]);
</script>

<div style="height: 400px;">
  <SvelteFlow {nodes} {edges} fitView>
    <Background />
    <Controls />
  </SvelteFlow>
</div>
```

### Layer Cake / LayerChart
**Best for:**
- Study progress charts
- Vocabulary distribution
- Time-based analytics
- Comparative statistics

**Integration Example:**
```svelte
<script>
  import { LayerCake, Svg, Bar, Axis } from 'layercake';

  const data = [
    { level: 'A1', count: 867, mastered: 450 },
    { level: 'A2', count: 650, mastered: 200 },
    { level: 'B1', count: 480, mastered: 100 },
    { level: 'B2', count: 320, mastered: 50 },
    { level: 'C1', count: 150, mastered: 20 }
  ];
</script>

<div class="chart-container">
  <LayerCake
    x="level"
    y={['count', 'mastered']}
    {data}
    padding={{ top: 20, right: 20, bottom: 40, left: 40 }}
  >
    <Svg>
      <Axis side="bottom" />
      <Axis side="left" />
      <Bar fill="count" color="steelblue" />
      <Bar fill="mastered" color="lightgreen" />
    </Svg>
  </LayerCake>
</div>
```

---

## Migration Roadmap

### Week 1: Foundation
1. Install shadcn-svelte CLI
2. Add base components (Button, Badge, Card)
3. Replace existing custom buttons
4. Test accessibility improvements

### Week 2: Navigation & Discovery
1. Add Command palette (global search)
2. Add Hover Cards for word previews
3. Implement Sheet for mobile filters
4. Add Tabs for language direction

### Week 3: Data Display
1. Create Data Table for vocabulary
2. Add Toggle Groups for multi-filter
3. Implement Slider for lesson size
4. Add Calendar for study tracking

### Week 4: Advanced Features
1. Add Accordion for grammar guide
2. Implement Combobox for search
3. Add Context Menu for actions
4. Integrate visualization library

### Week 5: Polish
1. Replace all remaining native inputs
2. Standardize Toast notifications
3. Add loading skeletons
4. Accessibility audit

---

## Cost-Benefit Analysis

### High Benefit, Low Effort
- **Command:** Major UX improvement, easy to implement
- **Hover Card:** Better word discovery, minimal changes
- **Sheet:** Mobile experience upgrade
- **Tabs:** Better organization than current solution

### High Benefit, High Effort
- **Data Table:** Major vocabulary browser rewrite
- **Command Integration:** Connecting to all data sources
- **Visualization:** New dashboard pages

### Low Priority
- **Calendar:** Nice-to-have, not critical
- **Advanced Charts:** Can use simple stats initially
- **Svelte Flow:** Experimental, not core feature

---

## Conclusion

**shadcn-svelte** and **bits-ui** offer significant improvements over custom components:

1. **Accessibility:** WCAG 2.1 AA compliant out of the box
2. **Consistency:** Professional design system
3. **Maintainability:** Copy-paste means full control
4. **Features:** Rich interactions without custom coding

**Recommended Priority:**
1. Install shadcn-svelte foundation
2. Add Command palette for search
3. Replace vocabulary browser with Data Table
4. Add Hover Cards for word previews
5. Integrate Sheet for mobile UX

---

*See also: [EXTERNAL_LINKS.md](./EXTERNAL_LINKS.md) for all library references*
