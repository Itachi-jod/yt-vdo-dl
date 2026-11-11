
const axios = require("axios");

const AUTHOR = "ItachiXD";

function pretty(data) {
  return JSON.stringify(data, null, 2);
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send(pretty({
      author: AUTHOR,
      success: false,
      message: "Method Not Allowed"
    }));
  }

  const url = req.query.url;

  if (!url) {
    return res.status(400).send(pretty({
      author: AUTHOR,
      success: false,
      message: "Missing ?url parameter"
    }));
  }

  try {
    const parsed = new URL(url);

    const allowed = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be"
    ];

    if (!allowed.includes(parsed.hostname)) {
      return res.status(400).send(pretty({
        author: AUTHOR,
        success: false,
        message: "Invalid YouTube URL"
      }));
    }

    const response = await axios.get(
      "https://www.youtube.com/oembed",
      {
        params: {
          url,
          format: "json"
        },
        timeout: 15000
      }
    );

    return res.status(200).send(pretty({
      author: AUTHOR,
      success: true,
      platform: "YouTube",
      title: response.data.title,
      thumbnail: response.data.thumbnail_url,
      videoUrl: url
    }));

  } catch (err) {
    return res.status(500).send(pretty({
      author: AUTHOR,
      success: false,
      message: "Failed to process video",
      details: err.message
    }));
  }
};
