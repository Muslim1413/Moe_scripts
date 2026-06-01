-- =====================================================
-- MyAssetLibrary.ms  —  3ds Max MAXScript v3
-- Shaxsiy Asset Library Browser (to'liq bugfix)
-- =====================================================
-- BU QATORNI O'ZGARTIRING:
global MAL_serverUrl  = "https://YOUR-APP.vercel.app/api/assets"
global MAL_tempFolder = (getDir #temp) + "\\MyAssetLib\\"
-- =====================================================
-- TUZATILGAN XATOLAR:
-- 1. getCurrentException() -> getCurrentException (qavsiz)
-- 2. #{ } BitArray xatosi -> #() oddiy array
-- 3. a.name, a.format -> a[1], a[4] (to'g'ri index)
-- 4. getKBValue mavjud emas -> edittext + button
-- 5. txt_q changed -> entered (ortiqcha so'rov oldini olish)
-- 6. MAL_floater xavfsiz tekshiruv
-- 7. Fayl nomi tozalash uchun regex qo'shildi
-- 8. buildUrl yordamchi funksiyasi
-- 9. MAXScript da "\" path escape to'g'rilandi
-- =====================================================


-- ─── YORDAMCHI FUNKSIYALAR ───────────────────────────────────

-- URL dan matn yuklash
fn MAL_fetchURL url = (
	local result = ""
	try (
		local wc = dotNetObject "System.Net.WebClient"
		wc.Headers.Add "User-Agent" "3dsMax-AssetLib/3.0"
		wc.Headers.Add "Accept"     "application/json"
		result = wc.DownloadString url
	) catch (
		-- FIX: getCurrentException qavsiz (MAXScript da funksiya emas, property)
		local err = ""
		try ( err = getCurrentException ) catch ( err = "noma'lum xato" )
		messageBox ("Server bilan ulanib bo'lmadi!\n\nURL: " + url + "\nXato: " + err) \
			title:"Asset Library"
	)
	result
)

-- URL dan fayl yuklab olish
fn MAL_downloadFile url dest = (
	local ok = false
	try (
		local wc = dotNetObject "System.Net.WebClient"
		wc.DownloadFile url dest
		ok = true
	) catch (
		local err = ""
		try ( err = getCurrentException ) catch ( err = "noma'lum xato" )
		messageBox ("Fayl yuklab bo'lmadi!\n\nDestination: " + dest + "\nXato: " + err) \
			title:"Asset Library"
	)
	ok
)

-- JSON dan kalit qiymatini olish (regex)
fn MAL_getVal json key = (
	-- FIX: MAXScript string da " => \" yoziladi
	-- Pattern: "key"\s*:\s*"([^"]*)"
	local pat = "\"" + key + "\"\\s*:\\s*\"([^\"]*)\""
	local rx  = dotNetObject "System.Text.RegularExpressions.Regex" pat
	local m   = rx.Match json
	if m.Success then m.Groups.Item[1].Value else ""
)

-- JSON massivini parse qilish
-- Qaytaradi: #( #(name,mainCat,subCat,format,size,cloudUrl), ... )
fn MAL_parseAssets json = (
	-- FIX: #() array, #{ } emas (BitArray bilan adashtirmaslik)
	local arr = #()
	if json == "" do return arr
	
	-- Har bir JSON object ni olish: { ... }
	local rx = dotNetObject "System.Text.RegularExpressions.Regex" "\{[^\{\}]+\}"
	local ms = rx.Matches json
	
	for i = 0 to (ms.Count - 1) do (
		local o  = ms.Item[i].Value
		local nm = MAL_getVal o "name"
		local mc = MAL_getVal o "mainCategory"
		local sc = MAL_getVal o "subCategory"
		local ft = MAL_getVal o "format"
		local sz = MAL_getVal o "size"
		local ur = MAL_getVal o "cloudUrl"
		
		-- Faqat nom va URL bo'lsa qo'sh
		if nm != "" and ur != "" do (
			-- FIX: to'g'ri array syntax, struct emas
			append arr #(nm, mc, sc, ft, sz, ur)
			-- Index:   1    2   3   4   5   6
		)
	)
	arr
)

-- Vaqtinchalik papkani yaratish
fn MAL_ensureTemp = (
	if not (doesFileExist MAL_tempFolder) do
		makeDir MAL_tempFolder all:true
)

-- Xavfsiz fayl nomi yaratish (maxsus belgilarni _ bilan almashtirish)
fn MAL_safeName nm = (
	local rx = dotNetObject "System.Text.RegularExpressions.Regex" "[\\/:*?\"<>|]"
	rx.Replace nm "_"
)

-- Format bo'yicha import
fn MAL_importFile dest fmt = (
	local ext = toLower fmt
	case ext of (
		"max": (
			-- mergeMaxFile to'liq absolute path talab qiladi
			local ok = mergeMaxFile dest #noPrompt #renameMergedMaterial
			if ok then "MAX sahnaga qo'shildi!" else "MAX import xatosi!"
		)
		"fbx": ( importFile dest #noPrompt; "FBX import muvaffaqiyatli!" )
		"obj": ( importFile dest #noPrompt; "OBJ import muvaffaqiyatli!" )
		"glb": ( importFile dest #noPrompt; "GLB import muvaffaqiyatli!" )
		"gltf":( importFile dest #noPrompt; "GLTF import muvaffaqiyatli!" )
		"3ds": ( importFile dest #noPrompt; "3DS import muvaffaqiyatli!" )
		"abc": ( importFile dest #noPrompt; "Alembic import muvaffaqiyatli!" )
		"c4d": ( importFile dest #noPrompt; "C4D import muvaffaqiyatli!" )
		default: ( importFile dest #noPrompt; (toUpper ext) + " import muvaffaqiyatli!" )
	)
)


-- ─── ASOSIY DIALOG ───────────────────────────────────────────

rollout MAL_mainRollout "My Asset Library" width:340 (

	label  lbl_hdr "⬡  MY ASSET LIBRARY"              align:#center
	label  lbl_sep "─────────────────────────────────" align:#center

	group "Qidiruv va Filter" (
		dropdownList ddl_mainCat "Kategoriya:" width:300 align:#center \
			items:#("Hammasi","3D Models","Materials","HDRIs","Collections")

		dropdownList ddl_subCat "Sub-kategoriya:" width:300 align:#center \
			items:#("Hammasi",\
			        "Furniture","Accessories","Lighting","Vegetation","Vehicles",\
			        "People","Animals","Architecture","Presets","Enmesh - Pattern",\
			        "Wood","Metal","Fabric","Stone","Glass","Concrete","Plastic","Other",\
			        "Interior","Exterior","Studio","Nature","Urban")

		edittext  txt_srch "Qidirish:" width:300 align:#center
		button    btn_load    "Yuklash"   width:145 align:#left
		button    btn_reset   "Tozalash"  width:145 align:#right
	)

	group "Assetlar" (
		listbox lbx height:10 width:300 align:#center
	)

	group "Tanlangan asset" (
		label lbl_n "Nom: —"      align:#left
		label lbl_c "Kat: —"      align:#left
		label lbl_f "Format: —"   align:#left
		label lbl_s "Hajm: —"     align:#left
	)

	button btn_import "⬇  SAHNAGA IMPORT QILISH" width:300 height:32 align:#center
	label  lbl_gap    " " align:#center
	button btn_info   "Ma'lumot"    width:145 align:#left
	button btn_urlcp  "URL Nusxalash" width:145 align:#right
	label  lbl_st     "Serverdan assetlarni yuklang" align:#center

	-- ─── Ma'lumotlar ─────────────────────────────────────────
	local aData = #()  -- FIX: #() array (BitArray emas)

	-- ─── Ichki funksiyalar ────────────────────────────────────

	fn updateInfo idx = (
		if idx >= 1 and idx <= aData.count then (
			-- FIX: a.name emas, a[1] (oddiy array, struct emas)
			local a = aData[idx]
			lbl_n.text = "Nom: "     + a[1]
			lbl_c.text = "Kat: "     + a[2] + " / " + a[3]
			lbl_f.text = "Format: ." + (toLower a[4])
			lbl_s.text = "Hajm: "    + (if a[5] != "" then a[5] else "—")
		) else (
			lbl_n.text = "Nom: —"
			lbl_c.text = "Kat: —"
			lbl_f.text = "Format: —"
			lbl_s.text = "Hajm: —"
		)
	)

	-- URL parametrlarini qurish
	fn buildUrl = (
		local url = MAL_serverUrl
		local sep = "?"
		local cat = ddl_mainCat.selected
		local sub = ddl_subCat.selected
		local q   = txt_srch.text

		if cat != "Hammasi" do ( url = url + sep + "cat=" + cat; sep = "&" )
		if sub != "Hammasi" do ( url = url + sep + "sub=" + sub; sep = "&" )
		if q   != ""        do ( url = url + sep + "q="   + q )
		url
	)

	-- Serverdan assetlarni yuklash
	fn doLoad = (
		lbl_st.text = "Yuklanmoqda..."
		local json = MAL_fetchURL (buildUrl())
		if json == "" do ( lbl_st.text = "Server xatosi! URL ni sozlamalardan tekshiring."; return false )

		aData = MAL_parseAssets json

		-- Listbox ga nomlarni yozish
		local names = for a in aData collect (
			a[1] + "   [." + (toLower a[4]) + "]"
		)
		lbx.items = names
		updateInfo 0

		lbl_st.text = (aData.count as string) + " asset topildi"
	)

	-- Asset import qilish
	fn doImport = (
		local idx = lbx.selection
		if idx < 1 then (
			messageBox "Avval listboxdan asset tanlang!" title:"Asset Library"
			return false
		)
		if idx > aData.count then (
			messageBox "Indeks xatosi! Assetlarni qayta yuklang." title:"Asset Library"
			return false
		)

		local a    = aData[idx]
		local nm   = a[1]  -- nom
		local fmt  = toLower a[4]  -- format
		local url  = a[6]  -- cloud URL

		-- Xavfsiz fayl nomi
		local safe = MAL_safeName nm
		local dest = MAL_tempFolder + safe + "." + fmt

		MAL_ensureTemp()

		-- Cache tekshirish
		if doesFileExist dest then (
			local useCache = queryBox \
				("'" + nm + "' allaqachon yuklab olingan.\n\nCache dan foydalanilsinmi?\n\n" + dest) \
				title:"Cache"
			if not useCache do deleteFile dest
		)

		-- Yuklab olish (kerak bo'lsa)
		if not (doesFileExist dest) then (
			lbl_st.text = "Yuklanmoqda: " + nm + "..."
			if not (MAL_downloadFile url dest) do (
				lbl_st.text = "Yuklash xatosi!"
				return false
			)
		)

		-- Import
		lbl_st.text = "Import qilinmoqda: " + nm + "..."
		local msg = MAL_importFile dest fmt
		lbl_st.text = msg
		messageBox msg title:"Asset Library"
	)

	-- ─── EVENT HANDLERLAR ────────────────────────────────────

	on MAL_mainRollout open do doLoad()

	on btn_load  pressed do doLoad()
	on btn_reset pressed do (
		txt_srch.text = ""
		ddl_mainCat.selection = 1
		ddl_subCat.selection  = 1
		doLoad()
	)

	on ddl_mainCat selected i do doLoad()
	on ddl_subCat  selected i do doLoad()

	-- FIX: "changed" o'rniga "entered" — foydalanuvchi Enter bosganida qidiradi
	-- Bu har harf bosilganda server so'rov yuborishni oldini oladi
	on txt_srch entered s do doLoad()

	on lbx selected i do updateInfo i

	on btn_import pressed do doImport()

	on btn_info pressed do (
		local idx = lbx.selection
		if idx < 1 or idx > aData.count then (
			messageBox "Asset tanlang!" title:"Asset Library"
		) else (
			local a = aData[idx]
			messageBox (
				"Nom:          " + a[1] + "\n" +
				"Kategoriya:   " + a[2] + " / " + a[3] + "\n" +
				"Format:       ." + (toLower a[4]) + "\n" +
				"Hajm:         " + (if a[5] != "" then a[5] else "—") + "\n\n" +
				"Cloud URL:\n" + a[6]
			) title:("Asset: " + a[1])
		)
	)

	on btn_urlcp pressed do (
		local idx = lbx.selection
		if idx >= 1 and idx <= aData.count then (
			setClipboardText aData[idx][6]
			lbl_st.text = "URL nusxalandi: " + aData[idx][1]
		) else (
			messageBox "Asset tanlang!" title:"Asset Library"
		)
	)
)


-- ─── SOZLAMALAR DIALOG ───────────────────────────────────────

rollout MAL_cfgRollout "Sozlamalar" width:340 (

	group "Server API URL" (
		label    lbl_hint "Web app Vercel URL ingizni kiriting:" align:#left
		edittext txt_url  "" width:300 align:#center
		button   btn_save "Saqlash" width:145 align:#left
		button   btn_test "Test qilish" width:145 align:#right
		label    lbl_res  "" align:#center
	)

	group "Cache" (
		label    lbl_path  "" align:#left
		button   btn_clear "Cache ni tozalash" width:300 align:#center
		label    lbl_cres  "" align:#center
	)

	group "Qo'llanma" (
		label lbl_g1 "1. vercel.com > New Project > api_assets.js deploy" align:#left
		label lbl_g2 "2. Berilgan URL ni yuqoridagi maydonga kiriting"    align:#left
		label lbl_g3 "3. Web app da assetlarni qo'shing (CloudURL bilan)" align:#left
		label lbl_g4 "4. Asosiy tabda 'Yuklash' tugmasini bosing"         align:#left
		label lbl_g5 "5. Asset tanlang va 'Import' bosing — tayyor!"      align:#left
	)

	on MAL_cfgRollout open do (
		txt_url.text   = MAL_serverUrl
		lbl_path.text  = "Papka: " + MAL_tempFolder
	)

	on btn_save pressed do (
		MAL_serverUrl = txt_url.text
		lbl_res.text  = "URL saqlandi!"
	)

	on btn_test pressed do (
		lbl_res.text = "Ulanish tekshirilmoqda..."
		local json = MAL_fetchURL txt_url.text
		lbl_res.text = if json != "" \
			then ("✓ Ulanish muvaffaqiyatli! Javob: " + (json.count as string) + " belgi") \
			else "✗ Ulanib bo'lmadi!"
	)

	on btn_clear pressed do (
		local files = getFiles (MAL_tempFolder + "*.*")
		for f in files do deleteFile f
		lbl_cres.text = (files.count as string) + " ta fayl o'chirildi"
	)
)


-- ─── FLOATER OCHISH ──────────────────────────────────────────

-- FIX: xavfsiz tekshiruv — MAL_floater undefined bo'lsa try/catch bilan yop
if MAL_floater != undefined do (
	try (
		closeRolloutFloater MAL_floater
	) catch (
		MAL_floater = undefined
	)
)

MAL_floater = newRolloutFloater "My Asset Library" 360 700 80 80
addRollout MAL_mainRollout MAL_floater
addRollout MAL_cfgRollout  MAL_floater rolledUp:true

-- Muvaffaqiyatli yuklanish xabari
print "================================================="
print "My Asset Library v3 — muvaffaqiyatli yuklandi!"
print ("Server URL: " + MAL_serverUrl)
print ("Temp papka: " + MAL_tempFolder)
print "================================================="
