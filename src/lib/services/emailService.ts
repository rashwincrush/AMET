import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
};

// Create a transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email templates
const templates = {
  eventConfirmation: (eventName: string, date: string, location: string) => `
    <h1>Event Registration Confirmation</h1>
    <p>Thank you for registering for <strong>${eventName}</strong>.</p>
    <p>Date: ${date}</p>
    <p>Location: ${location}</p>
    <p>We look forward to seeing you there!</p>
  `,
  jobAlert: (jobTitle: string, company: string, url: string) => `
    <h1>New Job Alert</h1>
    <p>A new job matching your criteria has been posted:</p>
    <p><strong>${jobTitle}</strong> at ${company}</p>
    <p>View the job posting: <a href="${url}">Click here</a></p>
  `,
  mentorshipRequest: (mentorName: string, message: string) => `
    <h1>New Mentorship Request</h1>
    <p>You have received a mentorship request from ${mentorName}.</p>
    <p>Message: "${message}"</p>
    <p>Please log in to your account to accept or decline this request.</p>
  `,
  passwordReset: (resetLink: string) => `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password.</p>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetLink}">Reset Password</a></p>
    <p>If you didn't request this, please ignore this email.</p>
  `,
};

/**
 * Send an email
 * @param to Recipient email address
 * @param subject Email subject
 * @param html Email content in HTML format
 * @returns Promise with send result
 */
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@ametalumni.com',
      to,
      subject,
      html,
    });
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send event confirmation email
 * @param userEmail Recipient email address
 * @param eventName Name of the event
 * @param date Event date
 * @param location Event location
 * @returns Promise with send result
 */
export async function sendEventConfirmation(userEmail: string, eventName: string, date: string, location: string) {
  const subject = `Registration Confirmation: ${eventName}`;
  const html = templates.eventConfirmation(eventName, date, location);
  return sendEmail(userEmail, subject, html);
}

/**
 * Send job alert email
 * @param userEmail Recipient email address
 * @param jobTitle Job title
 * @param company Company name
 * @param url Job posting URL
 * @returns Promise with send result
 */
export async function sendJobAlert(userEmail: string, jobTitle: string, company: string, url: string) {
  const subject = `Job Alert: ${jobTitle} at ${company}`;
  const html = templates.jobAlert(jobTitle, company, url);
  return sendEmail(userEmail, subject, html);
}

/**
 * Send mentorship request email
 * @param userEmail Recipient email address
 * @param mentorName Mentor's name
 * @param message Request message
 * @returns Promise with send result
 */
export async function sendMentorshipRequest(userEmail: string, mentorName: string, message: string) {
  const subject = `New Mentorship Request from ${mentorName}`;
  const html = templates.mentorshipRequest(mentorName, message);
  return sendEmail(userEmail, subject, html);
}

/**
 * Send password reset email
 * @param userEmail Recipient email address
 * @param resetLink Password reset link
 * @returns Promise with send result
 */
export async function sendPasswordReset(userEmail: string, resetLink: string) {
  const subject = 'Password Reset Request';
  const html = templates.passwordReset(resetLink);
  return sendEmail(userEmail, subject, html);
}

/**
 * Log email activity to the database
 * @param userId User ID
 * @param emailType Type of email sent
 * @param emailData Additional email data
 * @returns Promise with database insert result
 */
export async function logEmailActivity(userId: string, emailType: string, emailData: any) {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .insert({
        user_id: userId,
        email_type: emailType,
        email_data: emailData,
        sent_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error logging email activity:', error);
    return { success: false, error };
  }
}
