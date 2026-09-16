const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [to],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error("Resend email error ❌");
      console.error(error);

      throw new Error(error.message || "Resend failed to send email");
    }

    console.log("Email sent successfully ✅");
    console.log("Resend Email ID:", data?.id);

    return data;
  } catch (error) {
    console.error("Email sending failed ❌");
    console.error(error.message);
    throw error;
  }
};

module.exports = sendEmail;