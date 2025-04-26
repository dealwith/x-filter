import { IPostInfo } from "../../interfaces/IPostInfo";

import { filterSettings } from "../../functions/content";

export const shouldFilterPost = async (post: IPostInfo): Promise<boolean> => {
  // Ask the backend what topic score the post has

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
    })
  });
  const resData = await res.json();

  if (filterSettings.political) {
    if (resData.tweets[post.id].Political > 5) {
      return true;
    }
  }

  return false;
}
