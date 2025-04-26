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
  elonmusk: true,
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

  console.log(`X-Filter: Found ${articles.length} posts on the page`);

  let newPostsFound = 0;

  articles.forEach((article) => {
    if (article instanceof HTMLElement) {
      const postInfo = extractPostInfo(article);

      if (postInfo) {
        newPostsFound++;
        allPosts.push(postInfo);

        // Apply filter to each post as it's processed
        applyFilter(postInfo);

        // Only log the first few posts to avoid console spam
        if (allPosts.length <= 3) {
          logPostInfo(postInfo);
        }
      }
    }
  });

  if (newPostsFound > 0) {
    console.log(`X-Filter: Processed ${newPostsFound} new posts`);

    chrome.runtime.sendMessage({
      action: "updatePosts",
      stats: {
        totalProcessed: processedPostIds.size,
        totalFiltered: allPosts.filter((t) => t.filtered).length,
      },
    });
  } else {
    console.log("X-Filter: No new posts found");
  }
};

// Don't stop observing after finding the first posts
const observeTimeline = () => {
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    for (const mutation of mutations) {
      if (
        mutation.addedNodes.length > 0 ||
        (mutation.target && mutation.type === "childList")
      ) {
        shouldProcess = true;
        break;
      }
    }

    if (shouldProcess) {
      // Add a small delay to let the DOM fully update
      setTimeout(processAllPosts, 100);
    }
  });

  const setupObserver = () => {
    // Try to observe the timeline element and its children
    const timeline =
      document.querySelector('[data-testid="primaryColumn"]') ||
      document.querySelector("main");

    if (timeline) {
      observer.observe(timeline, {
        childList: true,
        subtree: true,
      });
      console.log("X-Filter: Successfully attached observer to timeline");

      // Process posts immediately after attaching observer
      processAllPosts();

      // Also process on scroll events to catch dynamically loaded content
      window.addEventListener("scroll", () => {
        // Use debouncing to avoid excessive processing
        clearTimeout(window.scrollTimer);
        window.scrollTimer = setTimeout(() => {
          processAllPosts();
        }, 300);
      });
    } else {
      console.log("X-Filter: Timeline not found, retrying...");
      setTimeout(setupObserver, 500);
    }
  };

  setupObserver();
};

const init = async () => {
  console.log("X-Filter: Initializing...");

  try {
    filterSettings = await loadFilterSettings();
    console.log("X-Filter: Settings loaded", filterSettings);

    // Start observing the timeline for new posts
    observeTimeline();

    // Handle settings changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.filterSettings) {
        console.log(
          "X-Filter: Settings updated",
          changes.filterSettings.newValue,
        );
        filterSettings = changes.filterSettings.newValue;

        // Re-process all posts with new settings
        allPosts.forEach((post) => {
          // Reset post appearance first
          post.element.style.display = "";
          post.filtered = false;

          // Apply filter again
          applyFilter(post);
        });
      }
    });
  } catch (error) {
    console.error("X-Filter: Initialization error", error);
  }
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

      allPosts.forEach((tweet) => {
        tweet.element.style.display = "";
        tweet.filtered = false;

        applyFilter(tweet);
      });

      sendResponse({ success: true });
    }

    return true;
  });
} catch (error) {
  console.error("X-Filter: No chrome runtime environment running", error);
}

init();
