import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "change-me-super-secret",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  textupApiKey: process.env.TEXTUP_API_KEY || "",
  textupEndpoint: process.env.TEXTUP_API_ENDPOINT || "https://api.textup.uz/v1/messages",
  textupSender: process.env.TEXTUP_SENDER || "BravePlanet",
};
