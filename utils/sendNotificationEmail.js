const nodemailer = require('nodemailer');
require("dotenv").config();

// Function to send email
async function sendEmail(to, subject, text, html) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
}

async function sendWelcomeEmail(to, code) {
  const subject = 'Welcome to GudayHub!';
  const text = `Welcome to GudayHub, Your verification code is: ${code}\n\nIf you didn't register to our platform kindly ignore this email.`;
  const html = `<p>Welcome to GudayHub!</p><p>Your verification code is: <strong>${code}</strong></p><p>If you didn't register to our platform kindly ignore this email.</p>`;

  await sendEmail(to, subject, text, html);
}


// Function to send notification email
async function sendNotificationEmail(freelancer, job) {
  const subject = `New Job Matching Your Profile: ${job.Jobtitle}`;
  const text = `Hello ${freelancer.Fullname},\n\nA new job titled "${job.Jobtitle}" that matches your skills has been posted. Check it out!`;
  const html = `<p>Hello ${freelancer.Fullname},</p><p>A new job titled "<strong>${job.Jobtitle}</strong>" that matches your skills has been posted. Check it out!</p>`;

  await sendEmail(freelancer.Email, subject, text, html);
}

// Function to send interview date email
async function sendInterviewDateEmail(freelancer, job, applicant) {
  const subject = 'You have got an interview date';
  const text = `Hello ${freelancer.Fullname},\n\nAn interview date has been scheduled for "${job.Jobtitle}" job on ${applicant.interviewDate} ${applicant.interviewTime}\n\nGood luck.\n\n`;
  const html = `<p>Hello ${freelancer.Fullname},</p><p>An interview date has been scheduled for "<strong>${job.Jobtitle}</strong>" on ${applicant.interviewDate} ${applicant.interviewTime}</p><p>Good luck.</p>`;

  await sendEmail(freelancer.Email, subject, text, html);
}

// Function to send offer email
async function sendOfferEmail(freelancer, user) {
  const subject = 'You have got an Offer';
  const text = `Hello ${freelancer.Fullname},\n\nA new offer has been made by ${user.Fullname}. Check it out and give your response.\n\n`;
  const html = `<p>Hello ${freelancer.Fullname},</p><p>A new offer has been made by ${user.Fullname}. Check it out and give your response.</p>`;

  await sendEmail(freelancer.Email, subject, text, html);
}

module.exports = {
  sendNotificationEmail,
  sendInterviewDateEmail,
  sendOfferEmail,
  sendWelcomeEmail
};
