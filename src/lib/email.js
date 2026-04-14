import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "Testify <noreply@testify.edu>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// ─── Welcome / Setup Email ─────────────────────────────────────────────────

export async function sendWelcomeSetupEmail({ to, contactName, collegeName, trialEndsAt, setupToken }) {
  const setupUrl = `${APP_URL}/auth/setup-account?token=${setupToken}`;
  const trialDate = new Date(trialEndsAt).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Testify</title></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#1a1a24;border:1px solid #2a2a3e;border-radius:16px;overflow:hidden;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4f6ef7 0%,#6366f1 100%);padding:32px 40px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:20px;font-weight:700;font-style:italic;">T</span>
        </div>
        <span style="color:white;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Testify</span>
      </div>
    </div>
    <!-- Body -->
    <div style="padding:40px;">
      <h1 style="color:#f1f1f5;font-size:26px;font-weight:700;margin:0 0 8px;">Welcome, ${contactName}!</h1>
      <p style="color:#8b8ba7;font-size:15px;line-height:1.6;margin:0 0 24px;">
        <strong style="color:#f1f1f5;">${collegeName}</strong> has been set up on Testify. Your 3-day free trial is now active.
      </p>

      <!-- Trial Expiry Banner -->
      <div style="background:#2a1f0a;border:1px solid #f59e0b33;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="width:8px;height:8px;background:#f59e0b;border-radius:50%;display:inline-block;"></span>
          <p style="color:#fbbf24;font-size:13px;margin:0;">
            <strong>Trial ends:</strong> ${trialDate} at 11:59 PM
          </p>
        </div>
      </div>

      <!-- CTA -->
      <p style="color:#8b8ba7;font-size:14px;margin:0 0 20px;">
        Click below to set your account password and access your dashboard. This link expires in <strong style="color:#f1f1f5;">24 hours</strong>.
      </p>
      <a href="${setupUrl}" style="display:block;background:linear-gradient(135deg,#4f6ef7,#6366f1);color:white;text-decoration:none;border-radius:12px;padding:15px 28px;font-size:15px;font-weight:600;text-align:center;margin-bottom:24px;">
        Set Up My Account →
      </a>

      <p style="color:#5a5a72;font-size:12px;line-height:1.6;margin:0;">
        If the button doesn't work, copy this link:<br>
        <a href="${setupUrl}" style="color:#4f6ef7;word-break:break-all;">${setupUrl}</a>
      </p>
    </div>
    <!-- Footer -->
    <div style="border-top:1px solid #2a2a3e;padding:20px 40px;">
      <p style="color:#5a5a72;font-size:12px;margin:0;text-align:center;">
        © ${new Date().getFullYear()} Testify Exam Platform · You're receiving this because your institution just registered.
      </p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to Testify — Set up your account`,
    html,
  });
}

// ─── Resend Setup Link Email ───────────────────────────────────────────────

export async function sendSetupLinkEmail({ to, contactName, setupToken }) {
  const setupUrl = `${APP_URL}/auth/setup-account?token=${setupToken}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Setup Link</title></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#1a1a24;border:1px solid #2a2a3e;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#4f6ef7 0%,#6366f1 100%);padding:28px 36px;">
      <span style="color:white;font-size:20px;font-weight:700;font-style:italic;">T</span>
      <span style="color:white;font-size:18px;font-weight:700;margin-left:6px;">Testify</span>
    </div>
    <div style="padding:36px;">
      <h1 style="color:#f1f1f5;font-size:22px;font-weight:700;margin:0 0 8px;">New setup link, ${contactName}</h1>
      <p style="color:#8b8ba7;font-size:14px;line-height:1.6;margin:0 0 24px;">
        You requested a new account setup link. Click below to set your password. This link expires in <strong style="color:#f1f1f5;">24 hours</strong>.
      </p>
      <a href="${setupUrl}" style="display:block;background:linear-gradient(135deg,#4f6ef7,#6366f1);color:white;text-decoration:none;border-radius:12px;padding:14px 24px;font-size:14px;font-weight:600;text-align:center;margin-bottom:20px;">
        Set My Password →
      </a>
      <p style="color:#5a5a72;font-size:11px;">
        If you didn't request this, ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Testify — Your new account setup link",
    html,
  });
}

// ─── Trial Expired Email ───────────────────────────────────────────────────

export async function sendTrialExpiredEmail({ to, contactName, collegeName }) {
  const billingUrl = `${APP_URL}/dashboard/admin/billing`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Your trial has ended</title></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#1a1a24;border:1px solid #2a2a3e;border-radius:16px;overflow:hidden;">
    <div style="background:#1a0a0a;border-bottom:1px solid #f87171/20;padding:28px 36px;">
      <span style="color:#f87171;font-size:18px;font-weight:700;">Testify</span>
    </div>
    <div style="padding:36px;">
      <h1 style="color:#f1f1f5;font-size:22px;font-weight:700;margin:0 0 8px;">Your trial has ended</h1>
      <p style="color:#8b8ba7;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Hi ${contactName}, your 3-day free trial for <strong style="color:#f1f1f5;">${collegeName}</strong> has expired.
        Your data is safe and will be retained for 30 days.
      </p>
      <a href="${billingUrl}" style="display:block;background:#f59e0b;color:#000;text-decoration:none;border-radius:12px;padding:14px 24px;font-size:14px;font-weight:700;text-align:center;margin-bottom:20px;">
        Choose a Plan →
      </a>
      <p style="color:#5a5a72;font-size:11px;line-height:1.6;">
        Your data will be permanently deleted after 30 days of inactivity. Upgrade any time to restore full access.
      </p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${collegeName} — your Testify trial has ended`,
    html,
  });
}

// ─── Cancellation Confirmation Email ─────────────────────────────────────

export async function sendCancellationConfirmationEmail({ to, contactName, scheduledAt }) {
  const deleteDate = new Date(scheduledAt).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Cancellation Confirmed</title></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#1a1a24;border:1px solid #2a2a3e;border-radius:16px;overflow:hidden;">
    <div style="background:#1a0a0a;border-bottom:1px solid rgba(248,113,113,0.2);padding:28px 36px;">
      <span style="color:#f87171;font-size:18px;font-weight:700;">Testify</span>
    </div>
    <div style="padding:36px;">
      <h1 style="color:#f1f1f5;font-size:22px;font-weight:700;margin:0 0 8px;">Cancellation Confirmed</h1>
      <p style="color:#8b8ba7;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Hi ${contactName}, your cancellation request has been received. Your data will be retained until
        <strong style="color:#f1f1f5;">${deleteDate}</strong>. 
        You can restore your account any time before this date by contacting support.
      </p>
      <p style="color:#5a5a72;font-size:11px;line-height:1.6;">
        After this date, all data will be permanently deleted and cannot be recovered.
      </p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your Testify account cancellation is scheduled",
    html,
  });
}

// ─── Subscription Expired Email ────────────────────────────────────────────

export async function sendSubscriptionExpiredEmail({ to, contactName, collegeName }) {
  const billingUrl = `${APP_URL}/dashboard/admin/billing`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Subscription Expired</title></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#1a1a24;border:1px solid #2a2a3e;border-radius:16px;overflow:hidden;">
    <div style="background:#1a0a0a;border-bottom:1px solid rgba(248,113,113,0.2);padding:28px 36px;">
      <span style="color:#f87171;font-size:18px;font-weight:700;">Testify</span>
    </div>
    <div style="padding:36px;">
      <h1 style="color:#f1f1f5;font-size:22px;font-weight:700;margin:0 0 8px;">Your subscription has expired</h1>
      <p style="color:#8b8ba7;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Hi ${contactName}, the subscription for <strong style="color:#f1f1f5;">${collegeName}</strong> has lapsed.
        Your account is now suspended. Renew to restore full access — your data is safe.
      </p>
      <a href="${billingUrl}" style="display:block;background:#f59e0b;color:#000;text-decoration:none;border-radius:12px;padding:14px 24px;font-size:14px;font-weight:700;text-align:center;margin-bottom:20px;">
        Renew Now →
      </a>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${collegeName} — your Testify subscription has expired`,
    html,
  });
}

// ─── Setup Reminder Email (Day 3 no-setup) ────────────────────────────────

export async function sendSetupReminderEmail({ to, contactName, collegeName, setupToken }) {
  const setupUrl = `${APP_URL}/auth/setup-account?token=${setupToken}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Complete your setup</title></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#1a1a24;border:1px solid #2a2a3e;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#4f6ef7 0%,#6366f1 100%);padding:28px 36px;">
      <span style="color:white;font-size:18px;font-weight:700;">Testify</span>
    </div>
    <div style="padding:36px;">
      <h1 style="color:#f1f1f5;font-size:22px;font-weight:700;margin:0 0 8px;">Don't forget to finish setup, ${contactName}!</h1>
      <p style="color:#8b8ba7;font-size:14px;line-height:1.6;margin:0 0 20px;">
        <strong style="color:#f1f1f5;">${collegeName}</strong> is registered but you haven't set your password yet. 
        Your trial is running — don't miss it!
      </p>
      <a href="${setupUrl}" style="display:block;background:linear-gradient(135deg,#4f6ef7,#6366f1);color:white;text-decoration:none;border-radius:12px;padding:14px 24px;font-size:14px;font-weight:600;text-align:center;margin-bottom:20px;">
        Complete Setup →
      </a>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Reminder: Complete your Testify account setup`,
    html,
  });
}
export async function sendTeacherWelcomeEmail({ to, name, tempPassword, collegeName }) {
  const loginUrl = `${APP_URL}/login`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Your Faculty Credentials</title></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#1a1a24;border:1px solid #2a2a3e;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#4f6ef7 0%,#6366f1 100%);padding:28px 36px;">
      <span style="color:white;font-size:18px;font-weight:700;">Testify</span>
    </div>
    <div style="padding:36px;">
      <h1 style="color:#f1f1f5;font-size:22px;font-weight:700;margin:0 0 8px;">Welcome to ${collegeName}, ${name}!</h1>
      <p style="color:#8b8ba7;font-size:14px;line-height:1.6;margin:0 0 24px;">
        You have been registered as a Faculty member on the Testify Exam Platform. 
        Please use the following temporary credentials to log in.
      </p>

      <div style="background:#232333;border:1px solid #33334d;border-radius:12px;padding:20px;margin-bottom:28px;">
        <p style="color:#8b8ba7;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Login Details</p>
        <div style="margin-bottom:12px;">
          <span style="color:#5a5a72;font-size:13px;">Email:</span>
          <br>
          <strong style="color:#f1f1f5;font-size:15px;">${to}</strong>
        </div>
        <div>
          <span style="color:#5a5a72;font-size:13px;">Temporary Password:</span>
          <br>
          <strong style="color:#f1f1f5;font-size:15px;letter-spacing:1px;">${tempPassword}</strong>
        </div>
      </div>

      <p style="color:#fbbf24;font-size:13px;background:rgba(251,191,36,0.1);padding:12px;border-radius:8px;border:1px solid rgba(251,191,36,0.2);margin-bottom:24px;">
        <strong>Note:</strong> You will be required to change this password immediately after your first login.
      </p>

      <a href="${loginUrl}" style="display:block;background:linear-gradient(135deg,#4f6ef7,#6366f1);color:white;text-decoration:none;border-radius:12px;padding:14px 24px;font-size:14px;font-weight:600;text-align:center;">
        Log In to Dashboard →
      </a>
    </div>
    <div style="border-top:1px solid #2a2a3e;padding:20px 40px;">
      <p style="color:#5a5a72;font-size:12px;margin:0;text-align:center;">
        © Testify Exam Platform · Secure institutional access
      </p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your Faculty Access — ${collegeName}`,
    html,
  });
}
