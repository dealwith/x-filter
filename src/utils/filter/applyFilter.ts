import { IPostInfo } from "../../interfaces/IPostInfo";
import { shouldFilterPost } from "./shouldFilterPost";

export const applyFilter = (post: IPostInfo) => {
	if (shouldFilterPost(post)) {
		post.element.style.display = "none";
		post.filtered = true;
	}
}