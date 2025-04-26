import { FilterSettings } from "../interfaces/IFilterSettings";
import { ITweetInfo } from "../interfaces/ITweetInfo";
import { loadFilterSettings } from "./filter";

const processedTweetIds = new Set<string>();

let latestTweetInfo: ITweetInfo | null = null;

export let userPreferences: FilterSettings | null = null;

/**
 * Extract information from the first tweet on the page
 */
const extractFirstTweet = (): ITweetInfo | null => {
  const articles = document.querySelectorAll('article[data-testid="tweet"]');

  if (articles.length === 0) {
    console.log('No tweets found on page');
    return null;
  }

  const firstArticle = articles[0] as HTMLElement;

  // Extract tweet ID
  const tweetLink = firstArticle.querySelector('a[href*="/status/"]');
  const tweetUrl = tweetLink?.getAttribute('href');
  const idMatch = tweetUrl?.match(/\/status\/(\d+)/);

  if (!idMatch || !idMatch[1]) {
    console.log('Could not extract tweet ID');
    return null;
  }

  const tweetId = idMatch[1];

  // Check if we've already processed this tweet
  if (processedTweetIds.has(tweetId)) {
    return null;
  }

  // Mark as processed
  processedTweetIds.add(tweetId);

  // Extract author information
  const authorElement = firstArticle.querySelector('[data-testid="User-Name"]');
  const authorName = authorElement?.querySelector('span')?.textContent || 'Unknown Author';
  const handleElement = authorElement?.querySelector('span a span')?.textContent || '@unknown';

  // Extract tweet content
  const contentElement = firstArticle.querySelector('[data-testid="tweetText"]');
  const content = contentElement?.textContent || '';

  // Extract timestamp
  const timestampElement = firstArticle.querySelector('time');
  const timestamp = timestampElement?.getAttribute('datetime') || '';

  // Extract engagement stats
  const likesElement = firstArticle.querySelector('[data-testid="like"]');
  const likes = likesElement?.textContent || '0';

  const retweetsElement = firstArticle.querySelector('[data-testid="retweet"]');
  const retweets = retweetsElement?.textContent || '0';

  return {
    id: tweetId,
    author: authorName,
    handle: handleElement,
    content,
    timestamp,
    likes,
    retweets
  };
};

/**
 * Log tweet information to console
 */
const logTweetInfo = (ITweetInfo: ITweetInfo) => {
  console.log('======= X-FILTER: FIRST TWEET =======');
  console.log(`ID: ${ITweetInfo.id}`);
  console.log(`Author: ${ITweetInfo.author} (${ITweetInfo.handle})`);
  console.log(`Posted: ${ITweetInfo.timestamp}`);
  console.log(`Content: ${ITweetInfo.content}`);
  console.log(`Likes: ${ITweetInfo.likes}, Retweets: ${ITweetInfo.retweets}`);
  console.log('====================================');
};

/**
 * Main function to process the first tweet
 */
const processFirstTweet = () => {
  const ITweetInfo = extractFirstTweet();

  if (ITweetInfo) {
    logTweetInfo(ITweetInfo);
    latestTweetInfo = ITweetInfo; // Save for later retrieval
  }
};

/**
 * Run when page loads and observe for dynamic content
 */
const init = async () => {
  // Initialize filter
  userPreferences = await loadFilterSettings();

  // Try to process first tweet immediately
  setTimeout(() => {
    processFirstTweet();
  }, 2000); // Small delay to ensure content is loaded

  // Set up observer for dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    // Check if relevant elements were added
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        shouldProcess = true;
      }
    });

    if (shouldProcess) {
      processFirstTweet();
    }
  });

  // Start observing the timeline
  const timeline = document.querySelector('main');
  if (timeline) {
    observer.observe(timeline, {
      childList: true,
      subtree: true
    });

    console.log('X-Filter: Observing timeline for new tweets');
  }
};

// Set up message listener for the popup
try{
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getFirstTweet") {
      // If we don't have a tweet yet, try to get one
      if (!latestTweetInfo) {
        processFirstTweet();
      }
  
      // Send back whatever we have
      sendResponse({ ITweetInfo: latestTweetInfo });
    }
    return true; // Keep the message channel open for asynchronous response
  });
}catch{
  console.error("No chrome runtime environment running")
}


// Initialize the extension
init();