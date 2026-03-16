document.addEventListener('DOMContentLoaded', function () {
  const textSpan    = document.getElementById("text");
  const spinner     = document.getElementById("spinner");
  const dots        = document.getElementById("dotsContainer");
  const statusText  = document.getElementById("statusText");

  // GitHub link on title click
  document.querySelector(".extendo-title").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url: "https://github.com/PN-Tester/Extendo" });
    });
  });

  // GitHub link on footer SRC
  const footerGh = document.getElementById("footerGh");
  if (footerGh) {
    footerGh.addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: "https://github.com/PN-Tester/Extendo" });
      });
    });
  }

  // LAUNCH button
  document.getElementById('extendo').addEventListener('click', function () {
    // Collect selected response codes
    const checkedBoxes = document.querySelectorAll('.codes-grid input[type="checkbox"]:checked');
    const selectedCodes = Array.from(checkedBoxes).map(cb => parseInt(cb.value, 10));

    if (selectedCodes.length === 0) {
      statusText.textContent = "NO CODES SELECTED";
      statusText.style.color = "#f34f14";
      return;
    }

    // Send message to service worker with selected codes
    chrome.runtime.sendMessage({ action: 'extendo', validCodes: selectedCodes });

    // Update UI to loading state
    textSpan.classList.add("hidden");
    spinner.classList.remove("hidden");
    dots.classList.add("hidden");
    statusText.textContent = "ENUMERATING...";
    statusText.style.color = "";
  });

  // Listen for result messages from service worker
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === 'extendoResult') {
      const count = message.count || 0;
      textSpan.classList.remove("hidden");
      spinner.classList.add("hidden");
      dots.classList.remove("hidden");
      statusText.textContent = count > 0
        ? `${count} TARGET${count !== 1 ? 'S' : ''} OPENED`
        : "NO TARGETS FOUND";
    }
  });
});
