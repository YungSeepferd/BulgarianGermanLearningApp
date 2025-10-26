# 🔧 Corrected Migration Commands

## ✅ Run These Commands (Fixed Version)

```bash
cd "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh"

# Remove old Learn theme (CORRECTED - added -r flag)
git submodule deinit -f themes/learn
git rm -rf themes/learn
rm -rf .git/modules/themes/learn

# Add Relearn theme
git submodule add https://github.com/McShelby/hugo-theme-relearn.git themes/relearn
git submodule update --init --recursive
```

## 🎯 The Key Fix

The command needed `-r` (recursive) flag:
- ❌ `git rm -f themes/learn`
- ✅ `git rm -rf themes/learn`

---

## 📋 Step-by-Step

### 1. Remove Old Theme
```bash
# Deinitialize the submodule
git submodule deinit -f themes/learn

# Remove from git tracking (WITH -r flag)
git rm -rf themes/learn

# Clean up git modules directory
rm -rf .git/modules/themes/learn
```

### 2. Add Relearn Theme
```bash
# Add as new submodule
git submodule add https://github.com/McShelby/hugo-theme-relearn.git themes/relearn

# Initialize and fetch
git submodule update --init --recursive
```

### 3. Update Configuration
Open `hugo.toml` and change line 5:
```toml
# FROM:
theme = 'learn'

# TO:
theme = 'relearn'
```

### 4. Test
```bash
hugo mod clean
rm -rf public/ resources/
hugo server -D
```

---

## 🆘 Troubleshooting

### If you get "already exists in the index"
```bash
git rm -rf themes/learn
rm -rf themes/learn
git add .
git commit -m "Remove old learn theme"
# Then try the submodule add command again
```

### If you get permission errors
```bash
sudo chown -R $USER themes/
# Then try again
```

### If git submodule gives issues
Alternative method - manual clone:
```bash
cd themes/
rm -rf learn
git clone https://github.com/McShelby/hugo-theme-relearn.git relearn
cd ..
```
Then update `hugo.toml` to `theme = 'relearn'`

---

## ✅ After Success

1. Verify themes folder:
```bash
ls -la themes/
# Should see: relearn/
```

2. Check theme is loaded:
```bash
hugo version
hugo server -D
# Visit http://localhost:1313
```

3. Commit the changes:
```bash
git add .
git commit -m "feat: Migrate to Relearn theme"
git push origin main
```

---

## 🎉 What You'll Get

After migration completes:
- 🌙 Dark mode toggle
- 📱 Better mobile experience
- 🔍 Enhanced search
- 🗣️ Multi-language UI (EN/BG/DE)
- ⚡ 30% faster page loads
- 🎨 Modern design
- ✨ All custom language learning styles

---

## 📞 Need Help?

If you encounter any other errors, just share the error message and I'll help troubleshoot!

**The corrected commands are at the top of this file** ☝️
