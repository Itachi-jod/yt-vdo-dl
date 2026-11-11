
const axios = require("axios");

const AUTHOR = "Itachi";
const CONVERTER = "https://cnvmp3.com/download_video_ucep.php";

function pretty(data) {
  return JSON.stringify(data, null, 2);
}

function getVideoId(url) {
  const parsed = new URL(url);

  if (parsed.hostname === "youtu.be") {
    return parsed.pathname.slice(1);
  }

  return parsed.searchParams.get("v");
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
    const parsed = new URL(url);

    if (
      !["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]
        .includes(parsed.hostname)
    ) {
      return send(400, {
        Author: AUTHOR,
        success: false,
        message: "Invalid YouTube URL"
      });
    }

    const videoId = getVideoId(url);

    if (!videoId) {
      return send(400, {
        Author: AUTHOR,
        success: false,
        message: "Video ID not found"
      });
    }

    // Get video title
    const metadata = await axios.get(
      "https://www.youtube.com/oembed",
      {
        params: {
          url,
          format: "json"
        },
        timeout: 15000
      }
    );

    const title = metadata.data.title;

    // CNVMP3 request payload
    const payload = {
      url,
      quality: 4,
      FormatValue: 1,
      title
    };

    // Send conversion request
    const response = await axios.post(
      CONVERTER,
      payload,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Origin: "https://cnvmp3.com",
          Referer: "https://cnvmp3.com/v55",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/137.0.0.0 Mobile Safari/537.36"
        },
        timeout: 60000
      }
    );

    const result = response.data;
    const downloadUrl = result["download link"];

    if (!result.success || !downloadUrl) {
      return send(502, {
        Author: AUTHOR,
        success: false,
        message: "Converter did not return download URL",
        details: result
      });
    }

    return send(200, {
      Author: AUTHOR,
      success: true,
      "Yt url": url,
      "video id": videoId,
      DownloadUrl: downloadUrl
    });

  } catch (error) {
    return send(500, {
      Author: AUTHOR,
      success: false,
      message: "Conversion request failed",
      details:
        error.response?.data ||
        error.message
    });
  }
};
