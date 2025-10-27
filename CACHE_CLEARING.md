# Clearing Browser Cache and Service Worker

## The Issue

If you see errors like:
- `net::ERR_CONNECTION_REFUSED` to `http://localhost:58516/...`
- Scripts loading from wrong port
- Old cached content appearing

This is caused by browser cache and service worker caching old URLs.

## Solution

### Method 1: Hard Refresh (Fastest)

**Chrome/Edge/Brave:**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Firefox:**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Safari:**
- Mac: `Cmd + Option + R`

### Method 2: Clear All Site Data (Most Thorough)

**Chrome/Edge/Brave:**
1. Open DevTools (`F12`)
2. Go to **Application** tab
3. In left sidebar, click **Storage**
4. Click **Clear site data** button
5. Reload page (`F5`)

**Firefox:**
1. Open DevTools (`F12`)
2. Go to **Storage** tab
3. Right-click on origin (`http://localhost:1313`)
4. Select **Delete All**
5. Reload page (`F5`)

### Method 3: Unregister Service Worker Manually

**All Browsers:**
1. Open DevTools (`F12`)
2. Go to **Application** (Chrome) or **Storage** (Firefox) tab
3. Find **Service Workers** in left sidebar
4. Click **Unregister** next to the service worker
5. Close and reopen browser tab
6. Hard refresh (`Ctrl + Shift + R`)

### Method 4: Use Incognito/Private Window

Open an incognito/private window:
- Chrome: `Ctrl + Shift + N` (Windows/Linux) or `Cmd + Shift + N` (Mac)
- Firefox: `Ctrl + Shift + P` (Windows/Linux) or `Cmd + Shift + P` (Mac)
- Safari: `Cmd + Shift + N` (Mac)

Navigate to `http://localhost:1313` - no cache will interfere.

## Prevention

### During Development

**Disable cache while DevTools is open:**
1. Open DevTools (`F12`)
2. Go to **Network** tab
3. Check **Disable cache** checkbox
4. Keep DevTools open while developing

### Start Hugo with Clean Build

```bash
# Remove old build artifacts
rm -rf public/ resources/

# Start Hugo server
hugo server --port 1313 --disableFastRender
```

The `--disableFastRender` flag ensures Hugo rebuilds all pages from scratch.

## Service Worker Updates

The app automatically updates the service worker when the cache version changes. Current version is displayed in the console:

```
[SW] Service worker activated and ready
```

If you see an old version, follow the clearing steps above.

## Verifying the Fix

After clearing cache, verify:

1. **Console is clean** - No `net::ERR_CONNECTION_REFUSED` errors
2. **Correct port** - All scripts load from `http://localhost:1313/...`
3. **No module errors** - No "Unexpected token 'export'" errors
4. **Service worker updated** - Console shows latest cache version (`bgde-app-v1.4.0`)

## Still Having Issues?

If the problem persists after trying all methods:

1. **Check Hugo is running on port 1313:**
   ```bash
   lsof -i :1313
   ```

2. **Check no other Hugo instance is running:**
   ```bash
   ps aux | grep hugo
   ```

3. **Restart Hugo server:**
   ```bash
   # Kill any running Hugo processes
   pkill hugo

   # Start fresh
   rm -rf public/ resources/
   hugo server --port 1313 --disableFastRender
   ```

4. **Try a different browser** - Sometimes browser profiles get corrupted

## Technical Details

The issue occurs because:
- Service Worker caches assets at install time
- Browser cache stores responses with long TTLs
- Hugo's livereload can change ports between runs
- Old cached references persist until explicitly cleared

The fix ensures:
- Service Worker cache version incremented (`v1.4.0`)
- All assets use relative URLs (`RelPermalink`)
- Clean build removes stale artifacts
