export const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const dueDateForMonth = (month: string) => {
  const [year, mm] = month.split("-").map(Number);
  return new Date(year, mm - 1, 2, 0, 0, 0, 0);
};

export const monthLabelUz = (month: string) => {
  const [year, mm] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("uz-UZ", { month: "long", year: "numeric" }).format(new Date(year, mm - 1, 1));
};

export const daysOverdue = (dueDate: Date) => {
  const now = new Date();
  const diff = now.getTime() - dueDate.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

export const weekRange = (dateFrom?: string, dateTo?: string) => {
  if (dateFrom && dateTo) {
    return { from: new Date(dateFrom), to: new Date(dateTo) };
  }

  const today = new Date();
  const day = today.getDay();
  const shift = day === 0 ? -6 : 1 - day;
  const from = new Date(today);
  from.setDate(today.getDate() + shift);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  return { from, to };
};
