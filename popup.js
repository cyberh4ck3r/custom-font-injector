const customFont = document.getElementById('customFont');
const addCustomBtn = document.getElementById('addCustom');
const enableCheckbox = document.getElementById('enableInjector');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');
const previewText = document.getElementById('previewText');

chrome.storage.sync.get(['selectedFont', 'enabled'], (data) => {
  if (data.selectedFont) {
    customFont.value = data.selectedFont;
    updatePreview(data.selectedFont);
  }
  enableCheckbox.checked = data.enabled !== false;
});

customFont.addEventListener('input', () => {
  const fontName = customFont.value.trim();
  if (fontName) {
    updatePreview(fontName);
  } else {
    previewText.style.fontFamily = '';
  }
});

function updatePreview(fontName) {
  if (fontName) {
    loadGoogleFont(fontName);
    previewText.style.fontFamily = `'${fontName}', sans-serif`;
  } else {
    previewText.style.fontFamily = '';
  }
}

function loadGoogleFont(fontName) {
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
  
  const existingLink = document.querySelector(`link[href*="${fontName.replace(/ /g, '+')}"]`);
  if (existingLink) return;
  
  const link = document.createElement('link');
  link.href = fontUrl;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

addCustomBtn.addEventListener('click', () => {
  const customFontName = customFont.value.trim();
  if (customFontName) {
    updatePreview(customFontName);
    showStatus('✓ Font loaded!');
  }
});

saveBtn.addEventListener('click', () => {
  const selectedFont = customFont.value.trim();
  const enabled = enableCheckbox.checked;
  
  chrome.storage.sync.set({
    selectedFont: selectedFont,
    enabled: enabled
  }, () => {
    showStatus('✓ Saved! Reload page to see changes.');
    
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateFont',
          font: selectedFont,
          enabled: enabled
        }).catch(() => {});
      });
    });
  });
});

function showStatus(message) {
  status.textContent = message;
  status.style.opacity = '1';
  setTimeout(() => {
    status.style.opacity = '0';
    setTimeout(() => {
      status.textContent = '';
    }, 300);
  }, 2500);
}
