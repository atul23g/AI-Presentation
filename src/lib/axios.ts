import axios from "axios";

const lemonSqueezyClient = (lemonSqueezyApiKey?: string) => {
  const apiKey = lemonSqueezyApiKey || process.env.LEMON_SQUEEZY_API_KEY;
  
  if (!apiKey) {
    console.error("❌ LEMON_SQUEEZY_API_KEY is not configured");
  }

  

  return axios.create({
    baseURL: "https://api.lemonsqueezy.com/v1",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
};

export default lemonSqueezyClient;
