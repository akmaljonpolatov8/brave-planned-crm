"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProratedAmount = void 0;
const calculateProratedAmount = (monthlyFee, effectiveDate) => {
    const daysInMonth = new Date(effectiveDate.getFullYear(), effectiveDate.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - effectiveDate.getDate() + 1;
    return Math.max(0, Math.round((monthlyFee / daysInMonth) * remainingDays));
};
exports.calculateProratedAmount = calculateProratedAmount;
