import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// MY ASSET LIBRARY - Chaos Cosmos Style Interface
// Shaxsiy 3D Asset kutubxonangiz
// ═══════════════════════════════════════════════════════════════
// Required Icons: 
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">

// ─── KATEGORIYALAR ───────────────────────────────────────────
const CATEGORIES = {
  "3D Models": {
    icon: "ti-box",
    color: "#6C63FF",
    sub: ["All", "Furniture","Accessories","Lighting","Vegetation","Vehicles","People","Animals","Architecture","Presets","Enmesh - Pattern"]
  },
  "Materials": {
    icon: "ti-palette",
    color: "#FF6584",
    sub: ["All", "Wood","Metal","Fabric","Stone","Glass","Concrete","Plastic","Other"]
  },
  "HDRIs": {
    icon: "ti-sun",
    color: "#F5A623",
    sub: ["All", "Interior","Exterior","Studio","Nature","Urban"]
  },
  "Collections": { icon: "ti-folders", color: "#43C59E", sub: ["All"] },
  "Creators":    { icon: "ti-user",    color: "#A0AEC0", sub: ["All"] }
};

const STORAGE_KEY = "mal_cosmos_v1";
const DEFAULT_FORM = {
  name: "", mainCategory: "3D Models", subCategory: "Furniture",
  format: "max", size: "", tags: "", description: "", cloudUrl: "", thumbnail: ""
};

// ─── STORAGE HOOK ────────────────────────────────────────────
function useStorage() {
  const load = useCallback(async () => {
    try {
      if (typeof window.storage !== "undefined") {
        const res = await window.storage.get(STORAGE_KEY);
        if (res?.value) return JSON.parse(res.value);
      } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.error("Storage load error:", e);
    }
    return { assets: [], nextId: 1 };
  }, []);

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
  }, []);

  return { load, save };
}

// ─── COSMOS STYLE: SIDEBAR CATEGORY ITEM ─────────────────────
function CategoryItem({ name, icon, color, isActive, count, onClick, level = 0 }) {
  const [hovered, setHovered] = useState(false);
  const indent = level * 16;
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: `8px 12px 8px ${12 + indent}px`,
        cursor: "pointer",
        background: isActive ? "rgba(108, 99, 255, 0.12)" : (hovered ? "rgba(255,255,255,0.03)" : "transparent"),
        borderLeft: isActive ? `3px solid ${color}` : "3px solid transparent",
        transition: "all 0.2s ease",
        userSelect: "none"
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 16, color: isActive ? color : "#888" }} />
      <span style={{ 
        flex: 1, 
        fontSize: 13, 
        color: isActive ? "#fff" : "#aaa",
        fontWeight: isActive ? 600 : 400
      }}>
        {name}
      </span>
      {count !== undefined && (
        <span style={{ 
          fontSize: 11, 
          color: "#666", 
          background: "rgba(255,255,255,0.05)", 
          padding: "2px 6px", 
          borderRadius: 10 
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ─── COSMOS STYLE: ASSET CARD ────────────────────────────────

function CosmosAssetCard({ asset, onEdit, onDelete, onDownload }) {
  const catInfo = CATEGORIES[asset.mainCategory] || { icon: "ti-box", color: "#6C63FF" };
  const [hovered, setHovered] = useState(false);
  const [downloaded, setDownloaded] = useState(false); // Simulated download state
  
  const formatStr = asset.format ? asset.format.toLowerCase().replace(/^\./, "") : "file";

  return (
    <div
      style={{
        background: "#0d0d1f",
        border: `1px solid ${hovered ? catInfo.color + "44" : "#1a1a2e"}`,
        borderRadius: 10,
        overflow: "hidden",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.2)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        position: "relative"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail Zone */}
      <div style={{
        height: 180,
        background: "linear-gradient(135deg, #0a0a15 0%, #15152a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {asset.thumbnail ? (
          <>
            <img
              src={asset.thumbnail}
              alt={asset.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease"
              }}
              onError={e => { e.target.style.display = "none"; }}
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)"
            }} />
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <i className={`ti ${catInfo.icon}`} style={{ fontSize: 48, color: catInfo.color + "44", opacity: 0.5 }} />
          </div>
        )}
        
        {/* Hover Actions Overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s ease"
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDownload && onDownload(asset); }}

            style={{
              background: catInfo.color,
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <i className="ti ti-download" style={{ fontSize: 16 }} />
            Use in Scene
          </button>
        </div>

        {/* Status Badge */}
        {downloaded && (
          <div style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: "#43C59E",
            borderRadius: 5,
            padding: "4px 8px",
            fontSize: 10,
            fontWeight: 600,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}>
            <i className="ti ti-check" style={{ fontSize: 12 }} />
            Downloaded
          </div>
        )}

        {/* Format Badge */}
        <div style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(0,0,0,0.8)",
          borderRadius: 5,
          padding: "4px 8px",
          fontSize: 10,
          fontWeight: 600,
          color: catInfo.color,
          fontFamily: "monospace"
        }}>
          .{formatStr}
        </div>
      </div>

      {/* Info Section */}
      <div style={{ padding: 12 }}>
        <div style={{
          fontWeight: 600,
          fontSize: 14,
          color: "#e8e8ff",
          marginBottom: 6,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }} title={asset.name}>
          {asset.name || "Unnamed Asset"}
        </div>

        <div style={{
          fontSize: 11,
          color: "#666",
          marginBottom: 8,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }}>

          <span style={{ color: "#888" }}>{asset.subCategory || asset.mainCategory}</span>
          {asset.size && (
            <>
              <span style={{ color: "#333" }}>•</span>
              <span style={{ color: "#666" }}>{asset.size}</span>
            </>
          )}
        </div>

        {/* Tags */}
        {Array.isArray(asset.tags) && asset.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {asset.tags.slice(0, 3).map((tag, i) => (
              <span key={`${tag}-${i}`} style={{
                background: "rgba(108, 99, 255, 0.1)",
                border: "1px solid rgba(108, 99, 255, 0.2)",
                borderRadius: 4,
                padding: "2px 6px",
                fontSize: 10,
                color: "#9090ff"
              }}>
                {tag}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span style={{ fontSize: 10, color: "#555" }}>+{asset.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid #2a2a3e",
              borderRadius: 6,
              padding: "6px 0",
              color: "#aaa",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4
            }}
          >
            <i className="ti ti-edit" style={{ fontSize: 12 }} />
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
            style={{
              background: "transparent",
              border: "1px solid #3a2a2e",
              borderRadius: 6,
              padding: "6px 10px",
              color: "#d0707a",
              cursor: "pointer"
            }}
          >
            <i className="ti ti-trash" style={{ fontSize: 12 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL COMPONENTS ────────────────────────────────────────

function Modal({ title, onClose, children, width = 540 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        border: "1px solid #2a2a4e",
        borderRadius: 16,
        padding: "24px 28px",
        width,
        maxWidth: "95vw",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 24px 48px rgba(0,0,0,0.6)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}>
          <h2 style={{
            margin: 0,
            color: "#e8e8ff",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "-0.02em"
          }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            background: "transparent",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: 24,
            lineHeight: 1,
            padding: "0 6px",
            display: "flex",
            alignItems: "center",
            transition: "color 0.2s"
          }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onYes, onNo }) {
  return (
    <Modal title="Confirm Action" onClose={onNo} width={420}>
      <p style={{ color: "#ccc", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        {message}
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onNo} style={{
          flex: 1,
          background: "transparent",
          border: "1px solid #3a3a5a",
          borderRadius: 8,
          padding: "11px 0",
          color: "#aaa",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500
        }}>
          Cancel
        </button>
        <button onClick={onYes} style={{
          flex: 1,
          background: "#d0505a",
          border: "none",
          borderRadius: 8,
          padding: "11px 0",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 13
        }}>
          Delete
        </button>
      </div>
    </Modal>
  );
}

// ─── ASSET FORM (Add/Edit) ───────────────────────────────────
function AssetForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    if (!initial) return { ...DEFAULT_FORM };
    return {
      ...DEFAULT_FORM,
      ...initial,
      tags: Array.isArray(initial.tags) ? initial.tags.join(", ") : (initial.tags || "")
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
      name: f.name.trim() || nameNoExt,
      format: ext,
      size: (file.size / 1048576).toFixed(1) + " MB"
    }));
  };

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files accepted!");
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => set("thumbnail", ev.target.result);
    reader.onerror = () => setError("Failed to read image!");
    reader.readAsDataURL(file);
  };

  const handleCatChange = (val) => {
    const firstSub = CATEGORIES[val]?.sub?.[0] || "All";
    setForm(f => ({ ...f, mainCategory: val, subCategory: firstSub }));
  };

  const submit = async () => {
    if (!form.name.trim()) { setError("Asset name is required!"); return; }
    if (!form.cloudUrl.trim()) { setError("Cloud URL is required!"); return; }
    try { new URL(form.cloudUrl.trim()); } catch {
      setError("Invalid URL format! Use https://");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        cloudUrl: form.cloudUrl.trim(),
        format: form.format.trim().toLowerCase().replace(/^\./, ""),
        tags: [...new Set(
          form.tags.split(",").map(t => t.trim()).filter(Boolean)
        )]
      });
    } finally {
      setSaving(false);
    }
  };

  const cats = CATEGORIES[form.mainCategory];
  const inputStyle = {
    width: "100%",
    background: "#0d0d1f",
    border: "1px solid #2a2a3e",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#e8e8ff",
    fontSize: 13,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s"
  };
  const labelStyle = {
    fontSize: 12,
    color: "#999",
    display: "block",
    marginBottom: 6,
    fontWeight: 600
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* File Upload Zone */}
      <div
        style={{
          border: "2px dashed #3a3a5a",
          borderRadius: 12,
          padding: 20,
          textAlign: "center",

          cursor: "pointer",
          color: "#888",
          background: "rgba(108, 99, 255, 0.03)",
          transition: "all 0.2s"
        }}
        onClick={() => fileRef.current?.click()}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#6C63FF"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#3a3a5a"}
      >
        <i className="ti ti-upload" style={{ fontSize: 32, display: "block", marginBottom: 8, color: "#6C63FF" }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: "#aaa" }}>Click to select 3D file</div>
        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
          Supported: .max .fbx .obj .glb .3ds .c4d .blend .abc
        </div>
        <input ref={fileRef} type="file" style={{ display: "none" }}
          accept=".max,.fbx,.obj,.glb,.3ds,.c4d,.blend,.abc"
          onChange={handleFile} />
      </div>

      {/* Name + Format */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 12 }}>
        <div>
          <label style={labelStyle}>Asset Name *</label>
          <input value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="Leather Sofa 001" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Format</label>
          <input value={form.format} onChange={e => set("format", e.target.value)}
            placeholder="max" style={inputStyle} />
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Main Category</label>
          <select value={form.mainCategory} onChange={e => handleCatChange(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Sub-Category</label>
          <select value={form.subCategory} onChange={e => set("subCategory", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {cats?.sub?.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Cloud URL */}

      <div>
        <label style={labelStyle}>Cloud URL * (Google Drive, Dropbox, S3...)</label>
        <input value={form.cloudUrl} onChange={e => set("cloudUrl", e.target.value)}
          placeholder="https://drive.google.com/uc?id=FILE_ID&export=download"
          style={inputStyle} />
      </div>

      {/* Tags */}
      <div>
        <label style={labelStyle}>Tags (comma separated)</label>
        <input value={form.tags} onChange={e => set("tags", e.target.value)}
          placeholder="leather, modern, sofa, brown"
          style={inputStyle} />
      </div>

      {/* Size + Description */}
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>File Size</label>
          <input value={form.size} onChange={e => set("size", e.target.value)}
            placeholder="12.5 MB" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <input value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="Brief description..." style={inputStyle} />
        </div>
      </div>

      {/* Thumbnail */}
      <div>
        <label style={labelStyle}>Thumbnail Image</label>
        <input type="file" accept="image/*" onChange={handleThumb}
          style={{ color: "#aaa", fontSize: 12, cursor: "pointer" }} />
        {form.thumbnail && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <img src={form.thumbnail} alt="preview"
              style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #2a2a3e" }} />
            <button onClick={() => set("thumbnail", "")} style={{
              background: "transparent",
              border: "1px solid #3a2a2e",
              borderRadius: 6,
              padding: "5px 12px",
              color: "#d0707a",
              cursor: "pointer",
              fontSize: 11
            }}>
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{

          background: "#2d1a1e",
          border: "1px solid #5a2a2e",
          borderRadius: 8,
          padding: "10px 14px",
          color: "#e87080",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <i className="ti ti-alert-circle" style={{ fontSize: 16 }} />
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={onClose} disabled={saving} style={{
          flex: 1,
          background: "transparent",
          border: "1px solid #2a2a3e",
          borderRadius: 8,
          padding: "12px 0",
          color: "#aaa",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500
        }}>
          Cancel
        </button>
        <button onClick={submit} disabled={saving} style={{
          flex: 2,
          background: saving ? "#4a4a7a" : "#6C63FF",
          border: "none",
          borderRadius: 8,
          padding: "12px 0",
          color: "#fff",
          cursor: saving ? "wait" : "pointer",
          fontWeight: 600,
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8
        }}>
          <i className={`ti ${saving ? "ti-loader-2" : (initial ? "ti-check" : "ti-plus")}`}
            style={{ fontSize: 16 }} />
          {saving ? "Saving..." : (initial ? "Update Asset" : "Add Asset")}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP: COSMOS STYLE LAYOUT ───────────────────────────
export default function MyAssetLibrary() {
  const { load, save } = useStorage();
  const [data, setData] = useState({ assets: [], nextId: 1 });
  const [selectedCategory, setSelectedCategory] = useState("3D Models");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("online"); // "online" or "downloaded"
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { load().then(setData); }, [load]);


  const persist = useCallback((newData) => {
    setData(newData);
    save(newData);
  }, [save]);

  // Filter assets
  const filtered = data.assets.filter(a => {
    if (a.mainCategory !== selectedCategory) return false;
    if (selectedSubCategory !== "All" && a.subCategory !== selectedSubCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(q) ||
             (Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q)));
    }
    return true;
  });

  // Count assets per category
  const categoryCount = (cat, sub = null) => {
    return data.assets.filter(a => {
      if (a.mainCategory !== cat) return false;
      if (sub && sub !== "All" && a.subCategory !== sub) return false;
      return true;
    }).length;
  };

  // Add asset
  const addAsset = async (formData) => {
    const newData = {
      ...data,
      assets: [...data.assets, { ...formData, id: data.nextId, createdAt: Date.now() }],
      nextId: data.nextId + 1
    };
    persist(newData);
    setModal(null);
  };

  // Edit asset
  const editAsset = async (formData) => {
    const newData = {
      ...data,
      assets: data.assets.map(a => a.id === formData.id ? { ...formData, updatedAt: Date.now() } : a)
    };
    persist(newData);
    setModal(null);
  };

  // Delete asset
  const deleteAsset = (id) => {
    const newData = {
      ...data,
      assets: data.assets.filter(a => a.id !== id)
    };
    persist(newData);
    setConfirmDelete(null);
  };

  const handleDownload = (asset) => {
    alert(`Download initiated for: ${asset.name}\n\nCloud URL: ${asset.cloudUrl}\n\nThis will be handled by 3ds Max script.`);
  };

  return (

    <div style={{
      display: "flex",
      height: "100vh",
      background: "#0a0a15",
      color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      overflow: "hidden"
    }}>
      {/* SIDEBAR - Chaos Cosmos Style */}
      <div style={{
        width: 280,
        background: "linear-gradient(180deg, #0d0d1f 0%, #16213e 100%)",
        borderRight: "1px solid #1a1a2e",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 16px",
          borderBottom: "1px solid #1a1a2e"
        }}>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 4,
            letterSpacing: "-0.02em"
          }}>
            My Asset Library
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            Personal 3D Assets Collection
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a2e" }}>
          <div style={{ display: "flex", gap: 6, background: "#0a0a15", borderRadius: 8, padding: 4 }}>
            <button
              onClick={() => setViewMode("online")}
              style={{
                flex: 1,
                background: viewMode === "online" ? "#6C63FF" : "transparent",
                border: "none",
                borderRadius: 6,
                padding: "8px 0",
                color: viewMode === "online" ? "#fff" : "#888",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              Online
            </button>
            <button
              onClick={() => setViewMode("downloaded")}
              style={{
                flex: 1,
                background: viewMode === "downloaded" ? "#6C63FF" : "transparent",
                border: "none",
                borderRadius: 6,
                padding: "8px 0",
                color: viewMode === "downloaded" ? "#fff" : "#888",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              Downloaded
            </button>
          </div>
        </div>

        {/* Categories */}

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {Object.entries(CATEGORIES).map(([catName, catInfo]) => {
            const isActive = selectedCategory === catName;
            const count = categoryCount(catName);
            
            return (
              <div key={catName}>
                <CategoryItem
                  name={catName}
                  icon={catInfo.icon}
                  color={catInfo.color}
                  isActive={isActive}
                  count={count}
                  onClick={() => {
                    setSelectedCategory(catName);
                    setSelectedSubCategory("All");
                  }}
                />
                
                {/* Sub-categories */}
                {isActive && catInfo.sub.length > 0 && (
                  <div style={{ background: "rgba(0,0,0,0.2)" }}>
                    {catInfo.sub.map(subName => (
                      <CategoryItem
                        key={subName}
                        name={subName}
                        icon="ti-chevron-right"
                        color={catInfo.color}
                        isActive={selectedSubCategory === subName}
                        count={subName === "All" ? count : categoryCount(catName, subName)}
                        onClick={() => setSelectedSubCategory(subName)}
                        level={1}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Button */}
        <div style={{ padding: 16, borderTop: "1px solid #1a1a2e" }}>
          <button
            onClick={() => setModal("add")}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #6C63FF 0%, #5a52d5 100%)",
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(108, 99, 255, 0.3)"
            }}
          >
            <i className="ti ti-plus" style={{ fontSize: 18 }} />
            Add New Asset
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top Bar */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #1a1a2e",
          background: "#0d0d1f",
          display: "flex",
          alignItems: "center",
          gap: 16
        }}>
          {/* Search */}
          <div style={{ flex: 1, position: "relative" }}>
            <i className="ti ti-search" style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              color: "#666"
            }} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "#16213e",
                border: "1px solid #2a2a3e",
                borderRadius: 10,
                padding: "12px 14px 12px 44px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit"
              }}
            />
          </div>

          {/* Sort & Filter */}
          <button style={{
            background: "#16213e",
            border: "1px solid #2a2a3e",
            borderRadius: 10,
            padding: "12px 16px",
            color: "#aaa",
            cursor: "pointer",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <i className="ti ti-sort-ascending" style={{ fontSize: 16 }} />
            Sort: Date
          </button>

          <button style={{
            background: "#16213e",
            border: "1px solid #2a2a3e",
            borderRadius: 10,
            padding: "12px 16px",
            color: "#aaa",
            cursor: "pointer",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <i className="ti ti-adjustments" style={{ fontSize: 16 }} />
            Filter
          </button>
        </div>

        {/* Assets Grid */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: 24
        }}>

          {/* Breadcrumb */}
          <div style={{
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#888"
          }}>
            <span>{selectedCategory}</span>
            {selectedSubCategory !== "All" && (
              <>
                <i className="ti ti-chevron-right" style={{ fontSize: 12 }} />
                <span style={{ color: "#aaa" }}>{selectedSubCategory}</span>
              </>
            )}
            <span style={{ marginLeft: "auto", color: "#666" }}>
              {filtered.length} {filtered.length === 1 ? "asset" : "assets"}
            </span>
          </div>

          {/* Assets Grid */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: 60,
              color: "#666"
            }}>
              <i className="ti ti-folder-off" style={{ fontSize: 64, color: "#333", marginBottom: 16, display: "block" }} />
              <div style={{ fontSize: 16, marginBottom: 8 }}>No assets found</div>
              <div style={{ fontSize: 13 }}>
                {searchQuery ? "Try a different search term" : "Click 'Add New Asset' to get started"}
              </div>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20
            }}>
              {filtered.map(asset => (
                <CosmosAssetCard
                  key={asset.id}
                  asset={asset}
                  onEdit={a => setModal({ mode: "edit", asset: a })}
                  onDelete={id => setConfirmDelete(id)}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {modal === "add" && (
        <Modal title="Add New Asset" onClose={() => setModal(null)}>
          <AssetForm onSave={addAsset} onClose={() => setModal(null)} />
        </Modal>
      )}

      {modal?.mode === "edit" && (
        <Modal title="Edit Asset" onClose={() => setModal(null)}>
          <AssetForm
            initial={modal.asset}
            onSave={editAsset}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete !== null && (

        <ConfirmDialog
          message="Are you sure you want to delete this asset? This action cannot be undone."
          onYes={() => deleteAsset(confirmDelete)}
          onNo={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
