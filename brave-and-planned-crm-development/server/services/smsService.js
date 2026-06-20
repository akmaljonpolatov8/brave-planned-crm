const AUTH_BASE = "https://api-auth.textup.uz";
const SMS_BASE = "https://sms-api.textup.uz";

let cachedToken = null;
let tokenExpiry = 0;

function isPlaceholder(value) {
  const placeholders = new Set([
    "your@email.com",
    "your_password",
    "your-user-uuid-from-login-response",
    "your-nickname-uuid-from-nick-names-endpoint",
    "your-textup-email@example.com",
    "your-textup-password",
  ]);
  return !value || placeholders.has(String(value).trim());
}

export async function getTextUpToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.TEXTUP_EMAIL;
  const password = process.env.TEXTUP_PASSWORD;

  if (isPlaceholder(email) || isPlaceholder(password)) {
    throw new Error(
      "TEXTUP_EMAIL va TEXTUP_PASSWORD .env faylida to'g'ri sozlanmagan. Haqiqiy TextUP login kiriting.",
    );
  }

  const res = await fetch(`${AUTH_BASE}/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TextUP login xatolik (${res.status}): ${errText}`);
  }

  const data = await res.json();
  cachedToken = data.accessToken;
  tokenExpiry = Date.now() + 50 * 60 * 1000;
  console.log("✅ TextUP token olindi");
  return cachedToken;
}

export function cleanPhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("7") && digits.length === 11) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  return `+${digits}`;
}

export function getParentPhone(student) {
  if (!student) return null;
  return student.parent_phone || student.parentPhone || student.phone || null;
}

export function isCredentialError(errorMessage = "") {
  return /sozlanmagan|login xatolik|TEXTUP_|401|403|Unauthorized/i.test(
    String(errorMessage),
  );
}

export async function sendSMS(phone, message) {
  const userId = process.env.TEXTUP_USER_ID;
  const nicknameId = process.env.TEXTUP_NICKNAME_ID;

  if (isPlaceholder(userId)) {
    return {
      success: false,
      error:
        "TEXTUP_USER_ID sozlanmagan. Login javobidagi user.id qiymatini .env ga kiriting.",
    };
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

    if (!isPlaceholder(nicknameId)) {
      body.nicknameId = nicknameId;
    }

    const res = await fetch(`${SMS_BASE}/v1/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(`❌ TextUP send error to ${cleanedPhone}:`, result);
      return {
        success: false,
        error: result?.message || `TextUP yuborish xatosi (${res.status})`,
      };
    }

    console.log(
      `✅ SMS yuborildi: ${cleanedPhone}, smsId: ${result.smsId || "n/a"}`,
    );
    return { success: true, smsId: result.smsId || null };
  } catch (err) {
    console.error(`❌ SMS error to ${cleanedPhone}:`, err.message);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Noma'lum SMS xatosi",
    };
  }
}

export async function testConnection() {
  try {
    await getTextUpToken();
    return { connected: true };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Noma'lum ulanish xatosi",
    };
  }
}
