# 🚀 Vercel Deployment Guide

## ✅ Deployment Status

**Production URL:** `https://moe-scripts.vercel.app`

**API Endpoint:** `https://moe-scripts.vercel.app/api/assets`

---

## 📋 Pre-Deployment Checklist

- ✅ `vercel.json` configured
- ✅ `package.json` with Node.js 18
- ✅ `index.html` landing page
- ✅ `api/assets.js` serverless function
- ✅ CORS headers configured

---

## 🔧 Common Issues & Solutions

### Issue 1: "404 NOT FOUND"

**Symptoms:**
- Browser shows `404 NOT FOUND`
- Code: `NOT_FOUND`

**Causes:**
1. Deployment still in progress
2. Old cache in browser
3. Wrong URL

**Solutions:**

**A) Wait for Deployment:**
1. Go to Vercel Dashboard → Deployments
2. Check latest deployment status
3. Wait for ✓ Ready (1-3 minutes)

**B) Clear Cache:**
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

Or open in Incognito/Private mode.

**C) Verify URL:**
```
✓ Correct: https://moe-scripts.vercel.app
✗ Wrong:   http://moe-scripts.vercel.app (no HTTPS)
✗ Wrong:   moe-scripts.vercel.app (no protocol)
```

---

### Issue 2: Build Warnings/Recommendations

Vercel may show recommendations like:
- "Add Output Directory"
- "Set Node.js Version"
- "Configure Build Command"

**Solution:** These are already configured in `vercel.json`:
```json
{
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null,
  "engines": { "node": "18.x" }
}
```

You can safely ignore these warnings.

---

### Issue 3: API Returns Empty `[]`

**Symptoms:**
- `/api/assets` returns `[]`
- No errors

**Cause:** This is **NORMAL**! The database is empty.

**Solution:** Add assets via:
1. Web app (when ready)
2. Direct API call (POST request)
3. 3ds Max script (after adding via web)

---

### Issue 4: CORS Errors

**Symptoms:**
- Browser console: `CORS policy blocked`
- 3ds Max: Cannot connect

**Cause:** CORS headers not applied

**Solution:** Already fixed in `vercel.json`:
```json
"headers": [{
  "key": "Access-Control-Allow-Origin",
  "value": "*"
}]
```

If still occurring:
1. Redeploy: Vercel Dashboard → Deployments → Redeploy
2. Check logs: Deployments → Latest → Runtime Logs

---

## 🧪 Testing Checklist

### 1. Browser Test

**Landing Page:**
```
https://moe-scripts.vercel.app
```

**Expected:**
```
⬢
My Asset Library
Personal 3D Asset Management System

✅ Deploy Successful!
```

**API Endpoint:**
```
https://moe-scripts.vercel.app/api/assets
```

**Expected:**
```json
[]
```

### 2. API Tests

**GET - List Assets:**
```bash
curl https://moe-scripts.vercel.app/api/assets
# Expected: []
```

**POST - Add Asset:**
```bash
curl -X POST https://moe-scripts.vercel.app/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cube",
    "mainCategory": "3D Models",
    "subCategory": "Accessories",
    "format": "max",
    "size": "5 MB",
    "tags": ["test"],
    "cloudUrl": "https://example.com/test.max",
    "description": "Test asset"
  }'

# Expected: { "id": 1, "name": "Test Cube", ... }
```

**GET - Verify:**
```bash
curl https://moe-scripts.vercel.app/api/assets
# Expected: [{ "id": 1, "name": "Test Cube", ... }]
```

### 3. 3ds Max Test

1. Open `MyAssetLibrary_v4.ms`
2. Verify URL:
   ```maxscript
   global MAL_serverUrl = "https://moe-scripts.vercel.app/api/assets"
   ```
3. Run script in 3ds Max
4. Go to **Settings** tab
5. Click **🔗 Test qilish**
6. Expected: `✓ Ulanish muvaffaqiyatli! (2 belgi)`

---

## 📊 Vercel Dashboard Guide

### Deployments Tab

**Status Indicators:**
- ⏳ **Building** - In progress
- ✓ **Ready** - Successful
- ✗ **Error** - Failed

**Actions:**
- **Visit** - Open deployed site
- **...** → **Redeploy** - Deploy again
- **Logs** - View build/runtime logs

### Settings Tab

**Important Settings:**
- **General** → **Node.js Version**: 18.x
- **General** → **Framework Preset**: Other
- **Domains** → Primary: `moe-scripts.vercel.app`
- **Functions** → **Region**: Automatic

### Logs Tab

**Runtime Logs:**
- API request logs
- Error messages
- Performance metrics

**Build Logs:**
- Deployment process
- Build errors/warnings

---

## 🔄 Redeploying

### Via Dashboard

1. Go to **Deployments**
2. Click **...** on any deployment
3. Select **Redeploy**
4. Confirm

### Via Git Push

```bash
git add .
git commit -m "Update"
git push origin main
```

Vercel auto-deploys on push to `main` branch.

### Via CLI

```bash
cd Moe_scripts
vercel --prod
```

---

## 🐛 Debugging

### Check Deployment Logs

1. Vercel Dashboard → **Deployments**
2. Click on latest deployment
3. View **Build Logs** and **Runtime Logs**

### Check Function Logs

1. Deployments → Latest → **Functions**
2. Click `/api/assets`
3. View invocation logs

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 404 | File not found | Check file exists, clear cache |
| 500 | Server error | Check API code, view logs |
| 502 | Gateway error | Redeploy |
| 504 | Timeout | Increase function timeout |

---

## 📈 Performance Tips

### Enable Caching

Already configured in `vercel.json`:
```json
"headers": [{
  "key": "Cache-Control",
  "value": "public, max-age=3600"
}]
```

### Monitor Usage

Dashboard → **Analytics**:
- Bandwidth usage
- Function invocations
- Response times

### Free Tier Limits

- 100 GB bandwidth/month
- 100 GB-hours serverless
- 6,000 build minutes/month

Your project should stay well within limits! 🎉

---

## 🆘 Still Having Issues?

### 1. Check GitHub Actions

If deployment isn't triggering:
1. GitHub repo → **Actions** tab
2. Check workflow runs
3. View logs for errors

### 2. Vercel Support

- [Vercel Documentation](https://vercel.com/docs)
- [Community Forum](https://github.com/vercel/vercel/discussions)
- [Status Page](https://vercel-status.com)

### 3. Project Issues

- [GitHub Issues](https://github.com/Muslim1413/Moe_scripts/issues)
- Create new issue with:
  - Screenshots
  - Error messages
  - Steps to reproduce

---

## ✅ Success Checklist

- ✓ Landing page loads
- ✓ API returns `[]` or data
- ✓ 3ds Max connects successfully
- ✓ No errors in Vercel logs
- ✓ Assets can be added/retrieved

---

**Last Updated:** 2026-06-01  
**Version:** 4.0  
**Status:** Production Ready 🚀
