import { loadFilterSettings } from "./filter";
import { IPostInfo } from "../interfaces/IPostInfo";
import { logPostInfo } from "../utils/logPostInfo";
import { IFilterSettings } from "../interfaces/IFilterSettings";
import { applyFilter } from "../utils/filter/applyFilter";

const processedPostIds = new Set<string>();
const allPosts: IPostInfo[] = [];

export let filterSettings: IFilterSettings = {
  enabled: true,
  likes: [0, 100],
  ads: true,
  political: true,
};

const extractPostInfo = (article: HTMLElement): IPostInfo | null => {
  const postLink = article.querySelector('a[href*="/status/"]');
  const postUrl = postLink?.getAttribute("href");
  const idMatch = postUrl?.match(/\/status\/(\d+)/);

  if (!idMatch || !idMatch[1]) {
    return null;
  }

  const postId = idMatch[1];

  if (processedPostIds.has(postId)) {
    return null;
  }

  processedPostIds.add(postId);

  const authorElement = article.querySelector('[data-testid="User-Name"]');
  const authorName =
    authorElement?.querySelector("span")?.textContent || "Unknown Author";
  const handleElement =
    authorElement?.querySelector("span a span")?.textContent || "@unknown";

  const contentElement = article.querySelector('[data-testid="tweetText"]');
  const content = contentElement?.textContent || "";

  const timestampElement = article.querySelector("time");
  const timestamp = timestampElement?.getAttribute("datetime") || "";

  const likesElement = article.querySelector('[data-testid="like"]');
  let likes = likesElement?.textContent || "0";

  likes = likes.replace(/[^0-9]/g, "");

  const retweetsElement = article.querySelector('[data-testid="retweet"]');
  let retweets = retweetsElement?.textContent || "0";

  retweets = retweets.replace(/[^0-9]/g, "");

  return {
    id: postId,
    author: authorName,
    handle: handleElement,
    content,
    timestamp,
    likes,
    retweets,
    element: article,
  };
};

const processAllPosts = () => {
  const articles = document.querySelectorAll('article[data-testid="tweet"]');

  if (articles.length === 0) {
    console.log("No posts found on the page.");
    return;
  }

  articles.forEach((article) => {
    if (article instanceof HTMLElement) {
      const postInfo = extractPostInfo(article);

      if (postInfo) {
        allPosts.push(postInfo);
        logPostInfo(postInfo);
      }
    }
  });

  chrome.runtime.sendMessage({
    action: "updatePosts",
    stats: {
      totalProcessed: processedPostIds.size,
      totalFiltered: allPosts.filter((t) => t.filtered).length,
    },
  });
};

const waitForPosts = () => {
  const interval = setInterval(() => {
    processAllPosts();

    if (allPosts.length > 0) {
      console.log("Posts found. Stopping interval.");
      clearInterval(interval);
    }
  }, 1000);
};

const init = async () => {
  filterSettings = await loadFilterSettings();

  if (filterSettings.enabled) {
    waitForPosts();
  }

  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        shouldProcess = true;
      }
    });

    if (shouldProcess) {
      processAllPosts();
    }
  });

  const timeline = document.querySelector("main");

  if (timeline) {
    observer.observe(timeline, {
      childList: true,
      subtree: true,
    });

    console.log("X-Filter: Observing timeline for new tweets");
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.filterSettings) {
      filterSettings = changes.filterSettings.newValue;
    }
  });
};

try {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getFirstTweet" && allPosts.length > 0) {
      sendResponse({
        tweetInfo: {
          id: allPosts[0].id,
          author: allPosts[0].author,
          handle: allPosts[0].handle,
          content: allPosts[0].content,
          timestamp: allPosts[0].timestamp,
          likes: allPosts[0].likes,
          retweets: allPosts[0].retweets,
        },
      });
    } else if (message.action === "getStats") {
      sendResponse({
        totalProcessed: processedPostIds.size,
        totalFiltered: allPosts.filter((t) => t.filtered).length,
        filterEnabled: filterSettings.enabled,
      });
    } else if (message.action === "updateFilterSettings") {
      filterSettings = message.settings;

      chrome.storage.sync.set({ filterSettings });

      allPosts.forEach((tweet) => {
        tweet.element.style.opacity = "1";

        const existingBadge = tweet.element.querySelector(
          'div:contains("Filtered by X-Filter")',
        );
        if (existingBadge) {
          existingBadge.remove();
        }

        applyFilter(tweet);
      });

      sendResponse({ success: true });
    }

    return true;
  });
} catch {
  console.error("No chrome runtime environment running");
}

init();
