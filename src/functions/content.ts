// Set to store already processed tweet IDs to avoid duplicates
const processedTweetIds = new Set<string>();

// Keep track of the latest tweet we've found
let latestTweetInfo: TweetInfo | null = null;

// Interface for tweet information
interface TweetInfo {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: string;
  retweets: string;
}

/**
 * Extract information from the first tweet on the page
 */
const extractFirstTweet = (): TweetInfo | null => {
  // Find all tweet articles
  const articles = document.querySelectorAll('article[data-testid="tweet"]');

  if (articles.length === 0) {
    console.log('No tweets found on page');
    return null;
  }

  // Get the first article
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
const logTweetInfo = (tweetInfo: TweetInfo) => {
  console.log('======= X-FILTER: FIRST TWEET =======');
  console.log(`ID: ${tweetInfo.id}`);
  console.log(`Author: ${tweetInfo.author} (${tweetInfo.handle})`);
  console.log(`Posted: ${tweetInfo.timestamp}`);
  console.log(`Content: ${tweetInfo.content}`);
  console.log(`Likes: ${tweetInfo.likes}, Retweets: ${tweetInfo.retweets}`);
  console.log('====================================');
};

/**
 * Main function to process the first tweet
 */
const processFirstTweet = () => {
  const tweetInfo = extractFirstTweet();

  if (tweetInfo) {
    logTweetInfo(tweetInfo);
    latestTweetInfo = tweetInfo; // Save for later retrieval
  }
};

/**
 * Run when page loads and observe for dynamic content
 */
const init = () => {
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getFirstTweet") {
    // If we don't have a tweet yet, try to get one
    if (!latestTweetInfo) {
      processFirstTweet();
    }

    // Send back whatever we have
    sendResponse({ tweetInfo: latestTweetInfo });
  }
  return true; // Keep the message channel open for asynchronous response
});

// Initialize the extension
init();