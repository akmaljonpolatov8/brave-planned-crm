"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    port: Number(process.env.PORT || 4000),
    jwtSecret: process.env.JWT_SECRET || "change-me-super-secret",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    textupApiKey: process.env.TEXTUP_API_KEY || "",
    textupEndpoint: process.env.TEXTUP_API_ENDPOINT || "https://api.textup.uz/v1/messages",
    textupSender: process.env.TEXTUP_SENDER || "BravePlanet",
};
