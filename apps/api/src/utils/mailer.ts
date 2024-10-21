import { ENV } from "@env"
import { createTransport } from "nodemailer"

export const mailer = createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: ENV.GMAIL_EMAIL,
    pass: ENV.GMAIL_APP_PASSWORD,
  },
})
