chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzePost") {
    fetch("https://xfilter.root.fipso.dev/analyze-tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tweets: message.tweets,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("Error in background script:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});
