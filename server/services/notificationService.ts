import { supabase } from '../lib/supabase.js';
import sgMail from '@sendgrid/mail';

// Set up SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

type NotificationType =
  | 'like' | 'comment' | 'follow' | 'message'
  | 'order_paid' | 'order_refund'
  | 'provider_app_submitted' | 'provider_app_approved' | 'provider_app_rejected';

interface NotifyArgs {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  entityTable?: string;
  entityId?: string;
  message: string;
  meta?: Record<string, any>;
}

export async function createNotification(args: NotifyArgs) {
  const { recipientId, actorId, type, entityTable, entityId, message, meta } = args;
  
  console.log('[NOTIFICATION] Creating notification:', { type, recipientId, message });

  try {
    // Insert notification into database
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: recipientId,
        actor_id: actorId || null,
        type,
        entity_table: entityTable || null,
        entity_id: entityId || null,
        message,
        meta: meta || {}
      })
      .select('*')
      .single();

    if (error) {
      console.error('[NOTIFICATION] Error creating notification:', error);
      throw error;
    }

    console.log('[NOTIFICATION] Created notification:', notification);

    // Log notification event
    await logNotificationEvent(recipientId, 'in_app', type, notification, 'sent');

    return notification;
  } catch (error) {
    console.error('[NOTIFICATION] Failed to create notification:', error);
    await logNotificationEvent(recipientId, 'in_app', type, { error: String(error) }, 'failed', String(error));
    throw error;
  }
}

export async function notifyAdminNewApplication(application: any) {
  const adminEmail = await getAdminEmail();
  const adminUserId = await getAdminUserId();
  
  console.log('[NOTIFICATION] Notifying admin of new application:', application.id);

  // Create in-app notification for admin
  if (adminUserId) {
    await createNotification({
      recipientId: adminUserId,
      actorId: application.user_id,
      type: 'provider_app_submitted',
      entityTable: 'provider_applications',
      entityId: application.id,
      message: 'New provider application submitted',
      meta: { providerId: application.provider_id }
    });
  }

  // Send email notification
  if (process.env.SENDGRID_API_KEY && adminEmail) {
    const subject = 'New Provider Application Submitted - MY PUP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Provider Application</h2>
        <p>A new provider application has been submitted and requires your review.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Application ID:</strong> ${application.id}</p>
          <p><strong>Provider ID:</strong> ${application.provider_id}</p>
          <p><strong>Submitted:</strong> ${new Date(application.submitted_at).toLocaleString()}</p>
        </div>
        <p>Please review this application in the Admin Inbox.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/admin/inbox" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Application
          </a>
        </div>
      </div>`;

    try {
      await sgMail.send({
        to: adminEmail,
        from: process.env.SENDGRID_FROM || 'noreply@mypup.app',
        subject,
        html
      });
      console.log('[NOTIFICATION] Email sent to admin:', adminEmail);
      await logNotificationEvent(null, 'email', 'provider_application_received', application, 'sent');
    } catch (error) {
      console.error('[NOTIFICATION] Email failed:', error);
      await logNotificationEvent(null, 'email', 'provider_application_received', application, 'failed', String(error));
    }
  }

  // Send SMS notification (if Twilio is configured)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.ADMIN_NOTIFY_PHONE) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      await client.messages.create({
        to: process.env.ADMIN_NOTIFY_PHONE,
        from: process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM,
        body: `MY PUP: New provider application submitted (ID: ${application.id.slice(0, 8)}...). Review in admin inbox.`
      });
      
      console.log('[NOTIFICATION] SMS sent to admin');
      await logNotificationEvent(null, 'sms', 'provider_application_received', application, 'sent');
    } catch (error) {
      console.error('[NOTIFICATION] SMS failed:', error);
      await logNotificationEvent(null, 'sms', 'provider_application_received', application, 'failed', String(error));
    }
  }
}

export async function notifyApplicantResult(application: any) {
  console.log('[NOTIFICATION] Notifying applicant of result:', application.id, application.status);

  try {
    // Get provider and user info
    const { data: provider } = await supabase
      .from('providers')
      .select('user_id')
      .eq('id', application.provider_id)
      .single();

    if (!provider) {
      console.error('[NOTIFICATION] Provider not found for application:', application.id);
      return;
    }

    const { data: user } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', provider.user_id)
      .single();

    if (!user) {
      console.error('[NOTIFICATION] User not found for provider:', provider.user_id);
      return;
    }

    // Create in-app notification
    await createNotification({
      recipientId: provider.user_id,
      type: application.status === 'approved' ? 'provider_app_approved' : 'provider_app_rejected',
      entityTable: 'provider_applications',
      entityId: application.id,
      message: application.status === 'approved' 
        ? 'Your provider application was approved!' 
        : 'Your provider application was reviewed',
      meta: { 
        status: application.status, 
        notes: application.review_notes 
      }
    });

    // Send email notification
    if (process.env.SENDGRID_API_KEY && user.email) {
      const subject = application.status === 'approved' 
        ? 'Provider Application Approved - MY PUP' 
        : 'Provider Application Update - MY PUP';
        
      const html = application.status === 'approved'
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e;">Congratulations! Your Provider Application was Approved</h2>
            <p>Hi ${user.full_name || 'there'},</p>
            <p>Great news! Your provider application has been approved and you can now start offering services on MY PUP.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/marketplace" 
                 style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Start Offering Services
              </a>
            </div>
            <p>Welcome to the MY PUP provider community!</p>
          </div>`
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Provider Application Update</h2>
            <p>Hi ${user.full_name || 'there'},</p>
            <p>Your provider application has been reviewed.</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Status:</strong> ${application.status}</p>
              ${application.review_notes ? `<p><strong>Notes:</strong> ${application.review_notes}</p>` : ''}
            </div>
            <p>If you have any questions, please contact our support team.</p>
          </div>`;

      try {
        await sgMail.send({
          to: user.email,
          from: process.env.SENDGRID_FROM || 'noreply@mypup.app',
          subject,
          html
        });
        console.log('[NOTIFICATION] Result email sent to applicant:', user.email);
        await logNotificationEvent(provider.user_id, 'email', 'provider_application_result', application, 'sent');
      } catch (error) {
        console.error('[NOTIFICATION] Result email failed:', error);
        await logNotificationEvent(provider.user_id, 'email', 'provider_application_result', application, 'failed', String(error));
      }
    }

  } catch (error) {
    console.error('[NOTIFICATION] Failed to notify applicant:', error);
  }
}

async function logNotificationEvent(
  userId: string | null, 
  kind: string, 
  template: string, 
  payload: any, 
  status: string, 
  error?: string
) {
  try {
    await supabase.from('notification_events').insert({
      user_id: userId,
      kind,
      template,
      payload,
      status,
      error: error || null
    });
  } catch (err) {
    console.error('[NOTIFICATION] Failed to log event:', err);
  }
}

async function getAdminEmail(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('admin_settings')
      .select('notify_email')
      .limit(1)
      .single();
    
    return data?.notify_email || process.env.ADMIN_NOTIFY_EMAIL || 'admin@mypup.app';
  } catch {
    return process.env.ADMIN_NOTIFY_EMAIL || 'admin@mypup.app';
  }
}

async function getAdminUserId(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
      .single();
    
    return data?.id || null;
  } catch {
    return null;
  }
}