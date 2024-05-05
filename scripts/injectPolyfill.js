let polyfillScript = document.createElement('script');
polyfillScript.src = await chrome.runtime.getURL('scripts/polyfill.min.js');
polyfillScript.onload = () => {
  console.log('Polyfill loaded');
};
(document.head || document.documentElement).append(polyfillScript);
