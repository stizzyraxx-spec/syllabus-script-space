import { Resend } from 'resend';

const SUPPORT_TO = 'support@cloutfinder.com';
const SUPPORT_FROM = 'The Condition of Man <support@theconditionofman.com>';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, subject, message, user_email } = req.body ?? {};
    if (!email || !subject || !message) {
      return res.status(400).json({ error: 'Email, subject, and message are required' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('submitSupport: RESEND_API_KEY missing');
      return res.status(500).json({
        error: 'Email service is not configured. Please contact support@cloutfinder.com directly.',
      });
    }

    const resend = new Resend(apiKey);
    const html = `
      <div style="font-family: -apple-system, system-ui, sans-serif; line-height: 1.5; color: #111;">
        <h2 style="margin: 0 0 8px;">New Support Request — The Condition of Man</h2>
        <p style="margin: 0 0 16px; color: #555;">Submitted from theconditionofman.com</p>
        <table style="border-collapse: collapse; margin: 0 0 16px;">
          <tr><td style="padding: 4px 12px 4px 0; color: #666;">From email:</td><td><strong>${escape(email)}</strong></td></tr>
          ${user_email ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Logged-in user:</td><td>${escape(user_email)}</td></tr>` : ''}
          <tr><td style="padding: 4px 12px 4px 0; color: #666;">Subject:</td><td><strong>${escape(subject)}</strong></td></tr>
        </table>
        <div style="padding: 16px; background: #f8f8f8; border-left: 3px solid #fbbf24; white-space: pre-wrap;">${escape(message)}</div>
      </div>
    `.trim();

    const { data, error } = await resend.emails.send({
      from: SUPPORT_FROM,
      to: SUPPORT_TO,
      reply_to: email,
      subject: `[TCOM Support] ${subject}`,
      html,
      text: `From: ${email}${user_email ? ` (signed-in: ${user_email})` : ''}\nSubject: ${subject}\n\n${message}`,
    });

    if (error) {
      console.error('submitSupport Resend error:', error);
      return res.status(500).json({ error: error.message || 'Failed to send support email' });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('submitSupport error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

function escape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
