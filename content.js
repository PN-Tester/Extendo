// content.js

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.data) {
    // Display the data in an alert box
    alert(request.data);
  }
});
