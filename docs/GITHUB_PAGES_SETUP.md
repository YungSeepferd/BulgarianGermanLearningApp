# GitHub Pages Setup - Fix Deployment

**Issue**: GitHub Pages is showing README.md instead of the Hugo site  
**Cause**: Pages is set to deploy from branch instead of GitHub Actions  
**Solution**: Change Pages source to GitHub Actions

---

## 🔧 Fix Steps (Required)

### Step 1: Go to Repository Settings

1. Visit: https://github.com/YungSeepferd/BulgarianGermanLearningApp/settings/pages
2. Or navigate manually:
   - Go to your repository
   - Click **Settings** tab
   - Click **Pages** in the left sidebar

### Step 2: Change Build and Deployment Source

**Current setting** (WRONG):
```
Source: Deploy from a branch
Branch: main / (root)
```

**Change to** (CORRECT):
```
Source: GitHub Actions
```

### Step 3: Save and Wait

1. Select **"GitHub Actions"** from the "Source" dropdown
2. The page will refresh automatically
3. Wait 2-3 minutes for redeployment

### Step 4: Verify Deployment

After changing the setting:
1. Go to: https://github.com/YungSeepferd/BulgarianGermanLearningApp/actions
2. You should see a new workflow run triggered
3. Wait for it to complete (green checkmark)
4. Visit: https://yungseepferd.github.io/BulgarianGermanLearningApp/

**Expected result**: Full Hugo site (not README)

---

## 📸 Visual Guide

### What You Should See in Settings

**BEFORE (Wrong - showing README)**:
```
┌─────────────────────────────────────┐
│ Build and deployment               │
│                                     │
│ Source: Deploy from a branch ▼     │  ← CHANGE THIS
│ Branch: main ▼  / (root) ▼  Save   │
└─────────────────────────────────────┘
```

**AFTER (Correct - showing Hugo site)**:
```
┌─────────────────────────────────────┐
│ Build and deployment               │
│                                     │
│ Source: GitHub Actions ▼           │  ← CORRECT!
│                                     │
│ ✓ Your site will be built          │
│   using GitHub Actions             │
└─────────────────────────────────────┘
```

---

## 🎯 Why This Fixes It

### Current Problem
- **Source**: "Deploy from a branch"
- **What it does**: GitHub Pages shows files directly from `main` branch root
- **Result**: Shows `README.md` as the homepage

### After Fix
- **Source**: "GitHub Actions"
- **What it does**: Uses `.github/workflows/deploy.yml` to build Hugo site
- **Process**: 
  1. Checks out code
  2. Installs Hugo Extended
  3. Runs `hugo --gc --minify`
  4. Deploys built `public/` directory
- **Result**: Full Hugo site with vocabulary, grammar, practice pages

---

## ✅ Verification Steps

After changing the setting and waiting for deployment:

### 1. Check Homepage
Visit: https://yungseepferd.github.io/BulgarianGermanLearningApp/

**Should show**:
- Bulgarian-German Learning App title
- Navigation menu (Vocabulary, Grammar, Practice)
- Language toggle (Bulgarian ↔ German)
- Theme toggle (dark/light)
- Welcome content

**Should NOT show**:
- Raw README.md text
- GitHub repository file listing

### 2. Test Navigation
Click through:
- [ ] Vocabulary page loads
- [ ] Grammar page loads
- [ ] Practice page loads
- [ ] Flashcards work
- [ ] Language toggle functions

### 3. Check Console (F12)
- [ ] No 404 errors for CSS/JS
- [ ] Assets load correctly
- [ ] No critical JavaScript errors

---

## 🚨 If It Still Shows README

### Possible Issues

**Issue 1: Cached Old Version**
- **Solution**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Or try incognito/private browsing mode

**Issue 2: Wrong baseURL in hugo.toml**
- **Current**: `baseURL = 'https://yungseepferd.github.io/BulgarianGermanLearningApp'`
- **Should be**: `baseURL = 'https://yungseepferd.github.io/BulgarianGermanLearningApp/'`
- Note the trailing slash `/`

**Issue 3: Build Failed**
- Check: https://github.com/YungSeepferd/BulgarianGermanLearningApp/actions
- Look for red X (failed) or yellow dot (running)
- Click to see error logs

**Issue 4: Wrong Branch**
- Ensure your latest code is on `main` branch
- Check: https://github.com/YungSeepferd/BulgarianGermanLearningApp/tree/main

---

## 🔄 If Build Fails in GitHub Actions

### Common Errors and Fixes

**Error: "Hugo version mismatch"**
```bash
# Fix: Update HUGO_VERSION in deploy.yml
env:
  HUGO_VERSION: 0.148.2  # Match your local version
```

**Error: "Go build failed"**
```bash
# Fix: Ensure Go module is valid
cd tools && go mod tidy
git add tools/go.mod tools/go.sum
git commit -m "fix: update Go modules"
git push
```

**Error: "npm install failed"**
```bash
# Fix: Update package.json or remove npm step temporarily
# Comment out lines 53-54 in deploy.yml if not needed
```

---

## 📝 Alternative: Quick Fix Commit

If you want to be extra safe, add the trailing slash to baseURL:

```bash
# Edit hugo.toml line 1 to add trailing slash
baseURL = 'https://yungseepferd.github.io/BulgarianGermanLearningApp/'

# Commit and push
git add hugo.toml
git commit -m "fix: add trailing slash to baseURL for GitHub Pages"
git push origin main
```

Then follow the GitHub Pages settings change above.

---

## 🎯 Expected Timeline

| Step | Duration | Action |
|------|----------|--------|
| Change Pages source | 10 seconds | You do this manually |
| Trigger deployment | Automatic | GitHub Actions starts |
| Build Hugo site | 2-3 minutes | Workflow runs |
| Deploy to Pages | 30 seconds | Automatic |
| DNS propagation | 1-5 minutes | Automatic |
| **Total** | **5-10 minutes** | Wait and verify |

---

## 📞 Quick Checklist

Before asking for help, verify:
- [ ] Changed Pages source to "GitHub Actions" in settings
- [ ] Latest workflow run succeeded (green checkmark)
- [ ] Hard refreshed browser (cleared cache)
- [ ] Waited at least 5 minutes after workflow completed
- [ ] Tried incognito/private browsing mode
- [ ] Checked browser console for errors

---

## 🔗 Useful Links

- **Pages Settings**: https://github.com/YungSeepferd/BulgarianGermanLearningApp/settings/pages
- **Actions Log**: https://github.com/YungSeepferd/BulgarianGermanLearningApp/actions
- **Live Site**: https://yungseepferd.github.io/BulgarianGermanLearningApp/
- **Hugo Docs**: https://gohugo.io/hosting-and-deployment/hosting-on-github/

---

**Created**: October 19, 2025, 3:40 PM  
**Issue**: GitHub Pages showing README instead of Hugo site  
**Status**: ⏳ Waiting for you to change Pages settings
