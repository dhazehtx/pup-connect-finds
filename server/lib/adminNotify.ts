import { supabaseAdmin } from './supabaseAdmin';
import { sendEmail } from './email';

const ADMIN_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);

export async function notifyAdmins(type: string, payload: any) {
  // 1) In-app notifications for every admin user_id
  const rows = ADMIN_IDS.map(user_id => ({ user_id, type, payload }));
  if (rows.length) {
    const { error } = await supabaseAdmin.from('notifications').insert(rows);
    if (error) console.error('[notifyAdmins] insert error', error.message);
  }

  // 2) Email blast to admin addresses
  if (ADMIN_EMAILS.length) {
    const subjectMap: Record<string,string> = {
      provider_submitted: 'New provider application submitted',
      provider_approved:  'Provider approved',
      provider_rejected:  'Provider rejected',
    };
    const subject = subjectMap[type] || `Admin notice: ${type}`;
    const html = `
      <div style="font-family:system-ui,Arial">
        <h2>${subject}</h2>
        <pre style="background:#f6f6f6;padding:12px;border-radius:8px">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
        <p><a href="${process.env.BASE_URL || ''}/admin">Open Admin Dashboard</a></p>
      </div>`.trim();
    await sendEmail(ADMIN_EMAILS, subject, html);
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
}
