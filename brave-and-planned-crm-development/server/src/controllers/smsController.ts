import { Request, Response } from "express";
import { smsService } from "../services/smsService";

export async function sendTestSms(req: Request, res: Response) {
  const { phone, message } = req.body;
  const result = await smsService.sendSMS(phone, message);
  return res.json(result);
}
