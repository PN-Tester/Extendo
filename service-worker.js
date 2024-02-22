// Function to extract domain from URL
function getDomainFromUrl(url) {
  const currentUrl = new URL(url);
  return currentUrl.hostname;
}

// Function to fetch subdomains from SecurityTrails API
async function checkSubdomains(url) {
  const domain = getDomainFromUrl(url);
  const cleanDomain = domain.replace(/^www\./, ''); // Remove 'www.' if present

  try {
    const response = await fetch(`https://api.securitytrails.com/v1/domain/${cleanDomain}/subdomains?children_only=true&include_inactive=false`, {
      headers: {
        'APIKEY': '', // <----------------- Insert SecurityTrails API key here
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const responseData = await response.json();
      if (responseData.subdomains && Array.isArray(responseData.subdomains)) {
        const subdomainArray = responseData.subdomains.map(subdomain => `${subdomain}.${cleanDomain}`);
        return subdomainArray;
      } else {
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching subdomains:', error);
    return [];
  }
}

// Function to check if URL is valid
async function checkUrl(url) {
  try {
    const robotsTxtResponse = await fetch(`https://${url}/robots.txt`, { redirect: 'follow' });
    if (robotsTxtResponse.ok) {
      return `${url}/robots.txt`;
    } else {
      const response = await fetch(`https://${url}`, { redirect: 'follow' });
      if (response.ok) {
        return `${url}`;
      }
    }
  } catch (error) {
    console.error(`Error checking URL ${url}: ${error}`);
  }
  return null;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  if (request.action === 'extendo') {
    // Open a new tab when the button is clicked
    const tabs = await chrome.tabs.query({ active: true });
    const currentUrl = tabs[0].url;
    
    try {
      const subdomainArray = await checkSubdomains(currentUrl);
      const validSubdomains = await Promise.all(subdomainArray.map(subdomain => checkUrl(subdomain)));

      const non404Subdomains = validSubdomains.filter(subdomain => subdomain !== null);
      non404Subdomains.forEach(subdomain => {
        chrome.tabs.create({ url: `https://${subdomain}` });
      });
    } catch (error) {
      console.error('Error processing subdomains:', error);
    }
  }
});
