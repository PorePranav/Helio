import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import retry from 'async-retry';

type MailOptions = {
  to: string;
  subject: string;
  emailBody: string;
};

const mailGen = new Mailgen({
  theme: 'cerberus',
  product: {
    name: 'Portal',
    link: `${process.env.FRONTEND_URL}`,
  },
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_APP_EMAILID,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

const sendEmail = async (mailOptions: MailOptions) => {
  try {
    await retry(
      async (bail: any) => {
        try {
          await transporter.sendMail({
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.emailBody,
          });
        } catch (error: any) {
          if (error.code === 'EAUTH') {
            bail(new Error('Authentication failed for email service'));
            return;
          }
          throw error;
        }
      },
      { retries: 3, minTimeout: 1000, maxTimeout: 5000 }
    );
  } catch (error) {
    console.log('Error sending email after retries:', error);
  }
};

export const sendVerificationEmail = async (
  name: string,
  emailId: string,
  token: string
) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verifyEmail?token=${token}`;
  const email = {
    body: {
      name,
      intro: 'Welcome to Helio',
      action: {
        instructions: 'Click on the below button to verify your account',
        button: {
          color: '#22BC66',
          text: 'Verify Your Account',
          link: verificationUrl,
        },
      },
      outro: 'If you did not create an account, no further action is required.',
    },
  };

  const emailBody = mailGen.generate(email);
  sendEmail({ to: emailId, subject: 'Verify your email', emailBody });
};

export const sendPasswordResetMail = async (
  name: string,
  emailId: string,
  resetToken: string
) => {
  const passwordResetUrl = `${process.env.FRONTEND_URL}/resetPassword?token=${resetToken}`;

  const email = {
    body: {
      name,
      intro: 'You have requested a password reset',
      action: {
        instructions: 'Click on the below button to reset your password',
        button: {
          color: '#22BC66',
          text: 'Reset Password',
          link: passwordResetUrl,
        },
      },
      outro:
        'If you did not request a password reset, no further action is required.',
    },
  };

  const emailBody = mailGen.generate(email);
  sendEmail({ to: emailId, subject: 'Password Reset', emailBody });
};
