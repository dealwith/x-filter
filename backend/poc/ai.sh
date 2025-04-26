#!/bin/bash

TOPICS="Politics, Advertisment, Technology"

TWEETS=$(./tweets.sh)

MSG=$(cat <<EOF
Please take a look at the following twitter posts.
Give me a rating for each post from 1 to 10 based on how much the topic belongs to one of the following topics:
$TOPICS.
Respond with a JSON object where each tweet has a rating for each topic.
Example:

{
  "tweets": {
    "1911910628232691947": {
      "Politics": 1,
      "Advertisment": 2,
      "Technology": 8
    },...


TWEETS:
${TWEETS}
EOF
)


CONTENT=$(printf '%s' "$MSG" | jq -Rs .)

# Create a properly escaped JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "model": "gpt-4.1-nano",
  "messages": [{"role": "user", "content": $CONTENT}],
  "response_format": {"type": "json_object"},
  "temperature": 0.7
}
EOF
)

curl "https://api.openai.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HLEB_KEY" \
  -d "$JSON_PAYLOAD" | jq -r '.choices[0].message.content' | jq
