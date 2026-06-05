import axios from 'axios';

const ESKIZ_API = 'https://notify.eskiz.uz';
let eskizToken = null;
let tokenExpiry = null;

export async function getEskizToken() {
  // Return cached token if valid
  if (eskizToken && tokenExpiry && Date.now() < tokenExpiry) {
    return eskizToken;
  }

  try {
    const response = await axios.post(`${ESKIZ_API}/api/auth/login`, {
      email: process.env.ESKIZ_EMAIL,
      password: process.env.ESKIZ_PASSWORD
    });

    eskizToken = response.data.data.token;
    // Token valid for 30 days, cache for 25 days
    tokenExpiry = Date.now() + (25 * 24 * 60 * 60 * 1000);

    console.log('✅ Eskiz token obtained');
    return eskizToken;
  } catch (err) {
    console.error('❌ Error getting Eskiz token:', err.message);
    throw err;
  }
}

export async function sendSMS(phoneNumber, message) {
  try {
    const token = await getEskizToken();

    const response = await axios.post(`${ESKIZ_API}/api/message/sms/send`, {
      mobile_phone: phoneNumber,
      message: message,
      from: '4546'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`✅ SMS sent to ${phoneNumber}`);
    return response.data;
  } catch (err) {
    console.error(`❌ Error sending SMS to ${phoneNumber}:`, err.message);
    throw err;
  }
}
