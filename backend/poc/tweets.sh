#!/bin/bash

cat msg.json | jq -r '.data.user.result.timeline.timeline.instructions[] | .entries[] | select(has("content")) | .content | select(has("items")) | .items[0].item.itemContent.tweet_results.result.legacy | "-- TWEET --:\n\(.id_str):\n\(.full_text)\n-- END --"'
