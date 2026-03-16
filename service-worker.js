// EXTENDO
// By : PN-Tester

// Helpers

function getDomainFromUrl(url) {
  const parsed = new URL(url);
  return parsed.hostname;
}

// Fetch active subdomains via SecurityTrails API
async function checkSubdomains(url) {
  const domain = getDomainFromUrl(url);
  const cleanDomain = domain.replace(/^www\./, '');

  try {
    const response = await fetch(
      `https://api.securitytrails.com/v1/domain/${cleanDomain}/subdomains?children_only=true&include_inactive=false`,
      {
        headers: {
          'APIKEY': '', // <-------------- YOUR API KEY GOES HERE
          'Accept': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.subdomains && Array.isArray(data.subdomains)) {
        const unique = [...new Set(data.subdomains.map(sub => sub.toLowerCase()))];
        return unique.map(sub => `${sub}.${cleanDomain}`);
      }
    }
  } catch (err) {
    console.error('Error fetching subdomains:', err);
  }
  return [];
}

async function checkUrl(subdomain, validCodes) {
  const TIMEOUT_MS = 6000;

  const fetchWithTimeout = (url) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
    );
    return Promise.race([fetch(url, { redirect: 'follow' }), timeout]);
  };

  // Probe /robots.txt first
  try {
    const robotsResp = await fetchWithTimeout(`https://${subdomain}/robots.txt`);
    if (validCodes.includes(robotsResp.status)) {
      return { url: `${subdomain}/robots.txt`, status: robotsResp.status };
    }
  } catch (_) {}

  // Probe root
  try {
    const rootResp = await fetchWithTimeout(`https://${subdomain}`);
    if (validCodes.includes(rootResp.status)) {
      return { url: `${subdomain}`, status: rootResp.status };
    }
  } catch (_) {}

  return null;
}

// Listener

chrome.runtime.onMessage.addListener(async function (request, sender) {

  // LAUNCH - enumerate subdomains and return hits to popup
  if (request.action === 'extendo') {
    const validCodes = Array.isArray(request.validCodes) && request.validCodes.length > 0
      ? request.validCodes
      : [200, 301, 302];

    try {
      const tabs       = await chrome.tabs.query({ active: true });
      const currentUrl = tabs[0].url;
      const subdomains = await checkSubdomains(currentUrl);

      const results = await Promise.all(
        subdomains.map(sub => checkUrl(sub, validCodes))
      );

      const hits = results.filter(r => r !== null);

      // Deduplicate by host
      const seenHosts = new Set();
      const uniqueHits = hits.filter(hit => {
        const host = hit.url.replace(/\/robots\.txt$/, '').toLowerCase();
        if (seenHosts.has(host)) return false;
        seenHosts.add(host);
        return true;
      });

      // Send hits back to popup — do NOT open tabs here anymore
      chrome.runtime.sendMessage({ action: 'extendoResult', hits: uniqueHits });

    } catch (err) {
      console.error('Error processing subdomains:', err);
      chrome.runtime.sendMessage({ action: 'extendoResult', hits: [] });
    }
  }

  // OPEN TABS - Use only user selected ones here
  if (request.action === 'openTabs') {
    const urls = Array.isArray(request.urls) ? request.urls : [];
    urls.forEach(url => {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      chrome.tabs.create({ url: fullUrl });
    });
  }
});
