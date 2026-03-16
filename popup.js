document.addEventListener('DOMContentLoaded', function () {
  const textSpan      = document.getElementById("text");
  const spinner       = document.getElementById("spinner");
  const dots          = document.getElementById("dotsContainer");
  const statusText    = document.getElementById("statusText");
  const resultsPanel  = document.getElementById("resultsPanel");
  const resultsList   = document.getElementById("resultsList");
  const resultsCount  = document.getElementById("resultsCount");
  const selectedCount = document.getElementById("selectedCount");
  const openBtn       = document.getElementById("openBtn");
  const selectAll     = document.getElementById("selectAll");
  const selectNone    = document.getElementById("selectNone");

  // Github link in header
  document.querySelector(".extendo-title").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url: "https://github.com/PN-Tester/Extendo" });
    });
  });

  //Github link in footer
  const footerGh = document.getElementById("footerGh");
  if (footerGh) {
    footerGh.addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: "https://github.com/PN-Tester/Extendo" });
      });
    });
  }

  //Helper Update selected count
  function refreshSelectedCount() {
    const checked = resultsList.querySelectorAll('input[type="checkbox"]:checked');
    const n = checked.length;
    selectedCount.textContent = n + ' SELECTED';
    openBtn.disabled = n === 0;
  }

  //Helper for status badge class
  function badgeClass(status) {
    if (status >= 500) return 's500';
    if (status === 404) return 's404';
    if (status === 403) return 's403';
    if (status === 401) return 's401';
    if (status === 302) return 's302';
    if (status === 301) return 's301';
    return 's200';
  }

  //Build results list
  function buildResultsList(hits) {
    resultsList.innerHTML = '';

    if (!hits || hits.length === 0) {
      resultsList.innerHTML = '<div class="no-results">NO TARGETS FOUND</div>';
      resultsCount.textContent = '0 FOUND';
      openBtn.disabled = true;
      return;
    }

    resultsCount.textContent = hits.length + ' FOUND';

    hits.forEach(function(hit, i) {
      var row = document.createElement('label');
      row.className = 'result-row';
      row.style.animationDelay = (i * 45) + 'ms';

      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'result-check';
      cb.value = hit.url;
      cb.checked = true;
      cb.addEventListener('change', refreshSelectedCount);

      var domain = document.createElement('span');
      domain.className = 'result-domain';
      domain.textContent = hit.url.replace(/\/robots\.txt$/, '');
      domain.title = hit.url;

      var badge = document.createElement('span');
      badge.className = 'result-badge ' + badgeClass(hit.status);
      badge.textContent = hit.status;

      row.appendChild(cb);
      row.appendChild(domain);
      row.appendChild(badge);
      resultsList.appendChild(row);
    });

    refreshSelectedCount();
  }

  // Selector + Clearer
  selectAll.addEventListener('click', function () {
    resultsList.querySelectorAll('input[type="checkbox"]').forEach(function(cb) { cb.checked = true; });
    refreshSelectedCount();
  });

  selectNone.addEventListener('click', function () {
    resultsList.querySelectorAll('input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
    refreshSelectedCount();
  });

  // ── OPEN TABS button ──
  openBtn.addEventListener('click', function () {
    var checked = resultsList.querySelectorAll('input[type="checkbox"]:checked');
    var urls = Array.from(checked).map(function(cb) { return cb.value; });
    if (urls.length === 0) return;

    chrome.runtime.sendMessage({ action: 'openTabs', urls: urls });

    var n = urls.length;
    statusText.textContent = n + ' TAB' + (n !== 1 ? 'S' : '') + ' OPENED';
    openBtn.disabled = true;
    openBtn.textContent = 'DONE';
  });

  // LAUNCHER
  document.getElementById('extendo').addEventListener('click', function () {
    var checkedBoxes = document.querySelectorAll('.codes-grid input[type="checkbox"]:checked');
    var selectedCodes = Array.from(checkedBoxes).map(function(cb) { return parseInt(cb.value, 10); });

    if (selectedCodes.length === 0) {
      statusText.textContent = "NO CODES SELECTED";
      statusText.style.color = "#f34f14";
      return;
    }

    statusText.style.color = '';
    resultsPanel.classList.remove('visible');
    resultsList.innerHTML = '';
    openBtn.disabled = true;
    openBtn.textContent = 'OPEN TABS';

    chrome.runtime.sendMessage({ action: 'extendo', validCodes: selectedCodes });

    textSpan.classList.add("hidden");
    spinner.classList.remove("hidden");
    dots.classList.add("hidden");
    statusText.textContent = "ENUMERATING...";
  });

  // LISTENER
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === 'extendoResult') {
      textSpan.classList.remove("hidden");
      spinner.classList.add("hidden");
      dots.classList.remove("hidden");

      var hits = message.hits || [];
      var count = hits.length;

      statusText.textContent = count > 0
        ? count + ' TARGET' + (count !== 1 ? 'S' : '') + ' FOUND'
        : "NO TARGETS FOUND";

      buildResultsList(hits);
      resultsPanel.classList.add('visible');
    }
  });
});
