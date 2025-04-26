import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./popup.scss"
import 'bootstrap/dist/css/bootstrap.min.css';
import UserSelections from "./components/UserSelections";

interface TweetInfo {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: string;
  retweets: string;
}

const Popup = () => {
  const [firstTweet, setFirstTweet] = useState<TweetInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Query the active tab to get the content script to send us the first tweet
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];

      if (!activeTab || !activeTab.id) {
        setError("Could not connect to the active tab");
        setLoading(false);
        return;
      }

      // Check if we're on a valid domain
      const url = activeTab.url || "";
      if (!url.includes("twitter.com") && !url.includes("x.com")) {
        setError("Please navigate to X.com or Twitter.com to use this extension");
        setLoading(false);
        return;
      }

      // Send a message to the content script to get the first tweet
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "getFirstTweet" },
        (response) => {
          if (chrome.runtime.lastError) {
            setError("Error communicating with the page: " + chrome.runtime.lastError.message);
          } else if (response && response.tweetInfo) {
            setFirstTweet(response.tweetInfo);
          } else {
            setError("No tweets found or content script not ready");
          }
          setLoading(false);
        }
      );
    });
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="popup-container">
      <UserSelections/>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);