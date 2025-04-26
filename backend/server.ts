import express from 'express';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define interfaces
interface Tweet {
  id: string;
  text: string;
}

interface TopicScores {
  [topic: string]: number;
}

interface TweetScores {
  [tweetId: string]: TopicScores;
}

interface ApiResponse {
  tweets: TweetScores;
}

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Define topics
const TOPICS = ["Politics", "Advertisment", "Technology"];

// API endpoint to analyze tweets
app.post('/analyze-tweets', async (req, res) => {
  try {
    const tweets: Tweet[] = req.body.tweets;
    
    if (!tweets || !Array.isArray(tweets) || tweets.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of tweets' });
    }

    // Format tweets for the prompt
    const formattedTweets = tweets.map(tweet => 
      `-- TWEET --:\n${tweet.id}:\n${tweet.text}\n-- END --`
    ).join('\n');

    // Create the prompt
    const prompt = `Please take a look at the following twitter posts.
Give me a rating for each post from 1 to 10 based on how much the topic belongs to one of the following topics:
${TOPICS.join(', ')}.
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
${formattedTweets}`;

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      // @ts-ignore
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse the response
    const content = completion.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result: ApiResponse = JSON.parse(content);
    
    return res.json(result);
  } catch (error) {
    console.error('Error analyzing tweets:', error);
    return res.status(500).json({ error: 'Failed to analyze tweets' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

