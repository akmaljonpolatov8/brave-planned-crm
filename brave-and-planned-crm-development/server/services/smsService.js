const normalizePhone = (phone) => {
  if (!phone) return null;
  return String(phone).replace(/[-\s]/g, "").trim() || null;
};

const getParentPhone = (student) => {
  return student.ota_phone || student.ona_phone || student.telefon || null;
};

const sendSMS = async (phone, message) => {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) {
    return { success: false, message: "Telefon topilmadi" };
  }

  const response = await fetch(process.env.TEXTUP_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TEXTUP_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: cleanPhone,
      message,
      from: "BravePlanet",
    }),
  });

  return response.json();
};

module.exports = {
  sendSMS,
  getParentPhone,
  normalizePhone,
};
