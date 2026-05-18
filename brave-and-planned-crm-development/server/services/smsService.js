const axios = require("axios");

async function sendSMS(phone, message) {
  try {
    const apiKey = process.env.TEXTUP_API_KEY;
    const apiSecret = process.env.TEXTUP_API_SECRET;
    const apiUrl = process.env.TEXTUP_API_URL || "https://rest.smsportal.com/bulkmessages";

    if (!apiKey || !apiSecret) {
      throw new Error("TEXTUP_API_KEY yoki TEXTUP_API_SECRET topilmadi");
    }

    const response = await axios.post(
      apiUrl,
      {
        messages: [
          {
            content: message,
            destination: phone,
          },
        ],
      },
      {
        auth: {
          username: apiKey,
          password: apiSecret,
        },
      },
    );

    return { ok: true, data: response.data };
  } catch (error) {
    const payload = error.response?.data || error.message;
    console.error("TextUp send failed", payload);
    return { ok: false, error: payload };
  }
}

module.exports = {
  sendSMS,
};
