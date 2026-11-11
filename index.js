
const axios = require("axios");

const AUTHOR = "ItachiXD";
const CONVERTER = "https://cnvmp3.com/download_video_ucep.php";

function pretty(data) {
  return JSON.stringify(data, null, 2);
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const send = (status, data) =>
    res.status(status).send(pretty(data));

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return send(405, {
      Author: AUTHOR,
      success: false,
      message: "GET method required"
    });
  }

  const url = req.query.url;

  if (!url) {
    return send(400, {
      Author: AUTHOR,
      success: false,
      message: "Missing ?url parameter"
    });
  }

  try {
    const metadata = await axios.get(
      "https://www.youtube.com/oembed",
      {
        params: {
          url,
          format: "json"
        }
      }
    );

    const response = await axios.post(
      CONVERTER,
      {
        url,
        quality: 4,
        FormatValue: 1,
        title: metadata.data.title
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Origin: "https://cnvmp3.com",
          Referer: "https://cnvmp3.com/v55"
        },
        timeout: 60000
      }
    );

    const result = response.data;

    if (!result.success || !result["download link"]) {
      return send(502, {
        Author: AUTHOR,
        success: false,
        message: "Download URL not found",
        details: result
      });
    }

    return send(200, {
      Author: AUTHOR,
      success: true,
      "Yt url": url,
      DownloadUrl: result["download link"]
    });

  } catch (error) {
    return send(500, {
      Author: AUTHOR,
      success: false,
      message: "Conversion failed",
      details: error.response?.data || error.message
    });
  }
};
