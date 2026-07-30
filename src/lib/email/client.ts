import { Resend } from 'resend';
import { logger } from '@/lib/logger';

const resendApiKey = process.env.RESEND_API_KEY || 're_mock_key';
export const resendClient = new Resend(resendApiKey);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const from = options.from || 'Quantum Reach Media <notifications@quantumreachmedia.com>';

  if (!process.env.RESEND_API_KEY) {
    logger.info({ to: options.to, subject: options.subject }, 'RESEND_API_KEY missing. Simulated email send.');
    return { id: 'mock-email-id-dev' };
  }

  try {
    const data = await resendClient.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info({ id: data.data?.id, to: options.to }, 'Email sent successfully via Resend');
    return data;
  } catch (error) {
    logger.error({ error, to: options.to }, 'Failed to send email via Resend');
    throw error;
  }
}
