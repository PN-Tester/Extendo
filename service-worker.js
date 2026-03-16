// EXTENDO
// By: PN-Tester

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
          'APIKEY': '', // <----------------------------- PUT YOUR SECURITYTRAILS API KEY HERE
          'Accept': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.subdomains && Array.isArray(data.subdomains)) {
        return data.subdomains.map(sub => `${sub}.${cleanDomain}`);
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
  } catch (_) {
    // timeout or network error — skip to root probe
  }

  // Probe root
  try {
    const rootResp = await fetchWithTimeout(`https://${subdomain}`);
    if (validCodes.includes(rootResp.status)) {
      return { url: `${subdomain}`, status: rootResp.status };
    }
  } catch (_) {
    // unreachable
  }

  return null;
}

// LISTENER

chrome.runtime.onMessage.addListener(async function (request, sender) {
  if (request.action !== 'extendo') return;

  // Default valid codes if none supplied 
  const validCodes = Array.isArray(request.validCodes) && request.validCodes.length > 0
    ? request.validCodes
    : [200, 301, 302];

  try {
    const tabs        = await chrome.tabs.query({ active: true });
    const currentUrl  = tabs[0].url;

    const subdomains  = await checkSubdomains(currentUrl);

    // Check all subdomains concurrently
    const results     = await Promise.all(
      subdomains.map(sub => checkUrl(sub, validCodes))
    );

    const hits = results.filter(r => r !== null);

    //Open a tab for each valid subdomain
    hits.forEach(hit => {
      chrome.tabs.create({ url: `https://${hit.url}` });
    });

    // Notify the popup with result count
    chrome.runtime.sendMessage({ action: 'extendoResult', count: hits.length });

  } catch (err) {
    console.error('Error processing subdomains:', err);
    chrome.runtime.sendMessage({ action: 'extendoResult', count: 0 });
  }
});
