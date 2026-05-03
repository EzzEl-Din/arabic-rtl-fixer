// popup.js - Arabic RTL Fixer

function sendMsg(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action });
  });
}

function getTab(cb) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => cb(tabs[0]));
}

// ── تحميل الحالة ──────────────────────────────────────────────
getTab(tab => {
  const host = new URL(tab.url).hostname;
  document.getElementById('siteName').textContent = host;

  chrome.storage.sync.get(['enabled', 'disabledSites'], data => {
    const globalOn = data.enabled !== false;
    const disabled = data.disabledSites || [];
    const siteOn = !disabled.includes(host);

    document.getElementById('globalToggle').checked = globalOn;
    document.getElementById('siteToggle').checked = siteOn;
    updateUI(globalOn && siteOn);
  });
});

function updateUI(isActive) {
  const badge = document.getElementById('statusBadge');
  const dot = document.getElementById('siteDot');
  badge.textContent = isActive ? 'نشط' : 'معطّل';
  badge.style.color = isActive ? '#e2b35a' : '#666';
  badge.style.borderColor = isActive ? '#e2b35a55' : '#333';
  if (isActive) dot.classList.remove('off');
  else dot.classList.add('off');
}

// ── Global toggle ──────────────────────────────────────────────
document.getElementById('globalToggle').addEventListener('change', e => {
  const on = e.target.checked;
  chrome.storage.sync.set({ enabled: on });
  sendMsg(on ? 'fix' : 'reset');

  const siteOn = document.getElementById('siteToggle').checked;
  updateUI(on && siteOn);
});

// ── Per-site toggle ────────────────────────────────────────────
document.getElementById('siteToggle').addEventListener('change', e => {
  const on = e.target.checked;
  sendMsg(on ? 'enableSite' : 'disableSite');

  const globalOn = document.getElementById('globalToggle').checked;
  updateUI(globalOn && on);
});

// ── Buttons ────────────────────────────────────────────────────
document.getElementById('fixBtn').addEventListener('click', () => sendMsg('fix'));
document.getElementById('resetBtn').addEventListener('click', () => sendMsg('reset'));
