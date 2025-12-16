import emailjs from '@emailjs/browser';

export const sendOTPEmail = async (email: string, otp: string) => {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        otp_code: otp
      }
    );
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};