const ESKIZ_BASE = "https://notify.eskiz.uz/api";

export async function getEskizToken(): Promise<string> {
  const res = await fetch(`${ESKIZ_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ESKIZ_EMAIL,
      password: process.env.ESKIZ_PASSWORD,
    }),
  });

  if (!res.ok) throw new Error("Eskiz authentication failed");

  const data = await res.json();
  return data.data.token;
}

export async function sendSMS(
  phone: string,
  message: string,
): Promise<boolean> {
  try {
    if (!process.env.ESKIZ_EMAIL || !process.env.ESKIZ_PASSWORD) {
      console.warn("Eskiz credentials not configured");
      return false;
    }

    const token = await getEskizToken();
    const cleanPhone = phone.replace(/\D/g, "");

    const res = await fetch(`${ESKIZ_BASE}/message/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mobile_phone: cleanPhone,
        message,
        from: process.env.SMS_FROM ?? "4546",
      }),
    });

    return res.ok;
  } catch (error) {
    console.error("SMS send failed:", error);
    return false;
  }
}

export async function addEskizContact(
  name: string,
  phone: string,
): Promise<void> {
  try {
    if (!process.env.ESKIZ_EMAIL || !process.env.ESKIZ_PASSWORD) return;

    const token = await getEskizToken();
    const cleanPhone = phone.replace(/\D/g, "");

    await fetch(`${ESKIZ_BASE}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        mobile_phone: cleanPhone,
      }),
    });
  } catch (error) {
    console.error("Add contact failed:", error);
  }
}
