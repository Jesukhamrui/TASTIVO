const nodemailer = require('nodemailer');

const MAIL_PLACEHOLDER_VALUES = new Set([
  'yourgmailaddress@gmail.com',
  'your-real-gmail-address@gmail.com',
  'your-gmail-app-password',
  'your-16-character-google-app-password',
]);

function getMailConfigIssues() {
  const issues = [];
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM;

  if (!smtpHost) issues.push('SMTP_HOST is missing');
  if (!smtpPort) issues.push('SMTP_PORT is missing');
  if (!smtpUser) issues.push('SMTP_USER is missing');
  if (!smtpPass) issues.push('SMTP_PASS is missing');

  if (smtpUser && MAIL_PLACEHOLDER_VALUES.has(smtpUser.trim())) {
    issues.push('SMTP_USER still has the placeholder Gmail address');
  }

  if (smtpPass && MAIL_PLACEHOLDER_VALUES.has(smtpPass.trim())) {
    issues.push('SMTP_PASS still has the placeholder Gmail app password');
  }

  if (mailFrom && MAIL_PLACEHOLDER_VALUES.has(mailFrom.trim())) {
    issues.push('MAIL_FROM still has the placeholder Gmail address');
  }

  return issues;
}

function isGmailAppPasswordError(error) {
  const responseText = String(error?.response || error?.message || '');
  return error?.code === 'EAUTH' && /Application-specific password required|534-5\.7\.9|5\.7\.9/i.test(responseText);
}

function normalizeMailError(error, actionLabel) {
  if (isGmailAppPasswordError(error)) {
    const wrappedError = new Error(
      `${actionLabel} failed because Gmail rejected the password. Use a Google app password for SMTP_PASS, not your normal Gmail login password.`
    );
    wrappedError.statusCode = 502;
    wrappedError.code = 'GMAIL_APP_PASSWORD_REQUIRED';
    return wrappedError;
  }

  return error;
}

function getMailTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

async function validateMailConfigAtStartup() {
  const issues = getMailConfigIssues();

  if (issues.length > 0) {
    console.warn(
      `SMTP is not ready yet: ${issues.join(', ')}. The server will start, but email-based login and password reset will fail until backend/.env is configured.`
    );
    return false;
  }

  const transporter = getMailTransporter();

  if (!transporter) {
    console.warn('SMTP is not configured. The server will start without email delivery support.');
    return false;
  }

  try {
    await transporter.verify();
    return true;
  } catch (error) {
    const normalizedError = normalizeMailError(error, 'SMTP startup verification');
    console.warn(normalizedError.message);
    return false;
  }
}

async function sendLoginCodeEmail(email, code) {
  const transporter = getMailTransporter();

  if (!transporter) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in backend/.env to send login codes by email.');
  }

  const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: 'Your Tastivo login code',
      text: `Your Tastivo login code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your Tastivo login code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });
  } catch (error) {
    throw normalizeMailError(error, 'Login code email');
  }
}

async function sendPasswordResetCodeEmail(email, code) {
  const transporter = getMailTransporter();

  if (!transporter) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in backend/.env to send password reset codes by email.');
  }

  const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: 'Your Tastivo password reset code',
      text: `Your Tastivo password reset code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your Tastivo password reset code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });
  } catch (error) {
    throw normalizeMailError(error, 'Password reset code email');
  }
}

module.exports = {
  getMailConfigIssues,
  validateMailConfigAtStartup,
  sendLoginCodeEmail,
  sendPasswordResetCodeEmail,
};