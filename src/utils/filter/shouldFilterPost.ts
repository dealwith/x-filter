import { filterSettings } from "../../functions/content";
import { IPostInfo } from "../../interfaces/IPostInfo";
import { adKeywords } from "./adKeywords";

export const shouldFilterPost = (post: IPostInfo): boolean => {
  if (!filterSettings.enabled) {
    return false;
  }

  if (filterSettings.ads && isAdvertisement(post)) {
    return true;
  }

  return false;
}

function isAdvertisement(post: IPostInfo): boolean {
  const content = post.content.toLowerCase();

  return adKeywords.some(keyword => content.includes(keyword)) || post.element.querySelector('[data-testid="ad-badge"]') !== null;
}
