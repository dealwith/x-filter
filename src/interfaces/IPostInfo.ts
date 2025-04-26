export interface IPostInfo {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: string;
  retweets: string;
  element: HTMLElement; // ref to the DOM element
  filtered?: boolean; // Whether the post is filtered or not
}
