#!/bin/bash

# Test script for the X-Filter API
# This script sends example tweets to the backend and displays the response

# Configuration
API_URL="http://localhost:3000/analyze-tweets"
CONTENT_TYPE="Content-Type: application/json"

# Example tweets
read -r -d '' PAYLOAD << EOM
{
  "tweets": [
    {
      "id": "1001",
      "text": "The president announced a new policy today regarding climate change. This could have significant implications for the energy sector."
    },
    {
      "id": "1002",
      "text": "Check out our new smartphone with an amazing camera and 2-day battery life! Use code SAVE20 for 20% off your purchase."
    },
    {
      "id": "1003",
      "text": "Just released our open-source AI library that can process natural language 10x faster than previous models."
    },
    {
      "id": "1004",
      "text": "Had a great coffee this morning at my favorite local cafe. The sun is shining and it's going to be a beautiful day!"
    },
    {
      "id": "1005",
      "text": "Our company just launched a revolutionary blockchain solution for supply chain management. #tech #innovation"
    }
  ]
}
EOM

echo "Sending request to $API_URL..."
echo "Payload:"
echo "$PAYLOAD" | jq '.'

# Send the request using curl
RESPONSE=$(curl -s -X POST -H "$CONTENT_TYPE" -d "$PAYLOAD" "$API_URL")

# Check if the request was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to connect to the backend server."
  echo "Make sure the server is running at $API_URL"
  exit 1
fi

# Check if the response is valid JSON
if ! echo "$RESPONSE" | jq '.' &>/dev/null; then
  echo "Error: Received invalid JSON response:"
  echo "$RESPONSE"
  exit 1
fi

# Display the response
echo -e "\nResponse:"
echo "$RESPONSE" | jq '.'

# Analyze the results
echo -e "\nAnalysis Summary:"
echo "$RESPONSE" | jq -r '.tweets | to_entries[] | "\(.key): Politics: \(.value.Politics), Advertisement: \(.value.Advertisment), Technology: \(.value.Technology)"'

echo -e "\nTest completed successfully!"

