import sgMail from '@sendgrid/mail';
import { getBrand } from '../lib/brand';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const BRAND = getBrand();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = BRAND.fromEmail;

  static async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured, email sending disabled');
      return false;
    }

    try {
      const msg = {
        to: options.to,
        from: options.from || this.FROM_EMAIL,
        subject: options.subject,
        html: options.html,
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // GDPR Data Export Email
  static async sendDataExportEmail(userEmail: string, downloadUrl: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Your ${BRAND.name} Data Export is Ready</h2>
        <p>Hello,</p>
        <p>Your personal data export has been processed and is ready for download.</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">
          <h3>What's included:</h3>
          <ul>
            <li>Profile information</li>
            <li>Dog listings</li>
            <li>Messages and conversations</li>
            <li>Posts and comments</li>
            <li>Reviews and favorites</li>
            <li>Transaction history</li>
          </ul>
        </div>
        <p style="margin: 30px 0;">
          <a href="${downloadUrl}" style="background-color: #3B82F6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Download Your Data
          </a>
        </p>
        <p style="color: #6B7280; font-size: 14px;">
          This download link will expire in 24 hours for security purposes.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 12px;">
          This email was sent in response to your data export request on ${BRAND.name}.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Your ${BRAND.name} Data Export is Ready`,
      html
    });
  }

  // Account Deletion Confirmation Email
  static async sendAccountDeletionEmail(userEmail: string, username: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">Account Deletion Confirmation</h2>
        <p>Hello ${username},</p>
        <p>Your ${BRAND.name} account has been successfully deleted as requested.</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #FEF2F2; border-radius: 8px; border-left: 4px solid #DC2626;">
          <h3>What was deleted:</h3>
          <ul>
            <li>Your profile and personal information</li>
            <li>All dog listings</li>
            <li>Messages and conversations</li>
            <li>Posts, comments, and social interactions</li>
            <li>Reviews and favorites</li>
          </ul>
        </div>
        <p>We're sorry to see you go. If you have any feedback about your experience, please don't hesitate to reach out to our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 12px;">
          Thank you for being part of the ${BRAND.name} community.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `${BRAND.name} Account Deletion Confirmation`,
      html
    });
  }

  // Support Ticket Response Email
  static async sendSupportResponseEmail(
    userEmail: string, 
    ticketId: string, 
    subject: string, 
    response: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Support Ticket Update - #${ticketId}</h2>
        <p>Hello,</p>
        <p>We've responded to your support ticket regarding: <strong>${subject}</strong></p>
        <div style="margin: 20px 0; padding: 20px; background-color: #F3F4F6; border-radius: 8px;">
          <h3>Our Response:</h3>
          <p>${response}</p>
        </div>
        <p>If you need further assistance, please reply to this email or visit your support dashboard.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 12px;">
          ${BRAND.name} Support Team
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Support Update - #${ticketId}`,
      html
    });
  }

  // Welcome Email for New Users
  static async sendWelcomeEmail(userEmail: string, username: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6; text-align: center;">Welcome to ${BRAND.name}! 🐕</h1>
        <p>Hello ${username},</p>
        <p>Welcome to the ${BRAND.name} community! We're excited to have you join our platform connecting dog lovers, breeders, and pet enthusiasts.</p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #F0F9FF; border-radius: 8px;">
          <h3>Get Started:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Complete your profile to build trust with other users</li>
            <li>Browse available puppies in our marketplace</li>
            <li>Join breed-specific community groups</li>
            <li>Connect with other dog lovers through messaging</li>
          </ul>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="${BRAND.appUrl}"
             style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Explore ${BRAND.name}
          </a>
        </div>

        <p>If you have any questions, our support team is here to help!</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 12px; text-align: center;">
          The ${BRAND.name} Team
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Welcome to ${BRAND.name} - Find Your Perfect Puppy Companion!`,
      html
    });
  }
}