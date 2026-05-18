"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.SmsService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
class TextUpProvider {
    async sendSMS(phone, message) {
        const response = await axios_1.default.post(env_1.env.textupEndpoint, {
            phone,
            message,
            from: env_1.env.textupSender,
        }, {
            headers: {
                Authorization: `Bearer ${env_1.env.textupApiKey}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
}
class SmsService {
    constructor(provider) {
        this.provider = provider;
    }
    sendSMS(phone, message) {
        return this.provider.sendSMS(phone, message);
    }
}
exports.SmsService = SmsService;
exports.smsService = new SmsService(new TextUpProvider());
