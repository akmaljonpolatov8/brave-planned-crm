export const calculateProratedAmount = (monthlyFee: number, effectiveDate: Date) => {
  const daysInMonth = new Date(effectiveDate.getFullYear(), effectiveDate.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - effectiveDate.getDate() + 1;
  return Math.max(0, Math.round((monthlyFee / daysInMonth) * remainingDays));
};
