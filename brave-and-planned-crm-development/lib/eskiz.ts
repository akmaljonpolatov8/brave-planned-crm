const BASE = "https://notify.eskiz.uz/api";

export async function getToken(): Promise<string> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ESKIZ_EMAIL,
      password: process.env.ESKIZ_PASSWORD,
    }),
  });
  const data = await res.json();
  return data.data?.token ?? "";
}

export async function sendSMS(
  phone: string,
  message: string,
): Promise<boolean> {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE}/message/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mobile_phone: phone.replace(/\D/g, ""),
        message,
        from: process.env.SMS_FROM ?? "4546",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
