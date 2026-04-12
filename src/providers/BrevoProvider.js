/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendVerifyEmail = async ( recipientEmail, customSubject, customHtmlContent ) => {
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  // tài khoản gừi mail
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // những tài khoản nhận mail
  sendSmtpEmail.to = [{ email: recipientEmail }]

  // tiêu đề mail
  sendSmtpEmail.subject = customSubject

  // nội dung mail
  sendSmtpEmail.htmlContent = customHtmlContent

  // gọi tới api của brevo để gửi mail
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendVerifyEmail
}
