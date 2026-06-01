import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// MY ASSET LIBRARY - Chaos Cosmos Style Interface
// ═══════════════════════════════════════════════════════════════
// Required: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">

// ─── KATEGORIYALAR (Chaos Cosmos style hierarchy) ─────────────
const CATEGORIES = {
  "3D Models": {
    icon: "ti-box",
    color: "#6C63FF",
    sub: ["Furniture","Accessories","Lighting","Vegetation","Vehicles","People","Animals","Architecture","Presets","Enmesh - Pattern"]
  },
  "Materials": {
    icon: "ti-palette",
    color: "#FF6584",
    sub: ["Wood","Metal","Fabric","Stone","Glass","Concrete","Plastic","Other"]
  },
  "HDRIs": {
    icon: "ti-sun",
    color: "#F5A623",
    sub: ["Interior","Exterior","Studio","Nature","Urban"]
  },
  "Collections": { icon: "ti-folders", color: "#43C59E", sub: [] },
  "Creators":    { icon: "ti-user",    color: "#A0AEC0", sub: [] }
};

const STORAGE_KEY = "mal_assets_v4_cosmos";

// ─── STORAGE HOOK ─────────────────────────────────────────────
// FIX: window.storage mavjudligini tekshirish + fallback localStorage
function useStorage() {
  const load = useCallback(async () => {
    try {
      if (typeof window.storage !== "undefined") {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) return JSON.parse(res.value);
      } else {
        // fallback: localStorage
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.error("Storage load error:", e);
    }
    return { assets: [], nextId: 1 };
  }, []); // FIX: bo'sh dependency — funksiya bir marta yaratiladi

  const save = useCallback(async (data) => {
    const json = JSON.stringify(data);
    try {
      if (typeof window.storage !== "undefined") {
        await window.storage.set(STORAGE_KEY, json);
      } else {
        localStorage.setItem(STORAGE_KEY, json);
      }
    } catch (e) {
      console.error("Storage save error:", e);
    }
  }, []); // FIX: bo'sh dependency

  return { load, save };
}

// ─── MODAL ────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  // FIX: Escape klavishi bilan yopish
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 999, padding: 12
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#1a1a2e", border: "1px solid #2d2d4e", borderRadius: 14,
        padding: "22px 26px", width: 520, maxWidth: "100%",
        maxHeight: "88vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: "#e0e0ff", fontSize: 16, fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: "#666",
            cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px",
            display: "flex", alignItems: "center"
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────
function ConfirmDialog({ message, onYes, onNo }) {
  return (
    <Modal title="Tasdiqlash" onClose={onNo}>
      <p style={{ color: "#ccc", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onNo} style={{
          flex: 1, background: "transparent", border: "1px solid #3d3d6b",
          borderRadius: 8, padding: "9px 0", color: "#888", cursor: "pointer", fontSize: 13
        }}>Bekor qilish</button>
        <button onClick={onYes} style={{
          flex: 1, background: "#c0404a", border: "none",
          borderRadius: 8, padding: "9px 0", color: "#fff",
          cursor: "pointer", fontWeight: 600, fontSize: 13
        }}>Ha, o'chirish</button>
      </div>
    </Modal>
  );
}

// ─── ASSET FORM (qo'shish + tahrirlash) ──────────────────────
const DEFAULT_FORM = {
  name: "", mainCategory: "3D Models", subCategory: "Furniture",
  format: "max", size: "", tags: "", description: "", cloudUrl: "", thumbnail: ""
};

function AssetForm({ initial, onSave, onClose }) {
  // FIX: initial o'zgarganda form reset bo'lishi uchun key ishlatiladi (parent tomonidan)
  const [form, setForm] = useState(() => {
    if (!initial) return { ...DEFAULT_FORM };
    return {
      ...DEFAULT_FORM,
      ...initial,
      // FIX: tags array bo'lsa string ga aylantir
      tags: Array.isArray(initial.tags)
        ? initial.tags.join(", ")
        : (initial.tags || "")
    };
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const parts = file.name.split(".");
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
    const nameNoExt = parts.join(".");
    setForm(f => ({
      ...f,
      name: f.name.trim() || nameNoExt, // mavjud nom bo'lsa o'zgartirma
      format: ext,
      size: (file.size / 1048576).toFixed(1) + " MB"
    }));
  };

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // FIX: faqat rasm fayllarini qabul qilish
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllari qabul qilinadi!");
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => set("thumbnail", ev.target.result);
    reader.onerror = () => setError("Rasmni o'qishda xato!");
    reader.readAsDataURL(file);
  };

  const handleCatChange = (val) => {
    const firstSub = CATEGORIES[val]?.sub?.[0] || "";
    setForm(f => ({ ...f, mainCategory: val, subCategory: firstSub }));
  };

  const submit = async () => {
    if (!form.name.trim()) { setError("Asset nomini kiriting!"); return; }
    if (!form.cloudUrl.trim()) { setError("Cloud URL majburiy!"); return; }
    // FIX: URL formatini tekshirish
    try { new URL(form.cloudUrl.trim()); } catch {
      setError("Noto'g'ri URL format! https:// bilan boshlaning.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        cloudUrl: form.cloudUrl.trim(),
        format: form.format.trim().toLowerCase().replace(/^\./, ""), // nuqtani olib tashla
        // FIX: teglar — bo'sh teglarni filtrla, duplicatlarni olib tashlash
        tags: [...new Set(
          form.tags.split(",")
            .map(t => t.trim())
            .filter(Boolean)
        )]
      });
    } finally {
      setSaving(false);
    }
  };

  const cats = CATEGORIES[form.mainCategory];

  const inputStyle = {
    width: "100%", background: "#0f0f23", border: "1px solid #2d2d4e",
    borderRadius: 7, padding: "8px 10px", color: "#e0e0ff", fontSize: 13,
    boxSizing: "border-box", outline: "none", fontFamily: "inherit"
  };
  // FIX: select uchun alohida style (boxSizing keraksiz, appearance qo'shildi)
  const selectStyle = {
    ...inputStyle,
    appearance: "none", cursor: "pointer"
  };
  const labelStyle = { fontSize: 11, color: "#888", display: "block", marginBottom: 4, fontWeight: 500 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>

      {/* Fayl zone */}
      <div
        style={{
          border: "2px dashed #3d3d6b", borderRadius: 10,
          padding: "16px", textAlign: "center", cursor: "pointer",
          color: "#888", transition: "border-color 0.2s"
        }}
        onClick={() => fileRef.current?.click()}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#6C63FF"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#3d3d6b"}
      >
        <i className="ti ti-upload" style={{ fontSize: 24, display: "block", marginBottom: 5, color: "#6C63FF" }} />
        <div style={{ fontSize: 12 }}>3D faylni tanlang — nom va format avtomatik to'ldiriladi</div>
        <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>.max .fbx .obj .glb .3ds .c4d .blend .abc</div>
        <input ref={fileRef} type="file" style={{ display: "none" }}
          accept=".max,.fbx,.obj,.glb,.3ds,.c4d,.blend,.abc"
          onChange={handleFile} />
      </div>

      {/* Nom + Format */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 10 }}>
        <div>
          <label style={labelStyle}>Asset nomi *</label>
          <input value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="Leather Sofa 001" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Format</label>
          <input value={form.format} onChange={e => set("format", e.target.value)}
            placeholder="max" style={inputStyle} />
        </div>
      </div>

      {/* Kategoriya */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Kategoriya</label>
          <select value={form.mainCategory} onChange={e => handleCatChange(e.target.value)} style={selectStyle}>
            {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Sub-kategoriya</label>
          <select value={form.subCategory} onChange={e => set("subCategory", e.target.value)} style={selectStyle}>
            {cats?.sub?.length > 0
              ? cats.sub.map(s => <option key={s} value={s}>{s}</option>)
              : <option value="General">General</option>}
          </select>
        </div>
      </div>

      {/* Cloud URL */}
      <div>
        <label style={labelStyle}>Cloud URL * (Google Drive, S3, Dropbox...)</label>
        <input value={form.cloudUrl} onChange={e => set("cloudUrl", e.target.value)}
          placeholder="https://drive.google.com/uc?id=FILE_ID&export=download"
          style={inputStyle} />
      </div>

      {/* Teglar */}
      <div>
        <label style={labelStyle}>Teglar (vergul bilan)</label>
        <input value={form.tags} onChange={e => set("tags", e.target.value)}
          placeholder="leather, modern, sofa, brown" style={inputStyle} />
      </div>

      {/* Hajm + Tavsif */}
      <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Hajm</label>
          <input value={form.size} onChange={e => set("size", e.target.value)}
            placeholder="12.5 MB" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Tavsif</label>
          <input value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="Qisqacha tavsif..." style={inputStyle} />
        </div>
      </div>

      {/* Thumbnail */}
      <div>
        <label style={labelStyle}>Thumbnail rasm</label>
        <input type="file" accept="image/*" onChange={handleThumb}
          style={{ color: "#888", fontSize: 11, cursor: "pointer" }} />
        {form.thumbnail && (
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <img src={form.thumbnail} alt="preview"
              style={{ width: 70, height: 52, objectFit: "cover", borderRadius: 5, border: "1px solid #2d2d4e" }} />
            <button
              onClick={() => { set("thumbnail", ""); }}
              style={{
                background: "transparent", border: "1px solid #3d2d2e",
                borderRadius: 5, padding: "4px 10px", color: "#c0606a", cursor: "pointer", fontSize: 11
              }}>
              O'chirish
            </button>
          </div>
        )}
      </div>

      {/* Xato xabari */}
      {error && (
        <div style={{
          background: "#2d1a1e", border: "1px solid #5d2a2e",
          borderRadius: 7, padding: "8px 12px", color: "#e06070", fontSize: 12
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Tugmalar */}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button onClick={onClose} disabled={saving} style={{
          flex: 1, background: "transparent", border: "1px solid #2d2d4e",
          borderRadius: 8, padding: "10px 0", color: "#888", cursor: "pointer", fontSize: 13
        }}>Bekor qilish</button>
        <button onClick={submit} disabled={saving} style={{
          flex: 2, background: saving ? "#4a4a8a" : "#6C63FF", border: "none",
          borderRadius: 8, padding: "10px 0", color: "#fff",
          cursor: saving ? "wait" : "pointer",
          fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
        }}>
          <i className={`ti ${saving ? "ti-loader-2" : (initial ? "ti-check" : "ti-plus")}`} />
          {saving ? "Saqlanmoqda..." : (initial ? "Saqlash" : "Qo'shish")}
        </button>
      </div>
    </div>
  );
}

// ─── ASSET KARTA ──────────────────────────────────────────────
function AssetCard({ asset, onEdit, onDelete }) {
  const catInfo = CATEGORIES[asset.mainCategory] || { icon: "ti-box", color: "#6C63FF" };
  const [hovered, setHovered] = useState(false);

  // FIX: format null/undefined bo'lsa crash bermaydi
  const formatStr = asset.format ? asset.format.toLowerCase().replace(/^\./, "") : "";

  return (
    <div
      style={{
        background: "#16213e",
        border: `1px solid ${hovered ? catInfo.color : "#2d2d4e"}`,
        borderRadius: 12, overflow: "hidden",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.15s, border-color 0.15s",
        userSelect: "none"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail zona */}
      <div style={{
        height: 128, background: "#0d0d1e",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden"
      }}>
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail} alt={asset.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            // FIX: rasm yuklanmasa icon ko'rsatish
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        {/* Fallback icon — har doim DOM da bo'ladi, display boshqariladi */}
        <div style={{
          display: asset.thumbnail ? "none" : "flex",
          flexDirection: "column", alignItems: "center", gap: 5
        }}>
          <i className={`ti ${catInfo.icon}`}
            style={{ fontSize: 32, color: catInfo.color, opacity: 0.6 }} />
          {formatStr && (
            <span style={{ fontSize: 9, color: "#444", fontFamily: "monospace" }}>.{formatStr}</span>
          )}
        </div>

        {/* Badge */}
        {(asset.subCategory || asset.mainCategory) && (
          <div style={{
            position: "absolute", top: 6, right: 6,
            background: "rgba(0,0,0,0.7)", borderRadius: 4,
            padding: "2px 6px", fontSize: 9, color: catInfo.color,
            fontWeight: 600, maxWidth: 90,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {asset.subCategory || asset.mainCategory}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "9px 10px" }}>
        <div title={asset.name} style={{
          fontWeight: 600, fontSize: 12, color: "#e0e0ff", marginBottom: 3,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
        }}>
          {asset.name || "Nomsiz"}
        </div>

        <div style={{ fontSize: 10, color: "#666", marginBottom: 6, display: "flex", gap: 8 }}>
          {formatStr && <span style={{ color: "#777" }}>.{formatStr}</span>}
          {asset.size && <span style={{ color: "#555" }}>{asset.size}</span>}
        </div>

        {/* Teglar — FIX: duplicate key muammosi hal qilindi (index qo'shildi) */}
        {Array.isArray(asset.tags) && asset.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 7 }}>
            {asset.tags.slice(0, 3).map((tag, i) => (
              <span key={`${tag}-${i}`} style={{
                background: "#1e1e3a", border: "1px solid #3d3d6b",
                borderRadius: 3, padding: "1px 5px", fontSize: 9, color: "#8080b0"
              }}>{tag}</span>
            ))}
            {asset.tags.length > 3 && (
              <span title={asset.tags.slice(3).join(", ")}
                style={{ fontSize: 9, color: "#555", cursor: "default" }}>
                +{asset.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Tugmalar */}
        <div style={{ display: "flex", gap: 5 }}>
          <button
            onClick={() => onEdit(asset)}
            style={{
              flex: 1, background: "transparent", border: "1px solid #2d2d4e",
              borderRadius: 5, padding: "5px 0", color: "#888", cursor: "pointer",
              fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 3
            }}
          >
            <i className="ti ti-edit" style={{ fontSize: 11 }} />Tahrir
          </button>
          <button
            onClick={() => onDelete(asset.id)}
            style={{
              background: "transparent", border: "1px solid #3d2d2e",
              borderRadius: 5, padding: "5px 9px", color: "#c0606a", cursor: "pointer"
            }}
          >
            <i className="ti ti-trash" style={{ fontSize: 11 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAXSCRIPT MODAL ─────────────────────────────────────────
// FIX: MAXScript kontenti — to'g'ri Windows path escape
// Template literal ichida: \\ => bitta \ bo'ladi
// MAXScript da Windows path uchun \\ kerak => template da \\\\ yoziladi
const MAXSCRIPT_CONTENT = `-- =====================================================
-- MyAssetLibrary.ms  —  3ds Max MAXScript v2
-- Shaxsiy Asset Library Browser
-- =====================================================
-- BU QATORNI O'ZGARTIRING:
global MAL_serverUrl  = "https://YOUR-APP.vercel.app/api/assets"
global MAL_tempFolder = (getDir #temp) + "\\\\MyAssetLib\\\\"
-- =====================================================

fn MAL_fetchURL url = (
    local result = ""
    try (
        local wc = dotNetObject "System.Net.WebClient"
        wc.Headers.Add "User-Agent" "3dsMax-AssetLib/2.0"
        result = wc.DownloadString url
    ) catch (
        local err = ""
        try ( err = getCurrentException ) catch ( err = "noma'lum" )
        messageBox ("Ulanib bo'lmadi:\\n" + url + "\\n\\nXato: " + err) title:"Asset Library"
    )
    result
)

fn MAL_downloadFile url dest = (
    local ok = false
    try (
        local wc = dotNetObject "System.Net.WebClient"
        wc.DownloadFile url dest
        ok = true
    ) catch (
        local err = ""
        try ( err = getCurrentException ) catch ( err = "noma'lum" )
        messageBox ("Yuklashda xato:\\n" + err) title:"Asset Library"
    )
    ok
)

fn MAL_getVal json key = (
    local pat = "\\"" + key + "\\"\\\\s*:\\\\s*\\"([^\\"]*)\\"" 
    local rx = dotNetObject "System.Text.RegularExpressions.Regex" pat
    local m = rx.Match json
    if m.Success then m.Groups.Item[1].Value else ""
)

fn MAL_parseAssets json = (
    local arr = #()
    if json == "" do return arr
    local rx = dotNetObject "System.Text.RegularExpressions.Regex" "\\\\{[^\\\\{\\\\}]+\\\\}"
    local ms = rx.Matches json
    for i = 0 to (ms.Count - 1) do (
        local o  = ms.Item[i].Value
        local nm = MAL_getVal o "name"
        local mc = MAL_getVal o "mainCategory"
        local sc = MAL_getVal o "subCategory"
        local ft = MAL_getVal o "format"
        local sz = MAL_getVal o "size"
        local ur = MAL_getVal o "cloudUrl"
        if nm != "" and ur != "" do
            append arr #(nm, mc, sc, ft, sz, ur)
    )
    arr
)

rollout MAL_main "My Asset Library" width:340 (
    group "Filter" (
        dropdownList ddl_cat "Kategoriya:" width:300 align:#center \\
            items:#("Hammasi","3D Models","Materials","HDRIs","Collections")
        dropdownList ddl_sub "Sub:" width:300 align:#center \\
            items:#("Hammasi","Furniture","Accessories","Lighting","Vegetation",\\
                    "Vehicles","People","Animals","Architecture","Presets",\\
                    "Enmesh - Pattern","Wood","Metal","Fabric","Stone","Glass",\\
                    "Concrete","Plastic","Other","Interior","Exterior","Studio","Nature","Urban")
        edittext  txt_q   "Qidirish:" width:300 align:#center
        button btn_load   "Yuklash"   width:145 align:#left
        button btn_reset  "Tozalash"  width:145 align:#right
    )
    group "Assetlar" (
        listbox lbx height:10 width:300 align:#center
    )
    group "Tanlangan" (
        label lbl_n "Nom: —"    align:#left
        label lbl_c "Kat: —"    align:#left
        label lbl_f "Format: —" align:#left
        label lbl_s "Hajm: —"   align:#left
    )
    button btn_imp "SAHNAGA IMPORT QILISH" width:300 height:30 align:#center
    button btn_nfo "Ma'lumot" width:145 align:#left
    button btn_url "URL Nusxa" width:145 align:#right
    label  lbl_st  "Serverdan assetlarni yuklang" align:#center

    local aData = #()

    fn updateInfo idx = (
        if idx >= 1 and idx <= aData.count then (
            local a = aData[idx]
            lbl_n.text = "Nom: "    + a[1]
            lbl_c.text = "Kat: "    + a[2] + " / " + a[3]
            lbl_f.text = "Format: ." + (toLower a[4])
            lbl_s.text = "Hajm: "   + (if a[5] != "" then a[5] else "—")
        ) else (
            lbl_n.text = "Nom: —"; lbl_c.text = "Kat: —"
            lbl_f.text = "Format: —"; lbl_s.text = "Hajm: —"
        )
    )

    fn buildUrl = (
        local url = MAL_serverUrl; local sep = "?"
        local cat = ddl_cat.selected; local sub = ddl_sub.selected; local q = txt_q.text
        if cat != "Hammasi" do ( url = url + sep + "cat=" + cat; sep = "&" )
        if sub != "Hammasi" do ( url = url + sep + "sub=" + sub; sep = "&" )
        if q   != ""        do ( url = url + sep + "q="   + q )
        url
    )

    fn doLoad = (
        lbl_st.text = "Yuklanmoqda..."
        local json = MAL_fetchURL (buildUrl())
        if json == "" do ( lbl_st.text = "Server xatosi!"; return false )
        aData = MAL_parseAssets json
        local names = for a in aData collect (a[1] + "  [." + (toLower a[4]) + "]")
        lbx.items = names
        updateInfo 0
        lbl_st.text = (aData.count as string) + " asset topildi"
    )

    fn doImport = (
        local idx = lbx.selection
        if idx < 1 or idx > aData.count do (
            messageBox "Avval asset tanlang!" title:"Asset Library"
            return false
        )
        local a    = aData[idx]
        local nm   = a[1]; local fmt = toLower a[4]; local url = a[6]
        local rxS  = dotNetObject "System.Text.RegularExpressions.Regex" "[\\\\\\\\/:*?\\"<>|]"
        local safe = rxS.Replace nm "_"
        local dest = MAL_tempFolder + safe + "." + fmt
        makeDir MAL_tempFolder all:true
        if doesFileExist dest then (
            if not (queryBox ("Cache dan foydalanilsinmi?\\n" + dest) title:"Cache") do
                deleteFile dest
        )
        if not (doesFileExist dest) then (
            lbl_st.text = "Yuklanmoqda: " + nm + "..."
            if not (MAL_downloadFile url dest) do return false
        )
        lbl_st.text = "Import..."
        local msg = case fmt of (
            "max": ( local r = mergeMaxFile dest #noPrompt #renameMergedMaterial; if r then "OK!" else "Xato!" )
            "fbx": ( importFile dest #noPrompt; "FBX OK!" )
            "obj": ( importFile dest #noPrompt; "OBJ OK!" )
            "glb": ( importFile dest #noPrompt; "GLB OK!" )
            "3ds": ( importFile dest #noPrompt; "3DS OK!" )
            default: ( importFile dest #noPrompt; (toUpper fmt) + " OK!" )
        )
        lbl_st.text = "Import: " + msg
        messageBox msg title:"Asset Library"
    )

    on MAL_main    open     do doLoad()
    on btn_load    pressed  do doLoad()
    on btn_reset   pressed  do ( txt_q.text = ""; doLoad() )
    on ddl_cat     selected i do doLoad()
    on ddl_sub     selected i do doLoad()
    on txt_q       entered  s do doLoad()
    on lbx         selected i do updateInfo i
    on btn_imp     pressed  do doImport()
    on btn_nfo     pressed  do (
        local idx = lbx.selection
        if idx < 1 or idx > aData.count then ( messageBox "Asset tanlang!" title:"MAL" )
        else (
            local a = aData[idx]
            messageBox ("Nom: " + a[1] + "\\nKat: " + a[2] + "/" + a[3] +
                "\\nFormat: ." + (toLower a[4]) + "\\nHajm: " + a[5] +
                "\\nURL: " + a[6]) title:a[1]
        )
    )
    on btn_url pressed do (
        local idx = lbx.selection
        if idx >= 1 and idx <= aData.count then (
            setClipboardText aData[idx][6]; lbl_st.text = "URL nusxalandi!"
        )
    )
)

rollout MAL_cfg "Sozlamalar" width:340 (
    group "API URL" (
        edittext txt_url "" width:300 align:#center
        button btn_sv "Saqlash" width:145 align:#left
        button btn_ts "Test"    width:145 align:#right
        label  lbl_r  ""        align:#center
    )
    group "Cache" (
        label  lbl_p "" align:#left
        button btn_cl "Tozalash" width:300 align:#center
    )
    on MAL_cfg  open    do ( txt_url.text = MAL_serverUrl; lbl_p.text = MAL_tempFolder )
    on btn_sv   pressed do ( MAL_serverUrl = txt_url.text; lbl_r.text = "Saqlandi!" )
    on btn_ts   pressed do (
        lbl_r.text = "Tekshirilmoqda..."
        local j = MAL_fetchURL txt_url.text
        lbl_r.text = if j != "" then ("OK! " + j.count as string + " belgi") else "Ulanib bo'lmadi!"
    )
    on btn_cl pressed do (
        local fl = getFiles (MAL_tempFolder + "*.*")
        for f in fl do deleteFile f
        lbl_r.text = (fl.count as string) + " fayl o'chirildi"
    )
)

if MAL_floater != undefined do try ( closeRolloutFloater MAL_floater ) catch ()
MAL_floater = newRolloutFloater "My Asset Library" 360 680 80 80
addRollout MAL_main MAL_floater
addRollout MAL_cfg  MAL_floater rolledUp:true
print "My Asset Library yuklandi!"`;

function ScriptModal() {
  const [copied, setCopied] = useState(false);

  // FIX: document.execCommand deprecated — to'g'ri fallback
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(MAXSCRIPT_CONTENT);
      setCopied(true);
    } catch {
      // Fallback: textarea trick
      try {
        const ta = document.createElement("textarea");
        ta.value = MAXSCRIPT_CONTENT;
        ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) setCopied(true);
      } catch {
        setCopied(false);
      }
    }
    if (setCopied) setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div>
      <div style={{
        background: "#07071a", border: "1px solid #2d2d4e",
        borderRadius: 8, padding: 12, marginBottom: 12
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ color: "#6C63FF", fontSize: 11, fontFamily: "monospace", fontWeight: 600 }}>
            MyAssetLibrary.ms
          </span>
          <button onClick={copy} style={{
            background: copied ? "#1e3d2a" : "#2d2d4e", border: "none",
            borderRadius: 5, padding: "4px 12px",
            color: copied ? "#5ecb7e" : "#bbb",
            cursor: "pointer", fontSize: 11, transition: "all 0.2s"
          }}>
            {copied ? "✓ Nusxalandi" : "Nusxalash"}
          </button>
        </div>
        <pre style={{
          color: "#7a7aa8", fontSize: 10, fontFamily: "monospace",
          margin: 0, maxHeight: 200, overflowY: "auto",
          whiteSpace: "pre", lineHeight: 1.5, wordBreak: "break-all"
        }}>
          {MAXSCRIPT_CONTENT.slice(0, 500)}
          {"\n"}<span style={{ color: "#444" }}>... (to'liq kod nusxalanganda olinadi)</span>
        </pre>
      </div>

      <div style={{
        background: "#0d1a0f", border: "1px solid #253d25",
        borderRadius: 8, padding: "12px 14px", fontSize: 12,
        color: "#70a870", lineHeight: 1.9, marginBottom: 10
      }}>
        <div style={{ fontWeight: 600, color: "#90c890", marginBottom: 4 }}>3ds Max da ishlatish:</div>
        <div>1. Kodni <b style={{ color: "#e0e0ff" }}>MyAssetLibrary.ms</b> nomi bilan saqlang</div>
        <div>2. <b style={{ color: "#e0e0ff" }}>MAL_serverUrl</b> ni o'z serveringizga o'zgartiring</div>
        <div>3. 3ds Max: <b style={{ color: "#e0e0ff" }}>Scripting → Run Script</b></div>
        <div>4. Floater oynasi avtomatik ochiladi</div>
        <div>5. Sozlamalar tabida URL saqlang va "Test" bosing</div>
      </div>

      <button onClick={copy} style={{
        width: "100%", background: "#6C63FF", border: "none",
        borderRadius: 8, padding: "11px 0", color: "#fff",
        cursor: "pointer", fontWeight: 600, fontSize: 13,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8
      }}>
        <i className="ti ti-copy" />
        {copied ? "✓ Nusxalandi!" : "To'liq MAXScript nusxalash"}
      </button>
    </div>
  );
}

// ─── ASOSIY APP ───────────────────────────────────────────────
export default function App() {
  const { load, save } = useStorage();
  const [db, setDb] = useState({ assets: [], nextId: 1 });
  const [loading, setLoading] = useState(true);

  const [selectedCat, setSelectedCat] = useState("Hammasi");
  const [selectedSub, setSelectedSub] = useState(null);
  const [search, setSearch] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [editAsset,  setEditAsset]  = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dastlabki yuklanish
  // FIX: dependency array da load qo'shildi
  useEffect(() => {
    load().then(data => {
      setDb(data);
      setLoading(false);
    });
  }, [load]);

  // FIX: updateDb — save memoized bo'lgani uchun xavfsiz
  const updateDb = useCallback(async (newDb) => {
    setDb(newDb);
    await save(newDb);
  }, [save]);

  // FIX: stale closure — db.nextId o'rniga functional update
  const addAsset = useCallback(async (form) => {
    setDb(prev => {
      const newAsset = { ...form, id: prev.nextId, createdAt: Date.now() };
      const next = { assets: [...prev.assets, newAsset], nextId: prev.nextId + 1 };
      save(next); // async, lekin state bilan sinxron
      return next;
    });
    setShowUpload(false);
  }, [save]);

  // FIX: stale closure — editAsset.id ni closure ichida ishlatish xavfsiz
  const saveEdit = useCallback(async (form) => {
    setDb(prev => {
      const updated = prev.assets.map(a =>
        a.id === editAsset?.id ? { ...a, ...form, id: a.id, createdAt: a.createdAt } : a
      );
      const next = { ...prev, assets: updated };
      save(next);
      return next;
    });
    setEditAsset(null);
  }, [save, editAsset]);

  const requestDelete = useCallback((id) => setConfirmDel(id), []);

  // FIX: stale closure — confirmDel ni functional update ichida ishlatish
  const confirmDelete = useCallback(async () => {
    setDb(prev => {
      const next = { ...prev, assets: prev.assets.filter(a => a.id !== confirmDel) };
      save(next);
      return next;
    });
    setConfirmDel(null);
  }, [save, confirmDel]);

  // FIX: useMemo bilan filterlash — har render da qayta hisoblanmaydi
  const filtered = useMemo(() => db.assets.filter(a => {
    if (selectedCat !== "Hammasi" && a.mainCategory !== selectedCat) return false;
    if (selectedSub && a.subCategory !== selectedSub) return false;
    if (search) {
      const q = search.toLowerCase();
      const inName = (a.name || "").toLowerCase().includes(q);
      const inTags = Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q));
      const inDesc = (a.description || "").toLowerCase().includes(q);
      if (!inName && !inTags && !inDesc) return false;
    }
    return true;
  }), [db.assets, selectedCat, selectedSub, search]);

  // FIX: useMemo bilan kategoriya hisoblash
  const catCounts = useMemo(() => {
    const counts = {};
    Object.keys(CATEGORIES).forEach(c => {
      counts[c] = db.assets.filter(a => a.mainCategory === c).length;
    });
    return counts;
  }, [db.assets]);

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", minHeight: "100vh", background: "#0d0d1f",
        color: "#555", flexDirection: "column", gap: 12
      }}>
        <i className="ti ti-loader-2" style={{ fontSize: 32, color: "#6C63FF" }} />
        <span style={{ fontSize: 13 }}>Yuklanmoqda...</span>
      </div>
    );
  }

  return (
    // FIX: height 100vh + overflow hidden — artifact da scroll muammosi yo'qoladi
    <div style={{
      display: "flex",
      height: "100vh",
      maxHeight: "100vh",
      background: "#0d0d1f",
      color: "#e0e0ff",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: "hidden",
      fontSize: 13,
      position: "relative"
    }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: sidebarOpen ? 228 : 0,
        minWidth: sidebarOpen ? 228 : 0,
        transition: "width 0.22s ease, min-width 0.22s ease",
        overflow: "hidden", flexShrink: 0,
        borderRight: "1px solid #1e1e3a",
        background: "#111128",
        display: "flex", flexDirection: "column"
      }}>
        {/* Logo */}
        <div style={{ padding: "16px 13px 10px", borderBottom: "1px solid #1e1e3a", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, background: "#6C63FF", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <i className="ti ti-database" style={{ color: "#fff", fontSize: 14 }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#e0e0ff", whiteSpace: "nowrap" }}>My Asset Library</div>
              <div style={{ fontSize: 10, color: "#555" }}>{db.assets.length} ta asset</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 5px" }}>
          {/* Hammasi */}
          <div
            onClick={() => { setSelectedCat("Hammasi"); setSelectedSub(null); }}
            style={{
              padding: "7px 9px", borderRadius: 6, cursor: "pointer", marginBottom: 1,
              background: selectedCat === "Hammasi" ? "#1e1e3a" : "transparent",
              color: selectedCat === "Hammasi" ? "#6C63FF" : "#888",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              <i className="ti ti-layout-grid" style={{ fontSize: 13 }} />Hammasi
            </span>
            <span style={{ fontSize: 10, color: "#555" }}>{db.assets.length}</span>
          </div>

          {/* Kategoriyalar */}
          {Object.entries(CATEGORIES).map(([cat, info]) => (
            <div key={cat}>
              <div
                onClick={() => { setSelectedCat(cat); setSelectedSub(null); }}
                style={{
                  padding: "7px 9px", borderRadius: 6, cursor: "pointer", marginBottom: 1,
                  background: selectedCat === cat && !selectedSub ? "#1e1e3a" : "transparent",
                  color: selectedCat === cat ? info.color : "#888",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                  <i className={`ti ${info.icon}`} style={{ fontSize: 13 }} />{cat}
                </span>
                <span style={{ fontSize: 10, color: "#555" }}>{catCounts[cat] || 0}</span>
              </div>

              {selectedCat === cat && info.sub?.length > 0 && (
                <div style={{ paddingLeft: 16 }}>
                  {info.sub.map(sub => (
                    <div
                      key={sub}
                      onClick={() => setSelectedSub(selectedSub === sub ? null : sub)}
                      style={{
                        padding: "5px 9px", borderRadius: 5, cursor: "pointer",
                        fontSize: 11, marginBottom: 1, whiteSpace: "nowrap",
                        color: selectedSub === sub ? info.color : "#666",
                        background: selectedSub === sub ? "#1a1a30" : "transparent"
                      }}
                    >{sub}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MAXScript tugma */}
        <div style={{ padding: "8px 5px", borderTop: "1px solid #1e1e3a", flexShrink: 0 }}>
          <button
            onClick={() => setShowScript(true)}
            style={{
              width: "100%", background: "#1a1a2e", border: "1px solid #2d2d4e",
              borderRadius: 6, padding: "8px 0", color: "#888", cursor: "pointer",
              fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 5
            }}
          >
            <i className="ti ti-code" style={{ fontSize: 12 }} />MAXScript
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Header */}
        <div style={{
          padding: "10px 16px", borderBottom: "1px solid #1e1e3a",
          display: "flex", alignItems: "center", gap: 9, flexShrink: 0
        }}>
          <button
            onClick={() => setSidebarOpen(s => !s)}
            style={{
              background: "transparent", border: "1px solid #2d2d4e",
              borderRadius: 6, padding: "6px 8px", color: "#888",
              cursor: "pointer", flexShrink: 0
            }}
          >
            <i className="ti ti-menu-2" style={{ fontSize: 14 }} />
          </button>

          <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
            <i className="ti ti-search" style={{
              position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
              color: "#555", fontSize: 13, pointerEvents: "none"
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nom, teg yoki tavsif bo'yicha qidirish..."
              style={{
                width: "100%", background: "#111128", border: "1px solid #2d2d4e",
                borderRadius: 6, padding: "7px 10px 7px 30px", color: "#e0e0ff",
                fontSize: 12, outline: "none", boxSizing: "border-box"
              }}
            />
          </div>

          <span style={{ color: "#444", fontSize: 11, flexShrink: 0, whiteSpace: "nowrap" }}>
            {filtered.length}/{db.assets.length}
          </span>

          <button
            onClick={() => setShowUpload(true)}
            style={{
              background: "#6C63FF", border: "none", borderRadius: 6,
              padding: "7px 14px", color: "#fff", cursor: "pointer",
              fontWeight: 600, fontSize: 12, flexShrink: 0,
              display: "flex", alignItems: "center", gap: 5
            }}
          >
            <i className="ti ti-plus" style={{ fontSize: 13 }} />Qo'shish
          </button>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          {filtered.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: 260, color: "#444", gap: 10
            }}>
              <i className="ti ti-database-off" style={{ fontSize: 42 }} />
              <div style={{ fontSize: 14 }}>
                {db.assets.length === 0 ? "Hali asset qo'shilmagan" : "Topilmadi"}
              </div>
              <div style={{ fontSize: 11, color: "#333" }}>
                {db.assets.length === 0
                  ? "\"Qo'shish\" tugmasini bosib birinchi assetni kiriting"
                  : "Boshqa kategoriya yoki kalit so'z sinab ko'ring"}
              </div>
              {db.assets.length === 0 && (
                <button onClick={() => setShowUpload(true)} style={{
                  marginTop: 6, background: "#6C63FF", border: "none",
                  borderRadius: 7, padding: "8px 20px", color: "#fff",
                  cursor: "pointer", fontWeight: 600, fontSize: 12
                }}>
                  <i className="ti ti-plus" style={{ marginRight: 4 }} />Asset qo'shish
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: 11
            }}>
              {filtered.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onEdit={setEditAsset}
                  onDelete={requestDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div style={{
          padding: "5px 16px", borderTop: "1px solid #1e1e3a",
          display: "flex", gap: 14, fontSize: 10, color: "#444",
          flexWrap: "wrap", flexShrink: 0, alignItems: "center"
        }}>
          {Object.entries(catCounts).map(([cat, count]) => (
            <span key={cat} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <i className={`ti ${CATEGORIES[cat].icon}`}
                style={{ color: CATEGORIES[cat].color, fontSize: 11 }} />
              {cat}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* ── MODALLAR ── */}

      {showUpload && (
        <Modal title="Yangi Asset Qo'shish" onClose={() => setShowUpload(false)}>
          <AssetForm onClose={() => setShowUpload(false)} onSave={addAsset} />
        </Modal>
      )}

      {/* FIX: key={editAsset.id} — har yangi asset tahririda form reset bo'ladi */}
      {editAsset && (
        <Modal title={`Tahrirlash: ${editAsset.name}`} onClose={() => setEditAsset(null)}>
          <AssetForm
            key={editAsset.id}
            initial={editAsset}
            onClose={() => setEditAsset(null)}
            onSave={saveEdit}
          />
        </Modal>
      )}

      {showScript && (
        <Modal title="3ds Max MAXScript" onClose={() => setShowScript(false)}>
          <ScriptModal />
        </Modal>
      )}

      {confirmDel !== null && (
        <ConfirmDialog
          message={`"${db.assets.find(a => a.id === confirmDel)?.name || "Asset"}" o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.`}
          onYes={confirmDelete}
          onNo={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}
