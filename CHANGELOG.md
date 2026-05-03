## [1.2.0] - 2026-05-03

### Changed - BiDi Parser (الحل الحقيقي)
- ✅ بدل ما نضبط الـ direction بس، دلوقتي بنعمل **BiDi tokenizer** حقيقي
- ✅ كل كلمة إنجليزي في سياق عربي بتتلف في `<bdi dir="ltr">` تلقائياً
- ✅ النص المختلط (عربي + إنجليزي في نفس السطر) بقى يتقرأ صح
- ✅ الـ reset بيشيل الـ `<bdi>` اللي اتضافت ويرجّع النص الأصلي
- ✅ URLs والأرقام والـ hashtags بتتعامل كـ LTR runs

# Changelog

## [1.1.0] - 2026-05-03

### Added
- ⌨️ Keyboard shortcut `Alt+R` لتفعيل/إيقاف سريع
- 🌐 Per-site toggle — تعطيل الـ extension على موقع معين
- 🔢 إصلاح الأرقام العربية (١٢٣) بجانب الإنجليزي
- 📋 Clipboard fix — إضافة RLM mark للنصوص المنسوخة
- 🖱️ Right-click support لقلب اتجاه عنصر معين
- 🍞 Toast notifications لتأكيد الإجراءات
- منع معالجة نفس العنصر أكثر من مرة (data-rtl-fixed)

## [1.0.0] - 2026-05-03

### Added
- Initial release 🎉
- Auto-detection of Arabic text using Unicode ranges
- Smart RTL/LTR classification based on Arabic character ratio (>30% = RTL)
- `unicode-bidi: plaintext` for mixed Arabic/English content
- Real-time input direction detection while typing
- MutationObserver support for dynamic/SPA websites
- Popup UI with manual fix and reset buttons
- On/off toggle saved via chrome.storage.sync
