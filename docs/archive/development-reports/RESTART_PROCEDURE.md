# 🚨 CRITICAL: Complete Cache Clear and Server Restart Procedure

## Why Your Changes Aren't Showing

You're experiencing a **perfect storm** of caching issues:

1. **Browser Cache** - Old HTML files cached locally
2. **Service Worker Cache** - Old assets cached by SW
3. **Hugo Server Port Change** - Old server ran on port 58516, new on 1313
4. **Hugo Build Cache** - Old generated files in `public/` and `resources/`

All fixes ARE in the code, but your browser is serving OLD generated HTML from the previous Hugo server run.

---

## 🔧 COMPLETE FIX PROCEDURE

Follow these steps **IN ORDER**:

### Step 1: Pull Latest Changes

```bash
cd /path/to/BulgarianGermanLearningApp
git pull origin claude/session-011CUYMVoVQzLc2YQfUqit8C
```

Verify you got the latest commit:
```bash
git log -1 --oneline
```

Should show: `2aebdb3 fix: resolve vocabulary pagination regression + cache issues`

---

### Step 2: Run Automated Restart Script

```bash
./restart-hugo.sh
```

This script will:
- ✅ Kill any running Hugo processes
- ✅ Free port 1313 (and problematic port 58516)
- ✅ Delete `public/` and `resources/` directories
- ✅ Verify new files exist (about.md, methodology.md, favicon.svg)
- ✅ Check templates were updated correctly
- ✅ Start Hugo with cache-busting flags

**OR** manually run:

```bash
# Kill Hugo
pkill -f "hugo server"

# Free ports
lsof -ti:1313 | xargs kill -9 2>/dev/null || true
lsof -ti:58516 | xargs kill -9 2>/dev/null || true

# Clean build
rm -rf public/ resources/

# Start fresh
hugo server \
    --port 1313 \
    --baseURL "http://localhost:1313/" \
    --disableFastRender \
    --noHTTPCache
```

---

### Step 3: Clear Browser Cache (CRITICAL)

**You MUST do this or nothing will work!**

#### Option A: Nuclear Clear (Recommended)

**Chrome/Edge/Brave:**
1. Press `F12` to open DevTools
2. Right-click the **Reload** button in browser toolbar
3. Select **"Empty Cache and Hard Reload"**
4. Wait for page to fully reload

**Firefox:**
1. Press `F12` to open DevTools
2. Click Settings (gear icon)
3. Check **"Disable HTTP Cache (when toolbox is open)"**
4. With DevTools still open, press `Ctrl+Shift+R`

**Safari:**
1. Enable Develop menu: Preferences → Advanced → "Show Develop menu"
2. Develop → Empty Caches
3. Press `Cmd+Option+R`

#### Option B: Clear Service Worker + Cache

**All Browsers:**
1. Open DevTools (`F12`)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. In left sidebar:
   - Click **Service Workers**
   - Click **Unregister** next to any service worker
   - Click **Storage** → **Clear site data**
4. Close and reopen the browser tab
5. Navigate to `http://localhost:1313`

#### Option C: Use Incognito/Private Window

**Fastest for testing:**
- Chrome: `Ctrl+Shift+N` (Windows) / `Cmd+Shift+N` (Mac)
- Firefox: `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (Mac)

Navigate to `http://localhost:1313` - no cache interference.

---

### Step 4: Verify Fixes

Open DevTools Console (`F12` → Console tab) and check:

#### ✅ Expected Success Indicators

```
✅ No "net::ERR_CONNECTION_REFUSED" errors
✅ No "Unexpected token 'export'" errors
✅ All scripts load from "http://localhost:1313/..."
✅ Service Worker shows: [SW] Service worker activated and ready
✅ Cache version: bgde-app-v1.4.0
✅ No CSP meta warnings
✅ Favicon loads (check Network tab for /favicon.svg)
```

#### ✅ Page-Specific Checks

1. **Home (`/`):**
   - Header navigation works
   - Language toggle appears and functions
   - No 404s in console

2. **Vocabulary (`/vocabulary/`):**
   - Open DevTools Console
   - Look for: `[Pagination] Calculated: X total items, Y pages`
   - Should show MORE than 1 page (not "50 total items, 1 pages")
   - Navigate to `/vocabulary/?page=2`
   - URL should stay as page=2 (not reset to page=1)

3. **About (`/about/`):**
   - Page loads with new content
   - Should see "Bulgarian-German Learning App" heading

4. **Methodology (`/methodology/`):**
   - Page loads (not 404)
   - Should see "Learning Methodology" content

5. **Grammar (`/grammar/`):**
   - Should show: "Total Topics: 13" (not 0)
   - Grammar topics listed

6. **Practice (`/practice/`):**
   - Click "Start Practice"
   - Session should initialize immediately
   - Flashcards should appear

---

### Step 5: If Problems Persist

#### Check Hugo is on correct port:

```bash
lsof -i :1313
```

Should show:
```
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
hugo    12345 user   10u  IPv4 123456      0t0  TCP localhost:1313 (LISTEN)
```

#### Check for old Hugo still running:

```bash
ps aux | grep hugo
```

Should show only ONE hugo server process.

#### Verify build output:

```bash
ls -la public/
```

Should NOT exist (Hugo server doesn't create it in dev mode).

If it exists, remove it:
```bash
rm -rf public/
```

#### Check browser is pointing to 1313, not 58516:

In browser address bar, ensure URL is:
```
http://localhost:1313/
```

NOT:
```
http://localhost:58516/
```

---

## 🔬 Diagnostic Commands

Run these to verify environment state:

```bash
# Check latest commit
git log -1 --oneline

# Verify new files exist
ls -la content/about.md content/methodology.md static/favicon.svg CACHE_CLEARING.md

# Check CSP was removed
grep -n "Content-Security-Policy" layouts/partials/head.html || echo "✅ CSP removed"

# Check vocabulary pagination fix
grep -n 'range \$vocabulary' layouts/vocabulary/list.html || echo "❌ Not fixed"

# Check service worker version
grep "CACHE_NAME =" static/sw.js
```

Expected output:
```
✅ Files exist: about.md, methodology.md, favicon.svg, CACHE_CLEARING.md
✅ CSP removed (no output from grep)
✅ Vocabulary template fixed
✅ SW version: bgde-app-v1.4.0
```

---

## 🎯 Success Criteria

After following this procedure, ALL of these should pass:

- [ ] No `localhost:58516` references anywhere
- [ ] All assets load from `localhost:1313`
- [ ] No "Unexpected token 'export'" errors
- [ ] Vocabulary shows correct total pages (not just 1)
- [ ] `/vocabulary/?page=2` works and stays on page 2
- [ ] `/about/` loads successfully
- [ ] `/methodology/` loads successfully
- [ ] Grammar shows 13 topics (not 0)
- [ ] Favicon loads (no 404)
- [ ] Service Worker version `v1.4.0`
- [ ] No CSP meta tag warnings
- [ ] Language toggle works
- [ ] Practice session works

---

## 🆘 Still Not Working?

If after following ALL steps above issues persist:

1. **Screenshot your DevTools Console** showing errors
2. **Run diagnostic commands** and share output
3. **Check Hugo server output** for errors
4. **Try different browser** to isolate browser-specific cache issues

The code fixes are 100% committed. If you're still seeing old behavior, it's a cache issue.

---

## 📚 Technical Explanation

### Why This Happens

1. **Hugo generates static HTML** at build time
2. **Previous Hugo server** ran on port 58516, generated HTML with those URLs
3. **Browser cached that HTML** including `<script src="http://localhost:58516/...">` tags
4. **Service Worker cached** those scripts
5. **New Hugo server** runs on port 1313, but browser never fetches new HTML

### The Fix Requires

1. **Kill old Hugo** - Stop generating/serving old HTML
2. **Delete build artifacts** - Remove old generated files
3. **Clear browser cache** - Force browser to fetch new HTML
4. **Unregister Service Worker** - Stop serving old cached scripts
5. **Start Hugo with baseURL override** - Ensure correct port in generated HTML

All these steps are in the procedure above.
