// This file executes every time we click on the extension
// API Reference: https://developer.chrome.com/docs/extensions/reference/api/tabs?authuser=3
// Guide: https://developer.chrome.com/docs/extensions/get-started/tutorial/popup-tabs-manager?authuser=3#step-1

/**
  * Fetch transcripts for a video
 * @param {string} channelName Channel name - e.g. "ThePrimeTime"
 * @param {string} videoTitle Video title - e.g. "Haskell researchers Discovers Industry | Prime Reacts"
 * @param {string} videoId Video ID - e.g. "0Wvejkzw5Ac"
 */
function fetchTranscripts(channelName, videoTitle, videoId) {
  fetch('https://merlin-uam-yak3s7dv3a-uw.a.run.app/summarize/youtube', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.youtubesummaries.com/',
      'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjUyNmM2YTg0YWMwNjcwMDVjZTM0Y2VmZjliM2EyZTA4ZTBkZDliY2MiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQWxleCBEdWJibGVyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0k3OFB2QURiUkhuaW5KR1VPajhoZlc1elFOdlk4OEYxaTg4THl1dFJOUkZBPXM5Ni1jIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2ZveWVyLXdvcmsiLCJhdWQiOiJmb3llci13b3JrIiwiYXV0aF90aW1lIjoxNzA0MjgwNzA0LCJ1c2VyX2lkIjoibmp4OVU4YWtCN1Z0ZEVaTGF6QWl4UzBLdkxhMiIsInN1YiI6Im5qeDlVOGFrQjdWdGRFWkxhekFpeFMwS3ZMYTIiLCJpYXQiOjE3MDQyODA3MDQsImV4cCI6MTcwNDI4NDMwNCwiZW1haWwiOiJydWRza29qNjY0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA3Njk1NDAzODA4NDUxNzkyNTg4Il0sImVtYWlsIjpbInJ1ZHNrb2o2NjRAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.OpL3O3SyX8jowvp1qGJiwUQTYJtoyRDhUnj85v5kvgzVGencJ_WI-82ZZDPLL2Q-w1A_SrJd6cCoDVwV1KLmL6QBW5v1RzHGziY8ujTJReC_RNYnSW7xCA_Gwtnx8rYrC7EvMi7p_GoDkhb0CAe0dI6zYYA22ykLj_0HNOebJnx9Mz1FTWifGEsdM-YlAgD8odC2j2RWlNSd15NlEx9O1tVOAwKYTt8jK-ZBD0g2d-7Iy3AJ3zEPlw9tyLmholx949pAb03mScKzfpQmd52O5NizOUjqXpNkYXL0TOWqz7f5uv7Dey1d_E6QkEEphdkCzfSxR9i8D9sotcems9sG6A',
      'Content-Type': 'application/json',
      'Origin': 'https://www.youtubesummaries.com',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'TE': 'trailers',
    },
    body: JSON.stringify({
      "estimatedQueryCost": 5,
      "language": "AUTO",
      "useCache": true,
      "videoId": "0Wvejkzw5Ac",
      "isWhisper": false,
      "videoContext": {
        "channelName": channelName,
        "videoTitle": videoTitle,
        "videoId": videoId,
      },
      "requestFrom": "WEB"
    }),
  });
}

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

/**
  * Mutes or unmutes a tab
 * @param {number} tabId Tab ID
 */
async function muteTab(tabId) {
  //const tab = await chrome.tabs.get(tabId);
  // const muted = !tab.mutedInfo.muted;
  const muted = true;
  await chrome.tabs.update(tabId, { muted });
  // console.log(`Tab ${tab.id} is ${muted ? "muted" : "unmuted"}`);
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
  p.innerText = 'This video doesn\'t have any captions!';
  body.appendChild(p);
}

const WHITELISTED_URLS = [
  // 'www.phind.com',
  // 'phind.com',
  'www.youtube.com',
  'youtube.com',
];


async function main() {
  /** @type {chrome.tabs.Tab} */
  let currentTab = await getCurrentTab();

  /** @type {URL} */
  const currentTabUrl = new URL(currentTab.url);

  /** @type {HTMLBodyElement} */
  const body = document.querySelector('body');

  // Return if we are not in a whitelisted URL
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

    do {
      await sleep(1_000)
    } while (!new URL((await getCurrentTab()).url).searchParams.get('captns'));

    const captions = new URL((await getCurrentTab()).url).searchParams.get('captns') || false;
    if (!captions) return _no_captions(body);


    // Remove cptns from the URL
    currentTab = await getCurrentTab();
    const newUrl = new URL(currentTab.url);
    newUrl.searchParams.delete('captns');
    await chrome.tabs.update(
      currentTab.id,
      { url: newUrl.href },
    );

    // Phind
    const phindTab = await openNewTab(`https://www.phind.com/search?home=true&videoId=${encodeURIComponent(videoId)}&videoTitle=${encodeURIComponent(videoTitle)}&channelName=${encodeURIComponent(channelName)}&captns=${captions}`);

    do {
      await sleep(2_000);
    } while (phindTab.status !== 'complete');

    const p = document.createElement('p');
    p.innerText = 'Click on the extension again! (2 times)';
    body.prepend(p);
  }
}

main();
