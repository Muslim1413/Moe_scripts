# 🚀 Deployment Alternatives - Vercel Alternativlari

3ds Max uchun Asset Library ni deploy qilishning **3 ta BEPUL** yo'li.

---

## 1️⃣ NETLIFY ⭐ Tavsiya

### **Afzalliklari:**
- ✅ 100% bepul (hobby)
- ✅ Serverless functions
- ✅ GitHub auto-deploy
- ✅ Oddiy setup
- ✅ 100 GB bandwidth/oy

### **Deploy Qilish:**

#### **A) Web Interface:**

1. [netlify.com](https://netlify.com) ga o'ting
2. **Sign up** → GitHub bilan kiring
3. **Add new site** → **Import from Git**
4. GitHub repository: `Muslim1413/Moe_scripts` tanlang
5. Settings:
   ```
   Build command: (empty)
   Publish directory: .
   Functions directory: netlify/functions
   ```
6. **Deploy site** tugmasini bosing
7. 2-3 daqiqadan keyin URL oling:
   ```
   https://moe-scripts.netlify.app
   ```

#### **B) CLI:**

```bash
npm install -g netlify-cli
cd Moe_scripts
netlify deploy --prod
```

### **URL Format:**

```
Landing: https://moe-scripts.netlify.app
API:     https://moe-scripts.netlify.app/api/assets
```

### **3ds Max Script:**

```maxscript
global MAL_serverUrl = "https://moe-scripts.netlify.app/api/assets"
```

---

## 2️⃣ RENDER

### **Afzalliklari:**
- ✅ Bepul tier
- ✅ Static + API
- ✅ Oddiy interface
- ✅ Auto-deploy from Git

### **Deploy Qilish:**

1. [render.com](https://render.com) ga o'ting
2. **Sign up** → GitHub bilan kiring
3. **New** → **Static Site**
4. Repository: `Muslim1413/Moe_scripts`
5. Settings:
   ```
   Build command: (empty)
   Publish directory: .
   ```
6. **Create Static Site**
7. URL:
   ```
   https://moe-scripts.onrender.com
   ```

### **API uchun alohida service:**

1. **New** → **Web Service**
2. Repository: same
3. Settings:
   ```
   Runtime: Node
   Build: npm install
   Start: node server.js
   ```
4. Free tier tanlang

### **URL:**

```
https://moe-scripts-api.onrender.com/api/assets
```

---

## 3️⃣ RAILWAY

### **Afzalliklari:**
- ✅ Bepul $5/month credit
- ✅ Juda tez deploy
- ✅ GitHub integration
- ✅ Oddiy CLI

### **Deploy Qilish:**

1. [railway.app](https://railway.app) ga o'ting
2. **Start a New Project**
3. **Deploy from GitHub repo**
4. Repository: `Muslim1413/Moe_scripts`
5. Avtomatik deploy bo'ladi
6. URL:
   ```
   https://moe-scripts.up.railway.app
   ```

### **CLI:**

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## 📊 TAQQOSLASH

| Platform | Bepul Tier | Setup | Speed | 3ds Max |
|----------|------------|-------|-------|---------|
| **Netlify** | ✅ 100 GB | ⭐⭐⭐⭐⭐ | Tez | ✅ |
| **Render** | ✅ 100 GB | ⭐⭐⭐⭐ | O'rtacha | ✅ |
| **Railway** | ✅ $5/oy | ⭐⭐⭐⭐⭐ | Juda tez | ✅ |
| Vercel | ✅ 100 GB | ⭐⭐⭐ | Tez | ✅ |

---

## 🎯 QAYSI BIRINI TANLASH?

### **Netlify** - Agar oddiy kerak bo'lsa ⭐
- Setup: 5 daqiqa
- Interface: Oddiy
- Documentation: Juda yaxshi

### **Railway** - Agar tez kerak bo'lsa
- Setup: 2 daqiqa
- CLI: Zo'r
- Speed: Eng tez

### **Render** - Agar tanish bo'lsa
- Setup: 5 daqiqa
- Bepul tier: Yaxshi
- Heroku ga o'xshash

---

## 🔧 NETLIFY NI HOZIR DEPLOY QILAMIZMI?

Agar Netlify ni tanlasangiz, men hozir qilaman:

1. ✅ Netlify config tayyor (`netlify.toml`)
2. ✅ Functions tayyor (`netlify/functions/assets.js`)
3. ✅ HTML fayllar tayyor
4. 🔜 GitHub ga push → Netlify avtomatik deploy

**Netlify URL:**
```
https://moe-scripts.netlify.app/api/assets
```

---

## 📚 Qo'shimcha Ma'lumot

### Netlify Functions Documentation:
https://docs.netlify.com/functions/overview/

### Render Documentation:
https://render.com/docs

### Railway Documentation:
https://docs.railway.app

---

**Qaysi platformani tanladingiz? Men deploy qilaman!** 🚀
