{
  (async () => {
    textarea = document.querySelector("textarea");
    chrome.storage.local.get("BlueFoxSetting_url", function (items) {
      textarea.value = items.BlueFoxSetting_url ? items.BlueFoxSetting_url : "";
    });

    textarea.addEventListener("input", (event) => {
      chrome.storage.local.set(
        { BlueFoxSetting_url: textarea.value },
        function () {}
      );
    });
  })();
}
