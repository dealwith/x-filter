import { filterSettings } from "../../functions/content";
import { IPostInfo } from "../../interfaces/IPostInfo";
import { adKeywords } from "./adKeywords";

export const shouldFilterPost = async (post: IPostInfo): Promise<boolean> => {
  if (!filterSettings.enabled) {
    return false;
  }

  if (filterSettings.ads && isAdvertisement(post)) {
    return true;
  }

  if (filterSettings.elonmusk && isElonMuskPost(post)) {
    return true;
  }

  // Use the background script for API calls
  try {
    interface AnalyzePostResponse {
      success: boolean;
      data?: {
        tweets: {
          [id: string]: {
            Politics: number;
            // Add other properties as needed
          };
        };
      };
    }

    const response = await new Promise<AnalyzePostResponse>(
      (resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "analyzePost",
            tweets: [
              {
                id: post.id,
                text: post.content,
              },
            ],
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response as AnalyzePostResponse);
            }
          },
        );
      },
    );

    if (response && response.success && response.data) {
      const resData = response.data;

      if (filterSettings.political) {
        if (resData.tweets[post.id].Politics > 5) {
          return true;
        }
      }
    }
  } catch (error) {
    console.error("Error in message passing:", error);
  }

  return false;
};

function isAdvertisement(post: IPostInfo): boolean {
  const content = post.content.toLowerCase();

  return (
    adKeywords.some((keyword) => content.includes(keyword)) ||
    post.element.querySelector('[data-testid="ad-badge"]') !== null
  );
}

function isElonMuskPost(post: IPostInfo): boolean {
  const content = post.content.toLowerCase();
  const author = post.author.toLowerCase();

  return (
    content.includes("elon musk") ||
    author.includes("elon musk") ||
    post.handle.toLowerCase() === "@elonmusk" ||
    post.content.includes("spacex")
  );
}
