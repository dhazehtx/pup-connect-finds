/**
 * Email sending via SendGrid (or no-op if SENDGRID_API_KEY is not set).
 * Set SENDGRID_API_KEY and SENDGRID_FROM (e.g. noreply@yourapp.com) in env.
 */
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'noreply@pupconnect.com';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[sendEmail] No SENDGRID_API_KEY; skipping email:', options.subject, 'to', options.to);
    }
    return false;
  }
  try {
    const sg = await import('@sendgrid/mail');
    sg.default.setApiKey(SENDGRID_API_KEY);
    await sg.default.send({
      to: options.to,
      from: SENDGRID_FROM,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text.replace(/\n/g, '<br>'),
    });
    return true;
  } catch (e: any) {
    console.error('[sendEmail]', e?.message || e);
    return false;
  }
}
