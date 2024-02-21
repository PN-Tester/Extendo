function getDomainFromUrl(url) {
  const currentUrl = new URL(url);
  return currentUrl.hostname;
}



function CheckSubdomains(url) {
  return new Promise((resolve, reject) => {
    const domain = getDomainFromUrl(url);
    const cleanDomain = domain.replace(/^www\./, ''); // Remove 'www.' if it's present

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.securitytrails.com/v1/domain/" + cleanDomain + "/subdomains?children_only=true&include_inactive=false");
    xhr.setRequestHeader("APIKEY", ""); // <-----------------------INSERT SECURITYTRAILS API KEY HERE
    xhr.setRequestHeader("accept", "application/json");

    xhr.onload = function() {
      if (xhr.status === 200) {
        const responseData = JSON.parse(xhr.responseText);
        if (responseData.subdomains && Array.isArray(responseData.subdomains)) {
          const subdomainArray = responseData.subdomains.map(subdomain => `${subdomain}.${cleanDomain}`);
          resolve(subdomainArray);
        } else {
          resolve([]);
        }
      } else {
        resolve([]);
      }
    };
    xhr.send();
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'extendo') {
    // Open a new tab when the button is clicked
    chrome.tabs.query({ active: true }, function(tabs) {
      const currentUrl = tabs[0].url;
      CheckSubdomains(currentUrl).then(subdomainArray => {
        // Create a function to check if a URL is valid to open
        async function checkUrl(url) {
  			try {
    			// First, try to fetch the /robots.txt file for the subdomain
    			const robotsTxtResponse = await fetch(`https://${url}/robots.txt`, { redirect: 'follow' });

    			// If the /robots.txt fetch is successful (200 status), return this URL
    			if (robotsTxtResponse.status === 200) {
      				return `${url}/robots.txt`; // Successfully found /robots.txt
    			}
    			else {
      				// If /robots.txt is not found or not accessible, check the main URL
      				const response = await fetch(`https://${url}`, { redirect: 'follow' }); // 'follow' to automatically follow redirects

      				// Check if the response is successful or a redirect that might eventually lead to a successful response
      				if (![404, 401, 403, 400, 500, 502, 503, 501].includes(response.status)) {
        				// Directly return the URL if the fetch was successful or ended in a redirect
        				// This includes handling the initial redirects automatically
        				return `${url}`;
      				}
    			}
  			} catch (error) {
    			console.error(`Error checking URL ${url}: ${error}`);
  			}
  		return null; // Return null if both /robots.txt and the main URL checks fail
		}


        // Use Promise.all to check all URLs in parallel
        Promise.all(subdomainArray.map(subdomain => checkUrl(subdomain)))
          .then(validSubdomains => {
            // Filter out null values (invalid responses)
            const non404Subdomains = validSubdomains.filter(subdomain => subdomain !== null);

            // Open tabs for the subdomains that are valid to open
            non404Subdomains.forEach(subdomain => {
              chrome.tabs.create({ url: `https://${subdomain}` });
            });
          });
      });
    });
  }
});





