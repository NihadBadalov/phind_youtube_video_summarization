// This file executes every time we click on the extension
// API Reference: https://developer.chrome.com/docs/extensions/reference/api/tabs?authuser=3
// Guide: https://developer.chrome.com/docs/extensions/get-started/tutorial/popup-tabs-manager?authuser=3#step-1

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
  * Returns the current active tab
 * @returns {Promise<chrome.tabs.Tab | undefined>} Current active tab
 */
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function DOMtoString(selector) {
  if (selector) {
    selector = document.querySelector(selector);
    if (!selector) return "ERROR: querySelector failed to find node"
  } else {
    selector = document.documentElement;
  }
  return selector.outerHTML;
}

/**
  * @param {string} querySelector Query selector for DOM element
  * @param {number} tabId Active tab ID
  * @param {function} callback
  * @returns {Promise<any>}
  */
async function chromeTabQuery(querySelector, tabId, callback) {
  return chrome.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
    return chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: callback,
      args: [querySelector],
    });
  }).then(function(results) {
    return results;
  }).catch(function(error) {
    return 'There was an error injecting script : \n' + error.message;
  });
}

/**
 * @param {string} querySelector Query selector for DOM element
 * @param {number} tabId Active tab ID
 */
async function fetchDOMtoString(querySelector, tabId) {
  return chrome.tabs.query({ active: true, currentWindow: true }).then(function(_tabs) {
    return chrome.scripting.executeScript({
      target: { tabId: tabId },
      // injectImmediately: true,  // uncomment this to make it execute straight away, other wise it will wait for document_idle
      func: DOMtoString,
      args: [querySelector]  // you can use this to target what element to get the html for
    });
  }).then(function(results) {
    return results;
  }).catch(function(error) {
    return 'There was an error injecting script : \n' + error.message;
  });
}

/**
 * @param {string} url URL to open
 * @returns {Promise<chrome.tabs.Tab>} The created tab
 */
async function openNewTab(url) {
  return chrome.tabs.create({
    url
  });
}

/**
 * @param {HTMLBodyElement} body
 */
function _error(body) {
  const p = document.createElement('p');
  p.innerText = 'An unexpected error occurred';
  body.appendChild(p);
}

/**
 * @param {HTMLBodyElement} body
 */
function _no_captions(body) {
  const p = document.createElement('p');
  p.innerText = 'Try one more time, please.\nIf that one is also unsuccessful, then the video has no captions';
  body.appendChild(p);
}

const WHITELISTED_URLS = [
  'www.youtube.com',
  'youtube.com',
];

const IGNORED_URLS = [
  'www.phind.com',
  'phind.com',
];


async function main() {
  /** @type {chrome.tabs.Tab} */
  let currentTab = await getCurrentTab();

  /** @type {URL} */
  const currentTabUrl = new URL(currentTab.url);

  /** @type {HTMLBodyElement} */
  const body = document.querySelector('body');

  // Return if we are not in a whitelisted URL
  if (IGNORED_URLS.includes(currentTabUrl.host)) {
    return;
  }

  if (!currentTab || !WHITELISTED_URLS.includes(currentTabUrl.host)) {
    const p = document.createElement('p');
    p.id = 'pageNotInWhitelist';
    p.innerText = 'Sorry! This extension works only on YouTube.com';
    body.prepend(p);
    return;
  }

  if (currentTabUrl.host.includes('youtube')) {
    /** @type {string | Array<{ result: string }>} */
    const titleFetchData = await fetchDOMtoString('#title > h1 > .style-scope', currentTab.id);
    const videoTitle = titleFetchData[0] === 'T'
      ? null
      : titleFetchData[0].result.match(new RegExp(/\<yt-formatted-string .+\>(.+)\<\/yt-formatted-string\>/))[1];
    if (!videoTitle) return _error(body);


    const videoId = currentTabUrl.searchParams.get('v');
    if (!videoId) return _error(body);

    const channelNameFetchData = await fetchDOMtoString('#channel-name > #container > #text-container > #text > a', currentTab.id);
    const channelName = channelNameFetchData[0] === 'T'
      ? null
      : channelNameFetchData[0].result.match(new RegExp(/\<a .+>(.+)\<\/a\>/))[1];
    if (!channelName) return _error(body);

    // Captions
    let activeTab = await getCurrentTab();
    const { name: browserName } = await chrome.runtime.getBrowserInfo()
    const ytplayer = await getPageVar('ytplayer', activeTab?.id, browserName);
    const captions = ytplayer?.config?.args?.raw_player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks[0]?.baseUrl;

    if (!ytplayer || (!captions && browserName !== 'Firefox')) return _no_captions(body);

    // Phind
    const phindTab = await openNewTab(`https://www.phind.com/search?home=true&videoId=${encodeURIComponent(videoId)}&videoTitle=${encodeURIComponent(videoTitle)}&channelName=${encodeURIComponent(channelName)}&captns=${encodeURIComponent(captions ?? ytplayer)}`);
  }
}

main();

async function getPageVar(name, tabId, browserName) {
  if (browserName === 'Firefox') {
    return new Promise((res) => {
      chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { text: "ytplayer" }, function(response) {
          res(response?.message);
        });
      });
    });

  } else {
    const [{ result }] = await chrome.scripting.executeScript({
      func: name => window[name],
      args: [name],
      target: {
        tabId: tabId ??
          (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id
      },
      world: 'MAIN',
    });
    return result;
  }
}
