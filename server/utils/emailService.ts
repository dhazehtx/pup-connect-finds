import sgMail from '@sendgrid/mail';

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async ({ to, subject, html, from }: EmailData): Promise<boolean> => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email send');
    return false;
  }

  try {
    const msg = {
      to,
      from: from || process.env.FROM_EMAIL || 'noreply@mypup.com',
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log('Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  dataExportComplete: (username: string, downloadUrl: string) => ({
    subject: 'Your MY PUP Data Export is Ready',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb;">Data Export Complete</h2>
        <p>Hi ${username},</p>
        <p>Your personal data export from MY PUP has been prepared and is ready for download.</p>
        <p style="background: #f3f4f6; padding: 16px; border-radius: 8px;">
          <strong>Download Link:</strong><br>
          <a href="${downloadUrl}" style="color: #2563eb;">Download Your Data</a>
        </p>
        <p><small>This link will expire in 7 days for security purposes.</small></p>
        <p>If you have any questions about your data export, please contact our support team.</p>
        <p>Best regards,<br>The MY PUP Team</p>
      </div>
    `
  }),

  accountDeleted: (username: string) => ({
    subject: 'MY PUP Account Deletion Confirmation',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626;">Account Deletion Confirmed</h2>
        <p>Hi ${username},</p>
        <p>This email confirms that your MY PUP account and all associated data have been permanently deleted as requested.</p>
        <div style="background: #fef2f2; padding: 16px; border-radius: 8px; border-left: 4px solid #dc2626;">
          <p><strong>What was deleted:</strong></p>
          <ul>
            <li>Your profile and account information</li>
            <li>All pet listings and posts</li>
            <li>Messages and conversations</li>
            <li>Comments, likes, and social interactions</li>
            <li>Favorites, reviews, and notifications</li>
          </ul>
        </div>
        <p>If you did not request this deletion, please contact our support team immediately.</p>
        <p>Thank you for being part of the MY PUP community.</p>
        <p>Best regards,<br>The MY PUP Team</p>
      </div>
    `
  }),

  supportTicketCreated: (ticketId: string, subject: string) => ({
    subject: `Support Ticket Created: ${subject}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb;">Support Ticket Created</h2>
        <p>Your support ticket has been successfully created and assigned ID: <strong>${ticketId}</strong></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>Our support team will review your request and respond within 24-48 hours.</p>
        <p>You can check the status of your ticket in your account settings.</p>
        <p>Best regards,<br>The MY PUP Support Team</p>
      </div>
    `
  })
};