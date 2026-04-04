/**
 * Email notification service
 * This is a placeholder implementation. In production, integrate with SendGrid, AWS SES, or similar.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email notification
 * TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Placeholder implementation - logs to console
    console.log('[EMAIL] Sending email to:', options.to);
    console.log('[EMAIL] Subject:', options.subject);
    console.log('[EMAIL] HTML:', options.html);
    
    // In production, call your email service API here
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: options.to,
    //   from: process.env.SENDER_EMAIL,
    //   subject: options.subject,
    //   html: options.html,
    // });
    
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error);
    return false;
  }
}

/**
 * Send fee notification email
 */
export async function sendFeeNotification(
  studentEmail: string,
  studentName: string,
  className: string,
  amount: string,
  dueDate: string
): Promise<boolean> {
  const html = `
    <h2>New Fee Record Added</h2>
    <p>Dear ${studentName},</p>
    <p>A new fee record has been added to your account for class <strong>${className}</strong>.</p>
    <ul>
      <li><strong>Amount:</strong> ${amount}</li>
      <li><strong>Due Date:</strong> ${dueDate}</li>
    </ul>
    <p>Please ensure timely payment to avoid any penalties.</p>
    <p>Best regards,<br>Student Management System</p>
  `;

  return sendEmail({
    to: studentEmail,
    subject: `New Fee Record - ${className}`,
    html,
  });
}

/**
 * Send payment status change notification
 */
export async function sendPaymentStatusNotification(
  studentEmail: string,
  studentName: string,
  status: string,
  amount: string,
  month: string
): Promise<boolean> {
  const html = `
    <h2>Payment Status Updated</h2>
    <p>Dear ${studentName},</p>
    <p>Your payment status has been updated.</p>
    <ul>
      <li><strong>Month:</strong> ${month}</li>
      <li><strong>Amount:</strong> ${amount}</li>
      <li><strong>Status:</strong> <strong>${status.toUpperCase()}</strong></li>
    </ul>
    <p>Thank you for your attention to this matter.</p>
    <p>Best regards,<br>Student Management System</p>
  `;

  return sendEmail({
    to: studentEmail,
    subject: `Payment Status Update - ${month}`,
    html,
  });
}

/**
 * Send exam result notification
 */
export async function sendResultNotification(
  studentEmail: string,
  studentName: string,
  examName: string,
  score: string,
  totalMarks: string,
  percentage: string,
  grade: string
): Promise<boolean> {
  const html = `
    <h2>Exam Results Published</h2>
    <p>Dear ${studentName},</p>
    <p>Your exam results have been published.</p>
    <ul>
      <li><strong>Exam:</strong> ${examName}</li>
      <li><strong>Score:</strong> ${score}/${totalMarks}</li>
      <li><strong>Percentage:</strong> ${percentage}%</li>
      <li><strong>Grade:</strong> ${grade}</li>
    </ul>
    <p>You can view more details in your student portal.</p>
    <p>Best regards,<br>Student Management System</p>
  `;

  return sendEmail({
    to: studentEmail,
    subject: `Exam Results - ${examName}`,
    html,
  });
}
