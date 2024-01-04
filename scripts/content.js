async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const currentUrl = new URL(window.location.href);
const videoId = decodeURIComponent(currentUrl.searchParams.get('videoId') || '');
const videoTitle = decodeURIComponent(currentUrl.searchParams.get('videoTitle') || '');
const channelName = decodeURIComponent(currentUrl.searchParams.get('channelName') || '');
const captionsUrl = decodeURIComponent(currentUrl.searchParams.get('captns') || '');

// Change current URI to remove the three searchParams
currentUrl.searchParams.delete('videoId');
currentUrl.searchParams.delete('videoTitle');
currentUrl.searchParams.delete('channelName');
currentUrl.searchParams.delete('captns');
window.history.replaceState({}, '', currentUrl.href);

async function main() {
  if (currentUrl.host.includes('youtube')) {
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

    const ytplayer = getVariable('ytplayer');
    const oldUrl = new URL(window.location.href);
    oldUrl.searchParams.set('captns', encodeURIComponent(ytplayer.config.args.raw_player_response.captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl));
    window.history.replaceState({}, '', oldUrl.href);
  }

  else {
    // Phind
    let captions = await fetch(captionsUrl)
      .then(async (r) => await r.text());

    /**
     * @param {string} xmlString XML caption transcript
     * @returns {string} Text of caption without XML tags
     */
    function stripXML(xmlString) {
      return xmlString
        .replace(/<\?xml[^>]*\?>/, '')
        .replace('<transcript>', '')
        .replace('</transcript>', '')
        .split('</text>')
        .map(e => e
          .slice(e.indexOf('>') + 1))
        .join(' ');
    }

    captions = stripXML(captions);

    const queryText = 'I have a YouTube video caption for you. Please, give me a short summary';

    /** @type {HTMLTextAreaElement} */
    const queryTextArea = document.querySelector('textarea.form-control.bg-white.darkmode-light.searchbox-textarea.search-bar-hide-scrollbar.fs-5.px-2.pt-2.pb-0.my-1.mx-0.row');

    /** @type {HTMLButtonElement} */
    const contextRevealButton = document.querySelector('.btn:has(.fe.fe-code.masthead-textbox)');
    contextRevealButton.click();


    await sleep(1_000);

    /** @type {HTMLTextAreaElement} */
    const contextTextArea = document.querySelector('textarea.form-control.bg-white.darkmode-light.searchbox-textarea.fs-5.m-1.p-2.rounded-1');

    queryTextArea.click();
    queryTextArea.focus();
    await sleep(300);
    queryTextArea.value = queryText;

    await sleep(300);
    queryTextArea.click();
    queryTextArea.focus();
    await sleep(300);
    contextTextArea.value = captions.slice(0, 13_000 - queryText.length - 1);


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
