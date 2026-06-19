const AUTH_BASE = "https://api-auth.textup.uz";
const SMS_BASE = "https://sms-api.textup.uz";

// Cache token in memory
let cachedToken = null;
let tokenExpiry = 0;

export async function getTextUpToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.TEXTUP_EMAIL;
  const password = process.env.TEXTUP_PASSWORD;

  if (!email || !password || email === "your-textup-email@example.com" || email === "your@email.com") {
    throw new Error("TEXTUP_EMAIL va TEXTUP_PASSWORD .env faylida to'g'ri sozlanmagan. Haqiqiy TextUP credentials kiriting.");
  }

  const res = await fetch(`${AUTH_BASE}/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TextUP login xatolik (${res.status}): ${err}`);
  }

  const data = await res.json();
  cachedToken = data.accessToken;
  tokenExpiry = Date.now() + 50 * 60 * 1000; // 50 minutes
  console.log("✅ TextUP token obtained");
  return cachedToken;
}

export function cleanPhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("7") && digits.length === 11) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  return `+${digits}`;
}

export function getParentPhone(student) {
  return student.parentPhone || student.phone || null;
}

export async function sendSMS(phone, message) {
  const userId = process.env.TEXTUP_USER_ID;
  const nicknameId = process.env.TEXTUP_NICKNAME_ID;

  if (!userId || userId === "your-user-uuid-from-login-response") {
    console.error("❌ TEXTUP_USER_ID not set or still has placeholder value");
    return { success: false, error: "TEXTUP_USER_ID sozlanmagan. .env faylida to'g'ri qiymat kiriting." };
  }

  const cleanedPhone = cleanPhone(phone);
  if (!cleanedPhone) {
    return { success: false, error: "Noto'g'ri telefon raqami" };
  }

  try {
    const token = await getTextUpToken();

    const body = {
      message,
      userId,
      name: `CRM-${Date.now()}`,
      recipients: [cleanedPhone],
    };

    if (nicknameId && nicknameId !== "your-nickname-uuid-from-nick-names-endpoint") {
      body.nicknameId = nicknameId;
    }

    const res = await fetch(`${SMS_BASE}/v1/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error(`❌ TextUP send error to ${cleanedPhone}:`, result);
      return { success: false, error: result?.message || JSON.stringify(result) };
    }

    console.log(`✅ SMS sent to ${cleanedPhone}, smsId: ${result.smsId}`);
    return { success: true, smsId: result.smsId };
  } catch (err) {
    console.error(`❌ SMS error to ${cleanedPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

export async function testConnection() {
  try {
    await getTextUpToken();
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}
