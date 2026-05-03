// ============================================================
// Arabic RTL Fixer - Content Script v1.2.0
// BiDi Parser — يلف كل run إنجليزي في <bdi> عشان يتعزل صح
// ============================================================

const ARABIC_RE   = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const LTR_WORD_RE = /[A-Za-z0-9\u00C0-\u024F][\w\u00C0-\u024F\-\']*/g;

const SKIP_TAGS = new Set([
  'SCRIPT','STYLE','META','LINK','HEAD',
  'NOSCRIPT','TEMPLATE','CODE','PRE','BDI','BDO'
]);

const HOST = location.hostname;
let enabled = true;

// ── إعدادات ─────────────────────────────────────────────────
chrome.storage.sync.get(['enabled', 'disabledSites'], (data) => {
  enabled = data.enabled !== false;
  const disabled = data.disabledSites || [];
  if (disabled.includes(HOST)) enabled = false;
  if (enabled) fixPage();
});

// ── 1. BiDi Tokenizer ────────────────────────────────────────
// يقسّم النص لـ tokens: arabic | ltr | neutral
function tokenize(text) {
  const tokens = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    // Arabic run
    if (ARABIC_RE.test(ch)) {
      let j = i + 1;
      while (j < text.length && (ARABIC_RE.test(text[j]) || /[\s\u060C\u061B\u061F،؟]/.test(text[j]))) j++;
      tokens.push({ type: 'arabic', text: text.slice(i, j) });
      i = j;
      continue;
    }

    // LTR run (English words, numbers, URLs)
    if (/[A-Za-z0-9]/.test(ch)) {
      let j = i + 1;
      while (j < text.length && /[A-Za-z0-9\.\-\_\/\:\#\@\%\+\=\?\&\~]/.test(text[j])) j++;
      tokens.push({ type: 'ltr', text: text.slice(i, j) });
      i = j;
      continue;
    }

    // Neutral (spaces, punctuation)
    let j = i + 1;
    while (j < text.length && !ARABIC_RE.test(text[j]) && !/[A-Za-z0-9]/.test(text[j])) j++;
    tokens.push({ type: 'neutral', text: text.slice(i, j) });
    i = j;
  }

  return tokens;
}

// ── 2. BiDi Renderer ─────────────────────────────────────────
// يحوّل الـ tokens لـ DOM nodes بـ <bdi> للـ LTR
function renderTokens(tokens, isRTL) {
  const frag = document.createDocumentFragment();

  tokens.forEach(tok => {
    if (tok.type === 'ltr' && isRTL) {
      // كلمة إنجليزي في سياق عربي → عزّلها
      const bdi = document.createElement('bdi');
      bdi.setAttribute('dir', 'ltr');
      bdi.style.unicodeBidi = 'isolate';
      bdi.style.display = 'inline';
      bdi.textContent = tok.text;
      frag.appendChild(bdi);
    } else {
      frag.appendChild(document.createTextNode(tok.text));
    }
  });

  return frag;
}

// ── 3. إصلاح Text Node واحد ──────────────────────────────────
function fixTextNode(textNode, parentDir) {
  const text = textNode.textContent;
  if (!text.trim()) return;
  if (!ARABIC_RE.test(text)) return;
  if (!/[A-Za-z0-9]/.test(text)) return; // مفيش إنجليزي → مش محتاج parser

  const tokens = tokenize(text);
  const hasLTR = tokens.some(t => t.type === 'ltr');
  if (!hasLTR) return; // pure arabic, no bdi needed

  const frag = renderTokens(tokens, true);
  textNode.parentNode.replaceChild(frag, textNode);
}

// ── Layout Container Guard ───────────────────────────────────
// chat bubbles وكل عناصر الـ layout المفروض متتغيرش
function isLayoutContainer(el) {
  const style = window.getComputedStyle(el);
  if (Array.from(el.children).length > 3) return true;
  if (['flex','grid','inline-flex','inline-grid'].includes(style.display)) return true;
  const pl = parseFloat(style.paddingLeft);
  const pr = parseFloat(style.paddingRight);
  if (pl > 20 && pr > 20 && el.offsetWidth > 200) return true;
  return false;
}

// ── 4. إصلاح Element ─────────────────────────────────────────
function fixElement(el) {
  if (!el || !el.tagName) return;
  if (SKIP_TAGS.has(el.tagName)) return;
  if (el.dataset.rtlFixed) return;
  if (el.closest('code, pre, script, style')) return;

  // layout container → بس نصلح النص جوّاه مش نغير اتجاهه
  if (isLayoutContainer(el)) {
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && ARABIC_RE.test(node.textContent))
        fixTextNode(node, 'rtl');
    });
    return;
  }

  const text = el.innerText || el.textContent || '';
  if (!ARABIC_RE.test(text)) return;

  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars  = text.replace(/\s/g, '').length;
  const isRTL       = totalChars > 0 && arabicChars / totalChars > 0.3;

  if (isRTL) {
    el.setAttribute('dir', 'rtl');
    el.style.direction = 'rtl';
    if (!el.style.textAlign) el.style.textAlign = 'right';
  } else {
    el.setAttribute('dir', 'auto');
    el.style.unicodeBidi = 'plaintext';
  }

  // شغّل الـ BiDi parser على كل text nodes مباشرة
  const childNodes = Array.from(el.childNodes);
  childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      fixTextNode(node, isRTL ? 'rtl' : 'ltr');
    }
  });

  el.dataset.rtlFixed = '1';
}

// ── 5. إصلاح الـ Inputs ──────────────────────────────────────
function fixInputs() {
  document.querySelectorAll('input[type="text"], input:not([type]), textarea').forEach(input => {
    if (input.dataset.rtlBound) return;
    input.dataset.rtlBound = '1';

    const update = () => {
      const isArabic = ARABIC_RE.test(input.value);
      input.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
      input.style.direction = isArabic ? 'rtl' : 'ltr';
      input.style.textAlign = isArabic ? 'right' : 'left';
    };

    input.addEventListener('input', update);
    update();
  });
}

// ── 6. إصلاح كل الصفحة ───────────────────────────────────────
function fixPage() {
  if (!enabled) return;

  document.querySelectorAll(
    'p, h1, h2, h3, h4, h5, h6, li, td, th, span, div, label, a, blockquote, article, section'
  ).forEach(el => {
    // شغّل بس على العناصر اللي فيها text مباشر
    const hasDirectText = Array.from(el.childNodes)
      .some(n => n.nodeType === Node.TEXT_NODE && ARABIC_RE.test(n.textContent));
    if (hasDirectText) fixElement(el);
  });

  fixInputs();
}

// ── 7. Reset ─────────────────────────────────────────────────
function resetPage() {
  document.querySelectorAll('[data-rtl-fixed]').forEach(el => {
    el.removeAttribute('dir');
    el.style.direction = '';
    el.style.textAlign = '';
    el.style.unicodeBidi = '';
    delete el.dataset.rtlFixed;
    // إزالة الـ <bdi> اللي اتضافت
    el.querySelectorAll('bdi[dir="ltr"]').forEach(bdi => {
      bdi.replaceWith(document.createTextNode(bdi.textContent));
    });
  });
  document.querySelectorAll('[data-rtl-bound]').forEach(el => {
    delete el.dataset.rtlBound;
  });
}

// ── 8. Keyboard Shortcut: Alt+R ──────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'r') {
    enabled = !enabled;
    enabled ? fixPage() : resetPage();
    showToast(enabled ? '✅ RTL Fixer: تفعيل' : '⏸️ RTL Fixer: إيقاف');
  }
});

// ── 9. MutationObserver + Debounce ──────────────────────────
// بدل ما نصلح كل حرف بيتضاف (streaming)، نستنى 300ms وبعدين نصلح مرة واحدة
let debounceTimer = null;
const pendingNodes = new Set();

const observer = new MutationObserver(mutations => {
  if (!enabled) return;

  mutations.forEach(mut => {
    mut.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        pendingNodes.add(node);
      }
    });
  });

  // debounce — استنى 300ms من آخر تغيير
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pendingNodes.forEach(node => {
      fixElement(node);
      node.querySelectorAll?.('p,h1,h2,h3,h4,h5,h6,li,td,span,div,label,a')
        .forEach(fixElement);
    });
    pendingNodes.clear();
  }, 300);
});

observer.observe(document.body, { childList: true, subtree: true });

// ── 10. Right-click ──────────────────────────────────────────
let lastRightClicked = null;
document.addEventListener('contextmenu', e => { lastRightClicked = e.target; });

// ── 11. Toast ────────────────────────────────────────────────
function showToast(msg) {
  document.getElementById('rtl-fixer-toast')?.remove();
  const t = document.createElement('div');
  t.id = 'rtl-fixer-toast';
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
    background:'#1a1a2e', color:'#e2b35a', border:'1px solid #e2b35a',
    padding:'10px 20px', borderRadius:'8px', fontFamily:'sans-serif',
    fontSize:'14px', zIndex:'999999', direction:'rtl',
    boxShadow:'0 4px 20px rgba(0,0,0,0.4)', transition:'opacity 0.3s'
  });
  document.body.appendChild(t);
  setTimeout(() => t.style.opacity = '0', 1800);
  setTimeout(() => t.remove(), 2100);
}

// ── 12. Messages من الـ Popup ─────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'fix')   { enabled = true; fixPage(); }
  if (msg.action === 'reset') { resetPage(); }

  if (msg.action === 'flipElement' && lastRightClicked) {
    const el = lastRightClicked;
    const cur = el.getAttribute('dir');
    el.setAttribute('dir', cur === 'rtl' ? 'ltr' : 'rtl');
    showToast('🔄 تم قلب الاتجاه');
  }

  if (msg.action === 'disableSite') {
    chrome.storage.sync.get('disabledSites', d => {
      const list = d.disabledSites || [];
      if (!list.includes(HOST)) list.push(HOST);
      chrome.storage.sync.set({ disabledSites: list });
    });
    enabled = false; resetPage();
    showToast('⏸️ معطّل على ' + HOST);
  }

  if (msg.action === 'enableSite') {
    chrome.storage.sync.get('disabledSites', d => {
      const list = (d.disabledSites || []).filter(s => s !== HOST);
      chrome.storage.sync.set({ disabledSites: list });
    });
    enabled = true; fixPage();
    showToast('✅ مفعّل على ' + HOST);
  }
});
