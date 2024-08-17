const nodemailer = require('nodemailer');
require("dotenv").config();


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

async function sendEmailToGudayHub(to, subject, text, html) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
  const mailOptionsToGudayHub = {
    from: to,
    to: process.env.EMAIL_USER,
    subject: subject,
    text: text,
    html: html
  };
  try {
    await transporter.sendMail(mailOptionsToGudayHub);
    console.log(`Email sent from ${to}`);
  } catch (error) {
    console.error(`Error sending email from ${to}:`, error);
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

async function sendHireEmail(freelancer, post) {
  const subject = `You have been Hired for ${post.Jobtitle}!`;
  const text = `Hello ${freelancer.Fullname},\n\nCongratulations! You have been hired for the position of ${post.Jobtitle}.We look forward to your contributions to this project.\n\nPlease review the details and reach out if you have any questions.\n\n`;
  const html = `<p>Hello ${freelancer.Fullname},</p><p>Congratulations! You have been hired for the position of ${post.Jobtitle}.We look forward to your contributions to this project.</p><p>Please review the details and reach out if you have any questions.</p>`;

  await sendEmail(freelancer.Email, subject, text, html);
}



// Function to send scheduled email
async function sendScheduledEmail(freelancerName,freelancerEmail ,scheduled) {
  const subject = 'Your verification has been scheduled successfully';
  
  const text = `
    Hello ${freelancerName},
    
    Your verification has been scheduled successfully on:
    Scheduled Date: ${scheduled.verificationDate}
    Scheduled Time: ${scheduled.verificationTime}
    
    Please bring all the necessary documents and check our website for more details.

  `;
  
  const html = `
    <p>Hello ${freelancerName},</p>
    <p>Your verification has been scheduled successfully on:</p>
    <p><strong>Scheduled Date:</strong> ${scheduled.verificationDate}</p>
    <p><strong>Scheduled Time:</strong> ${scheduled.verificationTime}</p>
    <p>Please bring all the necessary documents and check our website for more details.</p>

  `;

  await sendEmail(freelancerEmail, subject, text, html);
}


async function contactFormUsers(name,email,message) {
  const subject = `A user my the name ${name} is trying to contact you`;
  const text = `${message}\n\n`;
  const html = `<p>${message}</p>`;

  await sendEmailToGudayHub(email, subject, text, html);
}

module.exports = {
  sendNotificationEmail,
  sendInterviewDateEmail,
  sendOfferEmail,
  sendWelcomeEmail,
  sendHireEmail,
  sendScheduledEmail,
  contactFormUsers
};
