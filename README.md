# 🔤 Arabic RTL Fixer — Chrome Extension

<div align="center">

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Manifest](https://img.shields.io/badge/manifest-v3-orange)
![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow)

**يصلح مشاكل اتجاه النص العربي المختلط مع الإنجليزي في أي موقع**

*Automatically fixes Arabic & English mixed text direction on any website*

</div>

---

## 🎯 المشكلة / The Problem

لما بتشوف نص فيه عربي وإنجليزي مع بعض في البراوزر، الـ Unicode Bidi Algorithm بيتلخبط.

**المشكلة:** جملة زي «مرحبا AI tools بتاعك» — كلمة `AI tools` بتتعكس وتتقرأ غلط.

**الحل:** كل كلمة إنجليزي بتتلف في `<bdi dir="ltr">` عشان تتعزل عن السياق العربي:

```html
<!-- قبل -->
<p dir="rtl">مرحبا AI tools بتاعك</p>

<!-- بعد (الـ extension بيعملها تلقائي) -->
<p dir="rtl">مرحبا <bdi dir="ltr">AI</bdi> <bdi dir="ltr">tools</bdi> بتاعك</p>
```

> المشكلة دي موجودة في **كل المواقع** — حتى Claude.ai نفسها بتعاني منها.

---

## ✨ الميزات / Features

- 🧠 **BiDi Parser حقيقي** — مش بس `dir="rtl"`، بيلف كل كلمة إنجليزي في `<bdi>` عشان تتعزل صح
- 🔄 **تلقائي** — يشتغل فور فتح أي صفحة
- 🌐 **يشتغل على أي موقع** — مش مقيد بموقع معين
- 📝 **يصلح الـ inputs** — بيحس لو بتكتب عربي ويغير الاتجاه تلقائي
- ⚡ **SPAs support** — يشتغل مع المواقع الديناميكية (React, Vue, etc.)
- ⌨️ **Keyboard shortcut** — اضغط `Alt+R` لتفعيل/إيقاف فوري
- 🌍 **Per-site toggle** — تعطيل الـ extension على موقع معين من الـ popup
- 🖱️ **Right-click support** — قلب اتجاه أي عنصر بكليك يمين
- 🪶 **خفيف جداً** — مفيش servers، مفيش tracking، كل حاجة محلية

---

## 🚀 التثبيت / Installation

### من Chrome Web Store
> قريباً / Coming Soon

### يدوي (Developer Mode)

1. حمّل الـ ZIP من [Releases](../../releases)
2. فك الضغط في أي فولدر
3. افتح Chrome وروح لـ `chrome://extensions`
4. فعّل **Developer mode** (زرار في فوق يمين)
5. اضغط **Load unpacked** واختار الفولدر

---

## 🔍 إزاي بيشتغل / How It Works

### الفكرة الأساسية — BiDi Tokenizer

مش بس بنضبط `dir="rtl"` على الـ element. بنعمل **parser حقيقي** يقرأ النص ويقسّمه:

```
"مرحبا AI tools بتاعك كويس"
       ↓ tokenizer
[arabic: "مرحبا "] [ltr: "AI"] [neutral: " "] [ltr: "tools"] [arabic: " بتاعك كويس"]
       ↓ renderer
مرحبا <bdi dir="ltr">AI</bdi> <bdi dir="ltr">tools</bdi> بتاعك كويس
```

كل كلمة إنجليزي بتتلف في `<bdi dir="ltr">` — عنصر HTML مصمم خصيصاً لعزل اتجاه النص — فمش بتتعكس حتى لو في سياق عربي كامل.

### خطوات الإصلاح

**١. Tokenizer** — يقسّم النص لـ 3 أنواع:
- `arabic` → حروف عربية وعلامات ترقيم عربية
- `ltr` → كلمات إنجليزية، أرقام، URLs، hashtags
- `neutral` → spaces وعلامات ترقيم عادية

**٢. نسبة العربي** — لو العربي > 30% → `dir="rtl"` | لو أقل → `dir="auto"`

**٣. Renderer** — يحوّل الـ tokens لـ DOM: الـ LTR tokens في `<bdi>`, الباقي text nodes عادية

**٤. MutationObserver** — يراقب المحتوى الديناميكي (SPAs, lazy loading)

**٥. Input Watcher** — يضبط الـ inputs أثناء الكتابة

---

## 📁 هيكل الملفات / File Structure

```
rtl-extension/
├── manifest.json       # Extension config (Manifest V3)
├── content.js          # BiDi Parser — Core logic
├── popup.html          # Extension popup UI
├── popup.js            # Popup interactions
├── icon16/48/128.png   # Extension icons
├── PRIVACY_POLICY.md   # Privacy policy
├── CHANGELOG.md        # Version history
├── CONTRIBUTING.md     # How to contribute
└── README.md           # This file
```

---

## 🤝 المساهمة / Contributing

مرحب بأي مساهمة! شوف [CONTRIBUTING.md](CONTRIBUTING.md) للتفاصيل.

Features اتعملت:
- [x] ~~Keyboard shortcut~~ ✅ v1.1.0
- [x] ~~Per-site toggle~~ ✅ v1.1.0
- [x] ~~BiDi Parser حقيقي~~ ✅ v1.2.0
- [x] ~~Debounce للـ streaming content~~ ✅ v1.2.2

---

## 📄 الرخصة / License

MIT — شوف [LICENSE](LICENSE) للتفاصيل.

---

## 🔒 الخصوصية / Privacy

الـ extension **لا يجمع أي بيانات** ولا يتواصل مع أي سيرفر خارجي.
كل العمليات بتحصل محلياً في المتصفح بتاعك.

شوف [PRIVACY_POLICY.md](PRIVACY_POLICY.md) للتفاصيل الكاملة.
