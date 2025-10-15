import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-key')

export interface EmailData {
  to: string
  subject: string
  messageId: string
  messageUrl: string
}

export async function sendSecretMessageEmail({
  to,
  subject = 'You have received a secret message',
  messageId,
  messageUrl
}: EmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Secret Message <noreply@yourdomain.com>',
      to: [to],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You have received a secret message!</h2>
          <p>Someone has sent you a confidential message that will expire after being read.</p>
          <p>Click the link below to view your message:</p>
          <a href="${messageUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            View Secret Message
          </a>
          <p style="color: #666; font-size: 14px;">
            This message will be permanently deleted after you read it.
          </p>
          <p style="color: #999; font-size: 12px;">
            Message ID: ${messageId}
          </p>
        </div>
      `,
      text: `
        You have received a secret message!
        
        Someone has sent you a confidential message that will expire after being read.
        
        Visit this link to view your message: ${messageUrl}
        
        This message will be permanently deleted after you read it.
        
        Message ID: ${messageId}
      `
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}