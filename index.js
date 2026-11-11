
const axios = require("axios");

function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

module.exports = async function (req, res) {
  res.setHeader("Content-Type", "application/json");

  const url = req.query.url;

  if (!url) {
    return res.status(400).send(
      pretty({
        author: "ItachiXD",
        success: false,
        message: "Missing ?url parameter"
      })
    );
  }

  try {
    // Replace with an authorized video-processing service
    const response = await axios.get(
      "https://your-authorized-api.example/video",
      {
        params: { url }
      }
    );

    return res.status(200).send(
      pretty({
        author: "ItachiXD",
        success: true,
        platform: "YouTube",
        data: response.data
      })
    );
  } catch (err) {
    return res.status(500).send(
      pretty({
        author: "ItachiXD",
        success: false,
        message: "Failed to process video",
        details: err.response?.data || err.message
      })
    );
  }
};
