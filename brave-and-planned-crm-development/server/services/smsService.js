const axios = require("axios");

let eskizToken = null;
let eskizTokenAt = 0;

async function authenticateEskiz() {
  const response = await axios.post("https://notify.eskiz.uz/api/auth/login", {
    email: process.env.ESKIZ_EMAIL,
    password: process.env.ESKIZ_PASSWORD,
  });

  eskizToken = response.data?.data?.token || response.data?.token || null;
  eskizTokenAt = Date.now();
  return eskizToken;
}

async function getEskizToken() {
  if (eskizToken && Date.now() - eskizTokenAt < 1000 * 60 * 50) {
    return eskizToken;
  }
  return authenticateEskiz();
}

async function sendSMS(phone, message) {
  try {
    const token = await getEskizToken();
    const response = await axios.post(
      "https://notify.eskiz.uz/api/message/sms/send",
      {
        mobile_phone: phone,
        message,
        from: process.env.ESKIZ_FROM || "4546",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return { ok: true, data: response.data };
  } catch (error) {
    const payload = error.response?.data || error.message;
    console.error("Eskiz send failed", payload);
    return { ok: false, error: payload };
  }
}

module.exports = {
  sendSMS,
};
