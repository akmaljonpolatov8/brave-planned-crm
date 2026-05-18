"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestSms = sendTestSms;
const smsService_1 = require("../services/smsService");
async function sendTestSms(req, res) {
    const { phone, message } = req.body;
    const result = await smsService_1.smsService.sendSMS(phone, message);
    return res.json(result);
}
