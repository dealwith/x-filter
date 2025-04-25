// Renamed variables to avoid redeclaration conflicts
const uniqueHiddenTweetIdsSet = new Set<string>([
  "1751234567890123456",
  "1749876543210987654",
]);

// Utility to find and hide tweets by their ID
const uniqueHideTweetsByIdFunction = () => {
  const articles = document.querySelectorAll('article[role="article"]');

  articles.forEach((article) => {
    const links = article.querySelectorAll("a[href*='/status/']");
    links.forEach((link) => {
      const match = link.getAttribute("href")?.match(/\/status\/(\d+)/);
      if (match && uniqueHiddenTweetIdsSet.has(match[1])) {
        (article as HTMLElement).style.display = "none";
        console.log(`Tweet ${match[1]} hidden`);
      }
    });
  });
};

// Observe for dynamic content loading
const uniqueMutationObserver = new MutationObserver(() => {
  uniqueHideTweetsByIdFunction();
});

const uniqueMainTimeline = document.querySelector("main");
if (uniqueMainTimeline) {
  uniqueMutationObserver.observe(uniqueMainTimeline, {
    childList: true,
    subtree: true,
  });
  uniqueHideTweetsByIdFunction();
}
