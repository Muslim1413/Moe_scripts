# ⚡ Quick Start Guide

## 5 Daqiqada Ishga Tushirish

### 1️⃣ Vercel Deploy (2 daqiqa)

**Vercel Web orqali:**
1. [vercel.com](https://vercel.com) ga kiring (GitHub akkaunt bilan)
2. **New Project** tugmasini bosing
3. GitHub'dan ushbu reponi import qiling
4. **Deploy** tugmasini bosing
5. Tayyor! URL ni copy qiling: `https://your-app.vercel.app`

### 2️⃣ 3ds Max Setup (2 daqiqa)

1. `MyAssetLibrary_v4.ms` faylini oching
2. 2-qatorni o'zgartiring:
   ```maxscript
   global MAL_serverUrl = "https://YOUR-APP.vercel.app/api/assets"
   ```
3. 3ds Max da: **Scripting** → **Run Script** → `MyAssetLibrary_v4.ms`
4. Floater ochiladi!

### 3️⃣ Test Qilish (1 daqiqa)

**3ds Max da:**
1. **Settings** tabini oching
2. **Test qilish** tugmasini bosing
3. "✓ Ulanish muvaffaqiyatli!" ko'rishingiz kerak

**Web App da:**
1. Browser da `https://your-app.vercel.app` ni oching
2. **Add New Asset** tugmasini bosing
3. Test asset qo'shing:
   - **Name**: `Test Cube`
   - **Category**: `3D Models` / `Furniture`
   - **Format**: `max`
   - **Cloud URL**: `https://example.com/test.max` (test uchun)

### 4️⃣ Birinchi Asset Import (30 soniya)

1. 3ds Max floaterda **Yuklash** tugmasini bosing
2. "Test Cube" ni ko'rishingiz kerak
3. Tanlang va **SAHNAGA IMPORT QILISH**
4. ✅ Tayyor!

---

## 🎯 Keyingi Qadamlar

### Haqiqiy Asset Qo'shish

1. **3D faylni Google Drive ga yuklang**
2. **Share** → **Get link** → **Anyone with the link**
3. URL formatini o'zgartiring:
   ```
   OLD: https://drive.google.com/file/d/FILE_ID/view
   NEW: https://drive.google.com/uc?id=FILE_ID&export=download
   ```
4. Web app da **Add New Asset** va yangi URL ni qo'shing

### Thumbnail Qo'shish

1. Asset screenshot oling (PNG/JPG)
2. Web app da asset qo'shayotganda **Thumbnail** tugmasini bosing
3. Rasm tanlang
4. Saqlang — endi preview bor!

---

## 🐛 Muammolar?

### "Server xatosi!"
- URL ni tekshiring: `https://your-app.vercel.app/api/assets`
- Browser da ochib ko'ring — `[]` ko'rinishi kerak

### "Ulanib bo'lmadi!"
- Internet ulanishini tekshiring
- Vercel app ishlab turganligini tekshiring

### Import xatosi
- Cloud URL to'g'riligini tekshiring
- Format qo'llab-quvvatlanishini tekshiring

---

## 📚 To'liq Dokumentatsiya

Batafsil ma'lumot uchun: [README.md](README.md)

---

**Muvaffaqiyatlar! 🚀**
