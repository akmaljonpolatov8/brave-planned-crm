import axios from "axios";
import { env } from "../config/env";

export interface SmsProvider {
  sendSMS(phone: string, message: string): Promise<unknown>;
}

class TextUpProvider implements SmsProvider {
  async sendSMS(phone: string, message: string) {
    const response = await axios.post(
      env.textupEndpoint,
      {
        phone,
        message,
        from: env.textupSender,
      },
      {
        headers: {
          Authorization: `Bearer ${env.textupApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  }
}

export class SmsService {
  constructor(private provider: SmsProvider) {}

  sendSMS(phone: string, message: string) {
    return this.provider.sendSMS(phone, message);
  }
}

export const smsService = new SmsService(new TextUpProvider());
