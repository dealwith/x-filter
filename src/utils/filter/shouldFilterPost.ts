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

  // Ask the backend what topic score the post has
  let resData;
  try {
    const res = await fetch("http://root.fipso.dev:3000/analyze-tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tweets: [
          {
            id: post.id,
            text: post.content,
          },
        ],
      }),
    });
    resData = await res.json();
  } catch (error) {
    console.error("Error fetching or parsing response:", error);
    return false; // Default to not filtering the post if an error occurs
  }
  if (filterSettings.political) {
    if (resData.tweets[post.id].Political > 5) {
      return true;
    }
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
