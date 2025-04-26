#!/bin/bash

cat msg.json | jq '.data.user.result.timeline.timeline.instructions[] | .entries[] | select(has("content")) | .content | select(has("items")) | .items[0].item.itemContent.tweet_results.result.core.user_results.result'
