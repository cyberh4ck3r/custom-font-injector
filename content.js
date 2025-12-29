let currentFont = null;
let enabled = true;

chrome.storage.sync.get(['selectedFont', 'enabled'], (data) => {
  currentFont = data.selectedFont;
  enabled = data.enabled !== false;
  
  if (enabled && currentFont) {
    injectFont(currentFont);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateFont') {
    currentFont = message.font;
    enabled = message.enabled;
    
    if (enabled && currentFont) {
      injectFont(currentFont);
    } else {
      removeFont();
    }
  }
});

function injectFont(fontName) {
  removeFont();
  
  if (!fontName) return;
  
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
  const link = document.createElement('link');
  link.id = 'custom-font-injector-link';
  link.href = fontUrl;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  
  const style = document.createElement('style');
  style.id = 'custom-font-injector-style';
  style.textContent = `
    * {
      font-family: '${fontName}', sans-serif !important;
    }
    code, pre, kbd, samp, tt, var {
      font-family: '${fontName}', monospace !important;
    }
  `;
  document.head.appendChild(style);
}

function removeFont() {
  const link = document.getElementById('custom-font-injector-link');
  const style = document.getElementById('custom-font-injector-style');
  
  if (link) link.remove();
  if (style) style.remove();
}
