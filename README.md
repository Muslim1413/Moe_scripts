# 🎨 My Asset Library - Chaos Cosmos Style

**Shaxsiy 3D Asset kutubxonangiz** — Chaos Cosmos interfeysidan ilhomlangan professional asset management tizimi.

![Version](https://img.shields.io/badge/version-4.0-blue)
![3ds Max](https://img.shields.io/badge/3ds%20Max-2020+-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Xususiyatlar

### 🌐 Web Application
- **Chaos Cosmos style UI** — professional dark theme, sidebar navigation
- **Asset kartalar** — thumbnail preview, hover effects
- **Kategoriyalar** — 3D Models, Materials, HDRIs, Collections, Creators
- **Qidiruv va filter** — tez topish uchun
- **Cloud storage integration** — Google Drive, Dropbox, S3
- **Local storage** — browserda saqlash (yoki server DB)

### 🔧 3ds Max Script
- **Floater interface** — qulay, ko'chma oyna
- **Server integratsiya** — real-time asset yuklash
- **Cache management** — yuklab olingan fayllarni qayta ishlatish
- **Ko'p formatlar** — .max, .fbx, .obj, .glb, .3ds, .c4d, .blend, .abc
- **Avtomatik import** — to'g'ridan-to'g'ri sahnaga

---

## 🚀 O'rnatish

### 1. Web App Deploy (Vercel)

#### Variantlar:

**A) Vercel Web Interface orqali:**

1. [vercel.com](https://vercel.com) ga kiring
2. **New Project** → **Import Git Repository**
3. Ushbu repo ni import qiling yoki drag & drop qiling:
   ```
   Moe_scripts/
   ├── AssetLibrary_Cosmos.jsx
   └── api/
       └── assets.js
   ```
4. Deploy tugmasini bosing
5. Tayyor! URL ni oling: `https://your-app.vercel.app`

**B) Vercel CLI orqali:**

```bash
# Vercel CLI o'rnatish
npm install -g vercel

# Loyiha papkasiga kiring
cd Moe_scripts

# Deploy qilish
vercel

# Production deploy
vercel --prod
```



### 2. 3ds Max Script O'rnatish

#### Qadam 1: Script ni saqlash

1. `MyAssetLibrary_v4.ms` faylini oching
2. **2-qator**ni o'zgartiring:
   ```maxscript
   global MAL_serverUrl = "https://YOUR-APP.vercel.app/api/assets"
   ```
   O'rniga o'zingizning Vercel URL ingizni yozing

3. Faylni saqlang: `C:\Users\YourName\Documents\3dsMax\scripts\MyAssetLibrary_v4.ms`

#### Qadam 2: 3ds Max da ishga tushirish

1. 3ds Max ni oching
2. **Scripting** → **Run Script...** (yoki `Ctrl+E`)
3. `MyAssetLibrary_v4.ms` ni tanlang
4. Floater oynasi avtomatik ochiladi

#### Qadam 3: Sozlash

1. **Settings** tabini oching
2. URL ni tekshiring va **Test qilish** tugmasini bosing
3. Agar "✓ Ulanish muvaffaqiyatli!" ko'rsatilsa — tayyor!

---

## 📖 Foydalanish

### Web App da Asset Qo'shish

1. Web app ni oching: `https://your-app.vercel.app`
2. **Add New Asset** tugmasini bosing
3. Formani to'ldiring:
   - **Asset Name**: Misol: `Modern Leather Sofa 01`
   - **Main Category**: `3D Models`
   - **Sub-Category**: `Furniture`
   - **Format**: `max` (yoki `fbx`, `obj`, va h.k.)
   - **Cloud URL**: Google Drive public link
     ```
     https://drive.google.com/uc?id=FILE_ID&export=download
     ```
   - **Tags**: `leather, modern, sofa, brown`
   - **Thumbnail**: Rasm yuklash

4. **Add Asset** tugmasini bosing

### 3ds Max da Asset Import Qilish

1. Floater oynasidan kategoriya tanlang
2. Qidiruv qutisiga yozing (ixtiyoriy)
3. **Yuklash** tugmasini bosing
4. Listboxdan asset tanlang
5. **SAHNAGA IMPORT QILISH** tugmasini bosing
6. Cache dialog chiqsa — **Ha** (tezroq) yoki **Yo'q** (qayta yuklash)
7. Asset avtomatik sahnaga import bo'ladi

---

## 🗂 Cloud Storage URL olish

### Google Drive

1. Faylni Google Drive ga yuklang
2. **Share** → **Get link** → **Anyone with the link**
3. Link ni oling: `https://drive.google.com/file/d/FILE_ID/view`
4. Formatni o'zgartiring:
   ```
   https://drive.google.com/uc?id=FILE_ID&export=download
   ```

### Dropbox

1. Faylni Dropbox ga yuklang
2. **Share** → **Create link**
3. Link oxiridagi `?dl=0` ni `?dl=1` ga o'zgartiring:
   ```
   https://www.dropbox.com/s/xxxxx/file.max?dl=1
   ```

### Amazon S3

1. Bucket yarating (public read access)
2. Faylni yuklang
3. Object URL ni oling:
   ```
   https://your-bucket.s3.amazonaws.com/file.max
   ```

---



## 🏗 Arxitektura

```
┌─────────────────────────────────────────────────────────┐
│                    Web Application                       │
│         (React + Tabler Icons + Local Storage)          │
│  - Asset kartalar, kategoriyalar, qidiruv, CRUD         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTPS
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Vercel Serverless API                       │
│                  /api/assets.js                          │
│  GET    - List/filter assets                            │
│  POST   - Add new asset                                 │
│  PUT    - Update asset                                  │
│  DELETE - Remove asset                                  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTP GET
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  3ds Max MAXScript                       │
│            MyAssetLibrary_v4.ms                         │
│  - Fetch assets, download files, cache, import          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Download
                      │
┌─────────────────────▼───────────────────────────────────┐
│               Cloud Storage (URL)                        │
│    Google Drive / Dropbox / S3 / Direct Link           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Kategoriyalar

### 3D Models
- Furniture
- Accessories
- Lighting
- Vegetation
- Vehicles
- People
- Animals
- Architecture
- Presets
- Enmesh - Pattern

### Materials
- Wood
- Metal
- Fabric
- Stone
- Glass
- Concrete
- Plastic
- Other

### HDRIs
- Interior
- Exterior
- Studio
- Nature
- Urban

### Collections
- Custom collections

### Creators
- By artist/creator

---

## ⚙️ Sozlamalar

### Web App

```javascript
// AssetLibrary_Cosmos.jsx
const STORAGE_KEY = "mal_cosmos_v1"; // Browser storage key

// LocalStorage yoki window.storage API
```

### MAXScript

```maxscript
-- MyAssetLibrary_v4.ms
global MAL_serverUrl  = "https://your-app.vercel.app/api/assets"
global MAL_tempFolder = (getDir #temp) + "\\MyAssetLib\\"
```

### API (Vercel)

```javascript
// api/assets.js
// In-memory storage (demo)
// Production uchun: Vercel KV, MongoDB, PostgreSQL
```

---

## 🔧 Muammolarni Hal Qilish

### "Server xatosi!" xabari

**Sabab**: URL noto'g'ri yoki internet ulanishi yo'q

**Yechim**:
1. Settings tabda URL ni tekshiring
2. **Test qilish** tugmasini bosing
3. Browser da URL ni oching: `https://your-app.vercel.app/api/assets`
4. JSON qaytishi kerak: `[]` yoki `[{...}]`

### "Fayl yuklanmadi!" xabari

**Sabab**: Cloud URL noto'g'ri yoki fayl o'chirilgan

**Yechim**:
1. Web app da asset ni oching
2. Cloud URL ni tekshiring
3. Browser da URL ni oching — fayl yuklanishi kerak
4. Google Drive: `?dl=1` yoki `export=download` qo'shing

### Import xatosi

**Sabab**: Format qo'llab-quvvatlanmaydi yoki fayl buzilgan

**Yechim**:
1. Fayl formatini tekshiring: `.max`, `.fbx`, `.obj`, va h.k.
2. Faylni qo'lda import qiling: File → Import
3. Agar ishlasa, cloud URL da muammo bor

### Cache muammosi

**Yechim**:
- Settings → **Cache Tozalash**
- Papkani ochish: Settings → **Papkani Ochish**
- Papka: `C:\Users\YourName\AppData\Local\Temp\MyAssetLib\`

---



## 📸 Screenshots

### Web Application (Chaos Cosmos Style)
```
┌────────────────────────────────────────────────────────┐
│  ╔══════════╗  ┌─────────────────────────────────────┐ │
│  ║ 3D Models║  │  Search: [.....................]    │ │
│  ║ > Furn.  ║  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │ │
│  ║   Access.║  │  │img  │ │img  │ │img  │ │img  │  │ │
│  ║   Light. ║  │  │Sofa │ │Chair│ │Table│ │Lamp │  │ │
│  ╠══════════╣  │  └─────┘ └─────┘ └─────┘ └─────┘  │ │
│  ║ Materials║  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │ │
│  ║ HDRIs    ║  │  │img  │ │img  │ │img  │ │img  │  │ │
│  ╚══════════╝  │  └─────┘ └─────┘ └─────┘ └─────┘  │ │
│                 └─────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 3ds Max Floater
```
┌──────────────────────────────────────────────┐
│  ⬢  MY ASSET LIBRARY                        │
│  Personal 3D Assets Collection               │
│  ──────────────────────────────────────────  │
│                                               │
│  Kategoriya: [3D Models ▼]                   │
│  Sub-kat:    [Furniture ▼]                   │
│  Qidirish:   [.....................]         │
│  [🔄 Yuklash]  [✖ Tozalash]                 │
│                                               │
│  ┌──────────────────────────────────────┐    │
│  │ Leather Sofa 001    [.max]           │    │
│  │ Office Chair Modern [.fbx]           │    │
│  │ Wooden Table        [.obj]           │    │
│  └──────────────────────────────────────┘    │
│                                               │
│  Nom:      Leather Sofa 001                  │
│  Kat:      3D Models / Furniture             │
│  Format:   .max                              │
│  Hajm:     12.5 MB                           │
│                                               │
│  [⬇  SAHNAGA IMPORT QILISH]                 │
│                                               │
│  [ℹ Ma'lumot]  [📋 URL Nusxa]               │
│  ✓ 3 asset yuklandi                         │
└──────────────────────────────────────────────┘
```

---

## 🚀 Keyingi Qadamlar

### Backend Database (Production)

**Vercel KV** (Redis):
```bash
npm install @vercel/kv
```

```javascript
// api/assets.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const assets = await kv.get('assets') || [];
  // ... CRUD operations
  await kv.set('assets', assets);
}
```

**MongoDB**:
```bash
npm install mongodb
```

```javascript
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.MONGODB_URI);
```

**PostgreSQL (Vercel Postgres)**:
```bash
npm install @vercel/postgres
```

### Asset Download Progress

3ds Max da yuklash progressini ko'rsatish:

```maxscript
-- Progress bar qo'shish
progressStart "Yuklanmoqda..."
-- Download...
progressUpdate (percentage)
progressEnd()
```

### Thumbnail Generation

Server-side thumbnail generatsiya (Sharp.js):

```bash
npm install sharp
```

```javascript
import sharp from 'sharp';
// Auto-generate thumbnails from 3D file screenshots
```

---

## 📝 Litsenziya

MIT License - bepul foydalaning, o'zgartiring, tarqating!

---

## 🤝 Hissa Qo'shish

Pull requestlar xush kelibsiz!

1. Fork qiling
2. Feature branch yarating: `git checkout -b feature/AmazingFeature`
3. Commit qiling: `git commit -m 'Add AmazingFeature'`
4. Push qiling: `git push origin feature/AmazingFeature`
5. Pull Request oching

---

## 📧 Aloqa

**GitHub**: [Muslim1413/Moe_scripts](https://github.com/Muslim1413/Moe_scripts)

**Issues**: [GitHub Issues](https://github.com/Muslim1413/Moe_scripts/issues)

---

## 🌟 Minnatdorchilik

- **Chaos Cosmos** - interfeys dizayni uchun ilhom
- **Tabler Icons** - chiroyli iconlar
- **Vercel** - bepul hosting
- **3ds Max** - MAXScript API

---

**Enjoy your personal asset library! 🎨✨**
