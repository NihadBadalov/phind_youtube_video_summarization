async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Change current URI to remove the three searchParams
async function main() {
  try {
    if (!new URL(window.location.href).host.includes('phind')) return;
  } catch (e) { return; }

  // Phind
  const currentUrl = new URL(window.location.href);
  const captionsUrl = decodeURIComponent(currentUrl.searchParams.get('captns') || '');
  window.history.replaceState({}, '', currentUrl.href);

  // Captions
  if (captionsUrl) {
    const queryText = 'I have a YouTube video caption for you. Please, give me a short summary. Here are the captions: ';

    /** @type {HTMLTextAreaElement} */
    const queryTextArea = document.querySelector('textarea.form-control.bg-white.darkmode-light.searchbox-textarea.search-bar-hide-scrollbar.fs-5.px-2.pt-2.pb-0.my-1.mx-0.row');
    await sleep(500);

    queryTextArea.click();
    queryTextArea.focus();
    await sleep(500);
    queryTextArea.value = queryText + captionsUrl;

    await sleep(500);
    queryTextArea.click();
    queryTextArea.focus();


    /** @type {HTMLFormElement} */
    const form = document.querySelector('form.mb-3');

    await sleep(500);
    form.click()
    await sleep(500);
    form.focus();
    await sleep(1_000);
    form.submit();
  }
}

async function initializeLatex() {
  // LaTeX rendering
  try {
    if (!new URL(window.location.href).host.includes('phind')) return;
  } catch (e) { return; }

  console.log('Latex initializer called');

  (async () => {
    // Polyfill
    const script = document.createElement('script');
    script.src = await chrome.runtime.getURL('scripts/injectPolyfill.js');
    script.onload = () => {
      console.log('POLYFILL LOADED');
    };
    (document.head || document.documentElement)?.appendChild(script);
  })();

  (async () => {
    // LaTeX
    const script = document.createElement('script');
    script.src = await chrome.runtime.getURL('scripts/injectLatex.js');
    script.onload = () => {
      console.log('LATEX LOADED');
    };
    (document.head || document.documentElement)?.appendChild(script);
  })();
}

function addDocumentContentButton() {
  (async () => {
    const script = document.createElement('script');
    script.src = await chrome.runtime.getURL('scripts/addDocumentContents.js');
    script.onload = () => {
      console.log('ANALYZE DOCUMENT BUTTON ADDED');
    };
    (document.head || document.documentElement)?.appendChild(script);
  })();
}


// initializeLatex();
main();

if (new URL(window.location.href)?.pathname === '/search') {
  addDocumentContentButton();
}

function getVariable(v) {
  var c = document.createElement("div");
  c.id = 'var-data';
  c.style.display = 'none';
  document.body.appendChild(c);
  var s = document.createElement('script');
  s.innerHTML = 'document.getElementById("var-data").innerText=JSON.stringify(' + v + ');';
  document.head.appendChild(s);
  var data = JSON.parse(c.innerText);
  c.remove();
  s.remove();
  return data;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.text === "ytplayer") {
    const ytplayer = getVariable('ytplayer');
    if (!ytplayer) return sendResponse({ message: undefined });
    sendResponse({ message: ytplayer?.config?.args?.raw_player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks[0]?.baseUrl });
  }
});
