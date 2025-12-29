# Phase 11 Testing - Commands & Execution Guide

**Created**: December 29, 2025  
**Purpose**: Quick reference for running all Phase 11 tests and validations  
**Status**: Ready for Execution

---

## 🚀 Quick Start - Execute All Tests

### 1. Start Dev Server
```bash
pnpm run dev
```

### 2. In New Terminal - Run Test Suite
```bash
# Run everything
pnpm run simulate-ci

# Or run specific test suites
pnpm run test:unit
pnpm run test:components
pnpm run test:e2e
pnpm run test:accessibility
```

### 3. Mobile Testing
```bash
# Open browser to test mobile manually
# Or use Playwright for automated mobile testing
pnpm run test:e2e -- --project="Mobile Chrome" --headed
```

---

## 📋 Data Validation Commands

### Validate Vocabulary Data
```bash
# Check schema compliance
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/unified-vocabulary.json'));
console.log('Total items:', data.length);
console.log('Items with all fields:', data.filter(item => 
  item.id && item.german && item.bulgarian && item.partOfSpeech && item.category
).length);
"
```

### Check for Duplicates
```bash
# Find duplicate vocabulary items
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/unified-vocabulary.json'));
const seen = new Set();
const dupes = data.filter(item => {
  const key = \`\${item.german}|\${item.bulgarian}\`;
  if (seen.has(key)) {
    console.log('Duplicate:', item.german, '->', item.bulgarian);
    return true;
  }
  seen.add(key);
  return false;
});
console.log('Total duplicates found:', dupes.length);
"
```

### Validate German Grammar
```bash
# Check all German words have articles
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/unified-vocabulary.json'));
const nouns = data.filter(item => item.partOfSpeech === 'noun');
const noArticle = nouns.filter(item => !['der', 'die', 'das'].some(art => item.german.startsWith(art + ' ')));
console.log('Nouns without articles:', noArticle.length);
if (noArticle.length > 0) {
  console.log('First 5 examples:');
  noArticle.slice(0, 5).forEach(item => console.log('  -', item.german));
}
"
```

### Validate Bulgarian Grammar
```bash
# Check Bulgarian definite articles
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/unified-vocabulary.json'));
// Check for items that might need article forms
const needsArticles = data.slice(0, 50).map(item => ({
  bg: item.bulgarian,
  hasSuffix: /та\$|ът\$|то\$|те\$/.test(item.bulgarian)
}));
console.log('Sample Bulgarian words:');
needsArticles.forEach(item => console.log(\`  \${item.bg} (has suffix: \${item.hasSuffix})\`));
"
```

### Validate Categories
```bash
# List all categories and their counts
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/unified-vocabulary.json'));
const categories = {};
data.forEach(item => {
  if (!categories[item.category]) categories[item.category] = 0;
  categories[item.category]++;
});
console.log('Categories:', Object.keys(categories).length);
Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(\`  \${cat}: \${count}\`);
});
"
```

### Check Example Sentences
```bash
# Count items with examples
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/unified-vocabulary.json'));
const withExamples = data.filter(item => item.examples && item.examples.length > 0);
console.log('Items with examples:', withExamples.length, 'of', data.length);
console.log('Coverage: ', ((withExamples.length / data.length) * 100).toFixed(1) + '%');
"
```

### Verify IPA Data
```bash
# Check IPA coverage
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/unified-vocabulary.json'));
const hasIPA = data.filter(item => item.ipaGerman || item.ipaBulgarian);
console.log('Items with IPA:', hasIPA.length, 'of', data.length);
console.log('German IPA:', data.filter(item => item.ipaGerman).length);
console.log('Bulgarian IPA:', data.filter(item => item.ipaBulgarian).length);
"
```

---

## 🎯 Mobile Testing - Browser Tools

### Test on Mobile Viewport (Chrome DevTools)

```bash
# 1. Open DevTools (F12)
# 2. Click Device Toggle (⌘+Shift+M on Mac, Ctrl+Shift+M on Windows)
# 3. Select Device:
#    - iPhone SE (375px)
#    - iPhone 12 (390px) 
#    - iPhone 14 Pro (393px)
#    - Pixel 5 (393px)
#    - Custom (320px, 414px)

# 4. Navigate to each page:
# http://localhost:5173/
# http://localhost:5173/vocabulary
# http://localhost:5173/practice
# http://localhost:5173/learn
# http://localhost:5173/grammar

# 5. Test:
# - No horizontal scrollbar
# - All elements visible
# - Touch targets adequate
# - Text readable
```

### Test Network Conditions

```bash
# Chrome DevTools > Network tab
# 1. Click throttling selector (default: "No throttling")
# 2. Select "Slow 3G" or "Fast 3G" or "4G"
# 3. Reload page and measure load time
# 4. Observe if content loads progressively
```

### Test Offline Functionality

```bash
# Chrome DevTools > Network tab
# 1. Check "Offline" checkbox
# 2. Navigate to app
# 3. Verify graceful degradation or offline support
# 4. Uncheck "Offline" to restore connection
```

---

## ♿ Accessibility Testing

### Run Automated Accessibility Tests
```bash
# Using axe testing
pnpm run test:accessibility

# With detailed report
pnpm run test:accessibility -- --reporter=verbose
```

### Manual Keyboard Navigation
```bash
# Start dev server
pnpm run dev

# In browser, test:
# 1. Press Tab to navigate through all interactive elements
# 2. Verify focus is visible (outline/highlight)
# 3. Verify tab order is logical
# 4. Press Enter/Space to activate buttons
# 5. Press Enter in input fields
# 6. Test with only keyboard (no mouse)
```

### Test with Screen Reader (macOS)
```bash
# Enable Voice Over
# System Preferences > Accessibility > Voice Over > Enable

# Test in browser:
# 1. Navigate with Control+Option+Arrow Keys
# 2. Activate buttons with Control+Option+Space
# 3. Verify content is announced correctly
# 4. Check form labels are associated

# Disable Voice Over
# Control+Option+Command+8
```

### Test with Screen Reader (Windows)
```bash
# Use NVDA (free screen reader)
# 1. Download from https://www.nvaccess.org/
# 2. Install and run
# 3. Start browser and open app
# 4. Navigate with arrow keys
# 5. Verify announcements
```

### Color Contrast Check
```bash
# Chrome DevTools > Inspect element
# 1. Right-click element > Inspect
# 2. Open Accessibility panel
# 3. Check contrast ratio
# 4. Should be ≥ 4.5:1 for normal text
# 5. Should be ≥ 3:1 for large text
```

---

## ⚡ Performance Testing

### Measure Load Performance
```bash
# Using Lighthouse
pnpm run lighthouse

# Manual measurement with Chrome DevTools:
# 1. Open DevTools > Performance tab
# 2. Click record circle
# 3. Click "reload page"
# 4. Navigate and interact
# 5. Click stop
# 6. Analyze:
#    - First Contentful Paint (FCP)
#    - Largest Contentful Paint (LCP)
#    - Time to Interactive (TTI)
#    - Cumulative Layout Shift (CLS)
```

### Monitor Network Activity
```bash
# Chrome DevTools > Network tab
# 1. Open Network tab before loading page
# 2. Hard reload (Cmd+Shift+R on Mac)
# 3. Observe:
#    - Total requests
#    - Total data transferred
#    - Load time
#    - Waterfall timeline
# 4. Look for:
#    - Large files
#    - Slow requests
#    - Render-blocking resources
```

### Check Memory Usage
```bash
# Chrome DevTools > Memory tab
# 1. Open Memory tab
# 2. Take heap snapshot
# 3. Interact with app (search, filter, etc)
# 4. Take another snapshot
# 5. Compare snapshots
# 6. Look for:
#    - Memory leaks
#    - Growing memory usage
#    - Detached DOM nodes
```

### Test Search Performance
```javascript
// In Console while on Vocabulary page
console.time('search');
// Type in search box (will trigger search)
// Check console output
console.timeEnd('search');
// Should be < 100ms for smooth interaction
```

---

## 📊 Automated Testing Scripts

### Run All Tests with Report
```bash
# Full test suite
pnpm run simulate-ci

# With coverage report
pnpm run test:unit -- --coverage
pnpm run test:components -- --coverage
```

### Run Specific Test Files
```bash
# Vocabulary tests
pnpm run test:e2e -- --grep "vocabulary"

# Practice tests
pnpm run test:e2e -- --grep "practice"

# Mobile tests
pnpm run test:e2e -- --grep "@mobile"

# Accessibility tests
pnpm run test:e2e -- --grep "@a11y"
```

### Generate Test Report
```bash
# HTML report
pnpm run test:all -- --reporter=html

# Open report
open test-results/index.html

# Or terminal report
pnpm run test:all -- --reporter=verbose
```

---

## 🔍 Manual Testing Workflow

### Daily Testing Checklist

```bash
# 1. Start dev server
pnpm run dev

# 2. Open app in browser
open http://localhost:5173

# 3. Test each page (5 min per page)
#    - Navigation works
#    - Content displays
#    - No errors in console
#    - Responsive on mobile (F12 device toggle)
#    - Language switching works

# 4. Test search functionality (2 min)
#    - German word search
#    - Bulgarian word search
#    - Partial matches
#    - Case-insensitive

# 5. Test filtering (2 min)
#    - Category filter
#    - Search + filter
#    - Clear filter

# 6. Test data
#    - Items load
#    - No duplicates
#    - Correct translations
#    - Examples make sense

# 7. Check console for errors
#    - Open DevTools (F12)
#    - Check Console tab
#    - No errors or warnings
```

### Weekly Testing Checklist

```bash
# 1. Full device testing
#    - Desktop (1920px, 1024px)
#    - Tablet (768px)
#    - Mobile (414px, 375px, 320px)

# 2. Cross-browser testing
#    - Chrome
#    - Firefox
#    - Safari

# 3. Network condition testing
#    - Fast 4G
#    - Slow 3G
#    - Offline

# 4. Keyboard navigation
#    - Tab through all elements
#    - No keyboard traps
#    - Focus visible

# 5. Screen reader testing
#    - Voice Over (Mac)
#    - NVDA (Windows)
#    - Content announces correctly

# 6. Performance check
#    - Load time < 3s
#    - Smooth scrolling (60fps)
#    - No memory leaks
```

---

## 📝 Test Documentation

### Create Test Report
```markdown
# Test Report - [Date]

## Summary
- Tests Executed: [number]
- Tests Passed: [number]
- Tests Failed: [number]
- Success Rate: [percentage]

## Device Tested
- Device: [model]
- Viewport: [dimensions]
- OS: [version]
- Browser: [version]

## Tests Performed
- [ ] Mobile Layout
- [ ] Navigation
- [ ] Search
- [ ] Filter
- [ ] Data Display
- [ ] Language Switching
- [ ] Accessibility
- [ ] Performance

## Issues Found
1. [Issue Title]
   - Severity: [Critical/High/Medium/Low]
   - Description: [details]
   - Steps: [reproduction steps]

## Recommendations
[Next steps]

## Sign-Off
Tester: ___________
Date: ___________
```

---

## 🚨 Troubleshooting

### Common Testing Issues

**Issue**: Port 5173 already in use
```bash
# Kill existing process
lsof -nP -iTCP:5173 | grep LISTEN
kill -9 [PID]

# Or use different port
PORT=5174 pnpm run dev
```

**Issue**: Dependencies changed
```bash
# Reinstall
rm -rf node_modules
pnpm install
pnpm run dev
```

**Issue**: TypeScript errors
```bash
# Check what's wrong
pnpm run check

# Fix formatting
pnpm run lint --fix
```

**Issue**: Tests failing
```bash
# Run with more details
pnpm run test:unit -- --reporter=verbose

# Run specific test
pnpm run test:unit -- [test-file-name]
```

**Issue**: Build fails
```bash
# Clean and rebuild
rm -rf build .svelte-kit
pnpm run build
```

---

## 📚 Documentation References

- **[PHASE_11_MOBILE_TESTING_PLAN.md](PHASE_11_MOBILE_TESTING_PLAN.md)** - Detailed test suites
- **[DATA_VALIDATION_GUIDE.md](DATA_VALIDATION_GUIDE.md)** - Data validation procedures
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current project status
- **[TESTING.md](development/TESTING.md)** - General testing guidelines
- **[DEVELOPMENT.md](development/DEVELOPMENT.md)** - Development setup

---

## ✅ Ready to Start?

1. **Ensure dev server running**: `pnpm run dev`
2. **Open app in browser**: `http://localhost:5173`
3. **Toggle mobile view**: F12 > Device Toggle
4. **Start testing**: Use checklists above
5. **Log issues**: Use template from main testing plan
6. **Update progress**: Mark completed tests

---

**Document Status**: Active  
**Last Updated**: December 29, 2025  
**Test Lead**: QA Expert  
**Estimated Duration**: 2 weeks (Phase 11)
