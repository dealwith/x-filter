import { IPostInfo } from "../../interfaces/IPostInfo";
import { shouldFilterPost } from "./shouldFilterPost";

export const applyFilter = async (post: IPostInfo) => {
  if (await shouldFilterPost(post)) {
    post.element.style.display = "none";
    post.filtered = true;
  }
};
