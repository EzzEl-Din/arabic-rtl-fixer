# Privacy Policy — Arabic RTL Fixer

**Last updated: May 2026**

---

## ما الذي يفعله هذا الامتداد / What This Extension Does

Arabic RTL Fixer is a Chrome browser extension that automatically detects Arabic text on webpages and fixes its display direction to ensure proper right-to-left (RTL) rendering alongside English (LTR) content.

---

## البيانات التي نجمعها / Data We Collect

**لا نجمع أي بيانات. على الإطلاق.**

We collect **absolutely no data**. Specifically:

- ❌ No personal information
- ❌ No browsing history
- ❌ No page content
- ❌ No keystrokes or input data
- ❌ No usage statistics
- ❌ No crash reports sent externally

---

## كيف يعمل الامتداد / How It Works Locally

All processing happens **entirely within your browser**:

1. The extension reads visible text on the current page
2. Detects Arabic characters using Unicode ranges
3. Applies CSS direction properties directly to DOM elements
4. No data ever leaves your device

The only data stored is your **on/off preference**, saved locally via `chrome.storage.sync` (synced across your own Chrome profile — never shared with us).

---

## الأذونات المطلوبة / Permissions Explained

| Permission | Why We Need It |
|---|---|
| `activeTab` | To read and modify text direction on the current page |
| `storage` | To save your on/off preference locally |
| `<all_urls>` | To work on any website that has Arabic text |

---

## مشاركة البيانات / Data Sharing

We do not share, sell, transfer, or disclose any information to third parties — because we don't collect any information in the first place.

---

## المصدر المفتوح / Open Source

This extension is fully open source. You can inspect every line of code at:  
👉 **https://github.com/[your-username]/arabic-rtl-fixer**

---

## التواصل / Contact

If you have any questions about this privacy policy, open a GitHub issue or contact us via the Chrome Web Store listing.
