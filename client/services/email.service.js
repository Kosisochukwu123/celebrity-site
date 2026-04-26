const nodemailer = require('nodemailer');

// ── Transporter ───────────────────────────────────────────
// Uses env vars — set these in Render dashboard:
//   EMAIL_HOST     e.g. smtp.gmail.com
//   EMAIL_PORT     e.g. 587
//   EMAIL_USER     your sending email
//   EMAIL_PASS     app password (Gmail: generate in Google Account → Security)
//   EMAIL_FROM     "Alex Sterling Foundation <noreply@yourdomain.com>"
const createTransporter = () => nodemailer.createTransport({
  host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Shared HTML wrapper ───────────────────────────────────
const wrap = (body) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Alex Sterling Foundation</title>
</head>
<body style="margin:0;padding:0;background:#0E0C09;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0C09;padding:40px 20px;">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;background:#1A1510;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#1C1810,#251E10);padding:28px 36px;border-bottom:1px solid rgba(201,168,76,0.15);">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#C9A84C;">Alex Sterling Foundation</p>
          <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#F5F0E8;line-height:1.2;">Members Portal</h1>
        </td>
      </tr>

      <!-- Body -->
      <tr><td style="padding:32px 36px;">
        ${body}
      </td></tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 36px 28px;border-top:1px solid rgba(245,240,232,0.06);">
          <p style="margin:0;font-size:11px;color:rgba(245,240,232,0.25);line-height:1.6;">
            This email was sent by the Alex Sterling Foundation.<br/>
            If you did not sign up for a membership, please ignore this email.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

// ── Helper: coloured status pill ─────────────────────────
const pill = (text, color) =>
  `<span style="display:inline-block;padding:4px 12px;background:${color}22;border:1px solid ${color}55;border-radius:3px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${color};">${text}</span>`;

// ── Helper: info row ──────────────────────────────────────
const infoRow = (label, value) => `
<tr>
  <td style="padding:8px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(245,240,232,0.3);width:120px;vertical-align:top;">${label}</td>
  <td style="padding:8px 0;font-size:14px;color:rgba(245,240,232,0.8);vertical-align:top;">${value}</td>
</tr>`;

// ── Helper: CTA button ────────────────────────────────────
const ctaBtn = (text, url, color = '#C9A84C') =>
  `<a href="${url}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:${color};color:#0E0C09;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-decoration:none;border-radius:3px;">${text}</a>`;

// ═══════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════

// 1. Payment submitted — sent immediately after user submits
const paymentSubmittedTemplate = ({ name, tier, tierPrice, method, methodDetail }) => ({
  subject: `Payment Received — ${tier} Membership | Alex Sterling Foundation`,
  html: wrap(`
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;">Payment Confirmation</p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#F5F0E8;line-height:1.2;">
      We've received your payment, ${name.split(' ')[0]}.
    </h2>

    <p style="margin:0 0 24px;font-size:14px;color:rgba(245,240,232,0.6);line-height:1.8;">
      Thank you for supporting the Alex Sterling Foundation. Your ${tier} membership payment has been received and is now being reviewed by our team.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(245,240,232,0.03);border:1px solid rgba(245,240,232,0.08);border-radius:4px;padding:16px 20px;margin-bottom:24px;">
      <tbody>
        ${infoRow('Membership', tier)}
        ${infoRow('Amount', tierPrice + ' / year')}
        ${infoRow('Method', methodDetail)}
        ${infoRow('Status', pill('Under Review', '#C9A84C'))}
      </tbody>
    </table>

    <div style="background:rgba(29,158,117,0.06);border:1px solid rgba(29,158,117,0.2);border-radius:4px;padding:16px 20px;margin-bottom:8px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1D9E75;">What happens next</p>
      <p style="margin:0;font-size:13px;color:rgba(245,240,232,0.55);line-height:1.7;">
        Our team will verify your payment within <strong style="color:#F5F0E8;">24–48 hours</strong>. Once approved, your membership will be activated and you'll receive a confirmation email with full access details.
      </p>
    </div>

    <p style="margin:16px 0 0;font-size:12px;color:rgba(245,240,232,0.3);line-height:1.6;">
      Questions? Use the live chat inside your member portal or reply to this email.
    </p>
  `),
});

// 2. Payment approved — sent when admin clicks Approve
const paymentApprovedTemplate = ({ name, tier, tierPrice, siteUrl }) => ({
  subject: `🎉 Membership Activated — Welcome to ${tier} | Alex Sterling Foundation`,
  html: wrap(`
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#1D9E75;">Membership Activated</p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#F5F0E8;line-height:1.2;">
      You're in, ${name.split(' ')[0]}. Welcome to the Foundation.
    </h2>

    <p style="margin:0 0 24px;font-size:14px;color:rgba(245,240,232,0.6);line-height:1.8;">
      Your <strong style="color:#F5F0E8;">${tier} membership</strong> has been verified and is now fully active. You now have access to all member benefits including exclusive events, the private gallery, impact reports, and more.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(29,158,117,0.04);border:1px solid rgba(29,158,117,0.2);border-radius:4px;padding:16px 20px;margin-bottom:24px;">
      <tbody>
        ${infoRow('Membership', tier)}
        ${infoRow('Amount', tierPrice + ' / year')}
        ${infoRow('Status', pill('Active', '#1D9E75'))}
      </tbody>
    </table>

    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#F5F0E8;">What you can access now:</p>
    <ul style="margin:0 0 24px;padding-left:20px;color:rgba(245,240,232,0.55);font-size:13px;line-height:2;">
      <li>Upcoming events with live countdown timers</li>
      <li>Private member photo gallery</li>
      <li>Full documentary library</li>
      <li>Annual impact reports</li>
      <li>Physical membership card delivery (see portal for address settings)</li>
    </ul>

    ${ctaBtn('Go to Members Portal', siteUrl + '/members')}
  `),
});

// 3. Payment rejected — sent when admin clicks Reject
const paymentRejectedTemplate = ({ name, tier, adminNote, siteUrl }) => ({
  subject: `Payment Review Update — ${tier} Membership | Alex Sterling Foundation`,
  html: wrap(`
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#E24B4A;">Payment Update</p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#F5F0E8;line-height:1.2;">
      We were unable to verify your payment, ${name.split(' ')[0]}.
    </h2>

    <p style="margin:0 0 24px;font-size:14px;color:rgba(245,240,232,0.6);line-height:1.8;">
      Unfortunately, our team was unable to verify your <strong style="color:#F5F0E8;">${tier} membership</strong> payment. This can happen if the transaction hash was incorrect, the gift card image was unclear, or the card had already been redeemed.
    </p>

    ${adminNote ? `
    <div style="background:rgba(226,75,74,0.06);border:1px solid rgba(226,75,74,0.2);border-radius:4px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(226,75,74,0.7);">Note from our team</p>
      <p style="margin:0;font-size:13px;color:rgba(245,240,232,0.6);line-height:1.7;">${adminNote}</p>
    </div>` : ''}

    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#F5F0E8;">What you can do:</p>
    <ul style="margin:0 0 24px;padding-left:20px;color:rgba(245,240,232,0.55);font-size:13px;line-height:2;">
      <li>Submit a new payment with a valid transaction hash or clear gift card photo</li>
      <li>Use the live chat to speak with our team directly</li>
      <li>Reply to this email for further assistance</li>
    </ul>

    ${ctaBtn('Try Again', siteUrl + '/membership', '#C0152A')}
  `),
});

// ═══════════════════════════════════════════════════════════
// SEND FUNCTION
// ═══════════════════════════════════════════════════════════
const sendEmail = async ({ to, subject, html }) => {
  // Silently skip if email is not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[email] Not configured — skipping email to ${to}: "${subject}"`);
    return;
  }
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Alex Sterling Foundation" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[email] Sent to ${to}: ${info.messageId}`);
  } catch (err) {
    // Log but don't crash the server — email is non-critical
    console.error(`[email] Failed to send to ${to}:`, err.message);
  }
};

module.exports = {
  sendEmail,
  paymentSubmittedTemplate,
  paymentApprovedTemplate,
  paymentRejectedTemplate,
};