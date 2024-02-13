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
    await sleep(300);
    form.focus();
    await sleep(300);
    form.submit();
  }
}

main();
