-- ═══════════════════════════════════════════════════════════════
-- My Asset Library v4.0 - Chaos Cosmos Style
-- Shaxsiy Asset Library Browser for 3ds Max
-- ═══════════════════════════════════════════════════════════════
-- SOZLASH: Bu qatorlarni o'zgartiring
global MAL_serverUrl  = "https://your-vercel-app.vercel.app/api/assets"
global MAL_tempFolder = (getDir #temp) + "\\MyAssetLib\\"
-- ═══════════════════════════════════════════════════════════════

-- ─── YORDAMCHI FUNKSIYALAR ───────────────────────────────────

-- URL dan matn yuklash (GET request)
fn MAL_fetchURL url = (
    local result = ""
    try (
        local wc = dotNetObject "System.Net.WebClient"
        wc.Headers.Add "User-Agent" "3dsMax-AssetLib/4.0"
        wc.Headers.Add "Accept" "application/json"
        wc.Encoding = dotNetClass "System.Text.Encoding" |> .UTF8
        result = wc.DownloadString url
    ) catch (
        local err = ""
        try ( err = getCurrentException ) catch ( err = "Unknown error" )
        messageBox ("Server bilan bog'lanib bo'lmadi!\n\nURL: " + url + "\n\nXato: " + err) \
            title:"Asset Library - Connection Error"
    )
    result
)

-- URL dan fayl yuklab olish (progress notification)
fn MAL_downloadFile url dest progressFn:undefined = (
    local ok = false
    try (
        local wc = dotNetObject "System.Net.WebClient"
        
        -- Progress callback
        if progressFn != undefined do (
            dotNet.addEventHandler wc "DownloadProgressChanged" progressFn
        )
        
        wc.DownloadFile url dest
        ok = true
    ) catch (
        local err = ""
        try ( err = getCurrentException ) catch ( err = "Unknown error" )
        messageBox ("Fayl yuklanmadi!\n\nDestination: " + dest + "\n\nXato: " + err) \
            title:"Asset Library - Download Error"
    )
    ok
)

-- JSON dan kalit qiymatini olish (regex)
fn MAL_getVal json key = (
    local pat = "\"" + key + "\"\\s*:\\s*\"([^\"]*)\""
    local rx  = dotNetObject "System.Text.RegularExpressions.Regex" pat
    local m   = rx.Match json
    if m.Success then m.Groups.Item[1].Value else ""
)



-- JSON massivini parse qilish
fn MAL_parseAssets json = (
    local arr = #()
    if json == "" do return arr
    
    -- Har bir JSON object ni olish
    local rx = dotNetObject "System.Text.RegularExpressions.Regex" "\\{[^\\{\\}]+\\}"
    local ms = rx.Matches json
    
    for i = 0 to (ms.Count - 1) do (
        local obj = ms.Item[i].Value
        local nm  = MAL_getVal obj "name"
        local mc  = MAL_getVal obj "mainCategory"
        local sc  = MAL_getVal obj "subCategory"
        local ft  = MAL_getVal obj "format"
        local sz  = MAL_getVal obj "size"
        local url = MAL_getVal obj "cloudUrl"
        local dsc = MAL_getVal obj "description"
        
        if nm != "" and url != "" do (
            append arr #(nm, mc, sc, ft, sz, url, dsc)
            -- Index:   1   2   3   4   5   6    7
        )
    )
    arr
)

-- Vaqtinchalik papkani yaratish
fn MAL_ensureTemp = (
    if not (doesFileExist MAL_tempFolder) do (
        makeDir MAL_tempFolder all:true
    )
)

-- Xavfsiz fayl nomi (maxsus belgilarni olib tashlash)
fn MAL_safeName nm = (
    local rx = dotNetObject "System.Text.RegularExpressions.Regex" "[\\\\/:*?\"<>|]"
    rx.Replace nm "_"
)

-- Format bo'yicha import
fn MAL_importFile dest fmt assetName = (
    local ext = toLower fmt
    local result = case ext of (
        "max": (
            local ok = mergeMaxFile dest #noPrompt #renameMergedMaterial
            if ok then "MAX merged successfully!" else "MAX merge failed!"
        )
        "fbx": ( importFile dest #noPrompt; "FBX imported!" )
        "obj": ( importFile dest #noPrompt; "OBJ imported!" )
        "glb": ( importFile dest #noPrompt; "GLB imported!" )
        "gltf":( importFile dest #noPrompt; "GLTF imported!" )
        "3ds": ( importFile dest #noPrompt; "3DS imported!" )
        "abc": ( importFile dest #noPrompt; "Alembic imported!" )
        "c4d": ( importFile dest #noPrompt; "C4D imported!" )
        "blend": ( importFile dest #noPrompt; "Blender imported!" )
        default: ( importFile dest #noPrompt; (toUpper ext) + " imported!" )
    )
    result
)



-- ─── ASOSIY ROLLOUT: ASSET BROWSER ───────────────────────────

rollout MAL_browserRollout "Asset Browser" width:420 (

    -- Header
    label lbl_logo "⬢  MY ASSET LIBRARY" align:#center
    label lbl_sub  "Personal 3D Assets Collection" align:#center
    label lbl_div  "──────────────────────────────────────────" align:#center

    -- Filter Group
    group "Qidiruv va Filter" (
        dropdownList ddl_mainCat "Kategoriya:" width:380 align:#center \
            items:#("All","3D Models","Materials","HDRIs","Collections")

        dropdownList ddl_subCat "Sub-kategoriya:" width:380 align:#center \
            items:#("All",\
                    "Furniture","Accessories","Lighting","Vegetation","Vehicles",\
                    "People","Animals","Architecture","Presets","Enmesh - Pattern",\
                    "Wood","Metal","Fabric","Stone","Glass","Concrete","Plastic","Other",\
                    "Interior","Exterior","Studio","Nature","Urban")

        edittext txt_search "Qidirish:" width:380 align:#center
        
        button btn_load   "🔄 Yuklash"   width:185 height:26 align:#left
        button btn_reset  "✖ Tozalash"  width:185 height:26 align:#right
    )

    -- Asset List
    group "Assetlar" (
        listbox lbx height:12 width:380 align:#center
        label lbl_count "0 asset topildi" align:#center
    )

    -- Selected Asset Info
    group "Tanlangan Asset" (
        label lbl_name "Nom: —" align:#left
        label lbl_cat  "Kategoriya: —" align:#left
        label lbl_fmt  "Format: —" align:#left
        label lbl_size "Hajm: —" align:#left
        label lbl_desc "—" align:#left
    )

    -- Action Buttons
    button btn_import "⬇  SAHNAGA IMPORT QILISH" width:380 height:38 align:#center
    label  lbl_gap    " " align:#center
    button btn_info   "ℹ Ma'lumot"     width:185 height:24 align:#left
    button btn_copy   "📋 URL Nusxa"   width:185 height:24 align:#right
    
    -- Status
    label lbl_status "Tayyor. Assetlarni yuklang." align:#center

    -- ─── DATA ────────────────────────────────────────────────
    local assetData = #()
    local currentAsset = undefined

    -- ─── HELPER FUNCTIONS ────────────────────────────────────

    fn updateInfo idx = (
        if idx >= 1 and idx <= assetData.count then (
            local a = assetData[idx]
            currentAsset = a
            lbl_name.text = "Nom: " + a[1]
            lbl_cat.text  = "Kat: " + a[2] + " / " + a[3]
            lbl_fmt.text  = "Format: ." + (toLower a[4])
            lbl_size.text = "Hajm: " + (if a[5] != "" then a[5] else "—")
            lbl_desc.text = if a[7] != "" then a[7] else "Tavsif yo'q"
        ) else (
            currentAsset = undefined
            lbl_name.text = "Nom: —"
            lbl_cat.text  = "Kategoriya: —"
            lbl_fmt.text  = "Format: —"
            lbl_size.text = "Hajm: —"
            lbl_desc.text = "—"
        )
    )

    fn buildUrl = (
        local url = MAL_serverUrl
        local sep = "?"
        local cat = ddl_mainCat.selected
        local sub = ddl_subCat.selected
        local q   = txt_search.text

        if cat != "All" do ( url = url + sep + "cat=" + cat; sep = "&" )
        if sub != "All" do ( url = url + sep + "sub=" + sub; sep = "&" )
        if q   != ""    do ( url = url + sep + "q="   + q )
        url
    )



    fn doLoad = (
        lbl_status.text = "⏳ Yuklanmoqda..."
        local json = MAL_fetchURL (buildUrl())
        
        if json == "" do (
            lbl_status.text = "❌ Server xatosi! URL ni tekshiring."
            return false
        )

        assetData = MAL_parseAssets json

        -- Listbox uchun nomlar
        local names = for a in assetData collect (
            a[1] + "   [." + (toLower a[4]) + "]"
        )
        lbx.items = names
        lbl_count.text = (assetData.count as string) + " asset topildi"
        updateInfo 0
        lbl_status.text = "✓ " + (assetData.count as string) + " asset yuklandi"
    )

    fn doImport = (
        if currentAsset == undefined do (
            messageBox "Avval listboxdan asset tanlang!" title:"Asset Library"
            return false
        )

        local nm   = currentAsset[1]
        local fmt  = toLower currentAsset[4]
        local url  = currentAsset[6]

        -- Xavfsiz fayl nomi
        local safe = MAL_safeName nm
        local dest = MAL_tempFolder + safe + "." + fmt

        MAL_ensureTemp()

        -- Cache tekshirish
        if doesFileExist dest then (
            local useCache = queryBox \
                ("'" + nm + "' cache da mavjud.\n\nCache dan foydalanilsinmi?\n\n" + dest) \
                title:"Cache"
            if not useCache do deleteFile dest
        )

        -- Yuklab olish
        if not (doesFileExist dest) then (
            lbl_status.text = "⬇ Yuklanmoqda: " + nm + "..."
            
            -- Progress callback
            local progressHandler = dotNetObject "System.EventHandler" "System.Net.DownloadProgressChangedEventArgs"
            
            if not (MAL_downloadFile url dest) do (
                lbl_status.text = "❌ Yuklash xatosi!"
                return false
            )
        )

        -- Import
        lbl_status.text = "📥 Import qilinmoqda..."
        local msg = MAL_importFile dest fmt nm
        lbl_status.text = "✓ " + msg
        
        messageBox ("Asset sahnaga qo'shildi!\n\n" + nm + "\nFormat: ." + fmt) \
            title:"Asset Library - Success"
    )

    -- ─── EVENT HANDLERS ──────────────────────────────────────

    on MAL_browserRollout open do (
        lbl_logo.text = "⬢  MY ASSET LIBRARY"
        lbl_sub.text  = "Personal 3D Assets Collection"
        doLoad()
    )

    on btn_load  pressed do doLoad()
    
    on btn_reset pressed do (
        txt_search.text = ""
        ddl_mainCat.selection = 1
        ddl_subCat.selection  = 1
        doLoad()
    )

    on ddl_mainCat selected i do doLoad()
    on ddl_subCat  selected i do doLoad()
    on txt_search  entered  s do doLoad()
    on lbx         selected i do updateInfo i
    on btn_import  pressed    do doImport()

    on btn_info pressed do (
        if currentAsset == undefined then (
            messageBox "Asset tanlang!" title:"Asset Library"
        ) else (
            local a = currentAsset
            messageBox (
                "Asset Ma'lumotlari\n" + \
                "─────────────────────────\n\n" + \
                "Nom:          " + a[1] + "\n" + \
                "Kategoriya:   " + a[2] + " / " + a[3] + "\n" + \
                "Format:       ." + (toLower a[4]) + "\n" + \
                "Hajm:         " + (if a[5] != "" then a[5] else "—") + "\n" + \
                "Tavsif:       " + (if a[7] != "" then a[7] else "—") + "\n\n" + \
                "Cloud URL:\n" + a[6]
            ) title:("Asset: " + a[1])
        )
    )

    on btn_copy pressed do (
        if currentAsset == undefined then (
            messageBox "Asset tanlang!" title:"Asset Library"
        ) else (
            setClipboardText currentAsset[6]
            lbl_status.text = "✓ URL nusxalandi: " + currentAsset[1]
        )
    )
)



-- ─── SOZLAMALAR ROLLOUT ──────────────────────────────────────

rollout MAL_settingsRollout "Sozlamalar" width:420 (

    group "Server API URL" (
        label lbl_hint "Web app Vercel URL ingizni kiriting:" align:#left
        edittext txt_url "" width:380 align:#center
        button btn_save "💾 Saqlash"      width:185 height:26 align:#left
        button btn_test "🔗 Test qilish"  width:185 height:26 align:#right
        label  lbl_res  "" align:#center
    )

    group "Cache Papka" (
        label lbl_path "" align:#left
        button btn_open  "📁 Papkani Ochish"   width:185 height:26 align:#left
        button btn_clear "🗑 Cache Tozalash"  width:185 height:26 align:#right
        label  lbl_cache "" align:#center
    )

    group "Ma'lumot" (
        label lbl_v1 "My Asset Library v4.0" align:#left
        label lbl_v2 "Chaos Cosmos style interface" align:#left
        label lbl_v3 "github.com/Muslim1413/Moe_scripts" align:#left
    )

    group "Qo'llanma" (
        label lbl_g1 "1. Vercel.com da web app deploy qiling"           align:#left
        label lbl_g2 "2. Berilgan URL ni yuqoridagi maydonga kiriting"  align:#left
        label lbl_g3 "3. 'Saqlash' va 'Test qilish' tugmalarini bosing" align:#left
        label lbl_g4 "4. Web app orqali assetlar qo'shing"              align:#left
        label lbl_g5 "5. 'Asset Browser' tabdan import qiling"          align:#left
    )

    on MAL_settingsRollout open do (
        txt_url.text  = MAL_serverUrl
        lbl_path.text = "Papka: " + MAL_tempFolder
        
        -- Cache hajmini hisoblash
        local files = getFiles (MAL_tempFolder + "*.*")
        local totalSize = 0.0
        for f in files do (
            try ( totalSize += (getFileSize f) / 1048576.0 ) catch ()
        )
        lbl_cache.text = (files.count as string) + " fayl, " + \
                         (totalSize as integer as string) + " MB"
    )

    on btn_save pressed do (
        MAL_serverUrl = txt_url.text
        lbl_res.text = "✓ URL saqlandi!"
        lbl_res.forecolor = (color 100 200 100)
    )

    on btn_test pressed do (
        lbl_res.text = "⏳ Tekshirilmoqda..."
        lbl_res.forecolor = (color 200 200 200)
        
        local json = MAL_fetchURL txt_url.text
        
        if json != "" then (
            local len = json.count
            lbl_res.text = "✓ Ulanish muvaffaqiyatli! (" + (len as string) + " belgi)"
            lbl_res.forecolor = (color 100 200 100)
        ) else (
            lbl_res.text = "✗ Ulanib bo'lmadi!"
            lbl_res.forecolor = (color 200 100 100)
        )
    )

    on btn_open pressed do (
        MAL_ensureTemp()
        shellLaunch "explorer.exe" MAL_tempFolder
    )

    on btn_clear pressed do (
        local files = getFiles (MAL_tempFolder + "*.*")
        local count = 0
        
        for f in files do (
            try ( deleteFile f; count += 1 ) catch ()
        )
        
        lbl_cache.text = (count as string) + " fayl o'chirildi"
        lbl_res.text = "✓ Cache tozalandi!"
        lbl_res.forecolor = (color 100 200 100)
    )
)



-- ─── FLOATER OCHISH ──────────────────────────────────────────

-- Eski floaterni yopish
if MAL_floater != undefined do (
    try (
        closeRolloutFloater MAL_floater
    ) catch (
        MAL_floater = undefined
    )
)

-- Yangi floater yaratish
MAL_floater = newRolloutFloater "My Asset Library v4.0" 440 800 100 80
addRollout MAL_browserRollout  MAL_floater
addRollout MAL_settingsRollout MAL_floater rolledUp:true

-- Success xabari
print "═══════════════════════════════════════════════════════════"
print "✓ My Asset Library v4.0 yuklandi!"
print ("  Server URL: " + MAL_serverUrl)
print ("  Cache Papka: " + MAL_tempFolder)
print "═══════════════════════════════════════════════════════════"
