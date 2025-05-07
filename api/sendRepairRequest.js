// /api/sendRepairRequest.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    fullName,
    phoneNumber,
    deviceType,
    brandModel,
    problemDescription,
    file,
  } = req.body;

  // Create a transporter (use your real email and app password)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "daniel.deaconescu98@gmail.com",
      pass: process.env.EMAIL_PASSWORD, // store this securely in Vercel environment variables
    },
  });

  const mailOptions = {
    from: "daniel.deaconescu98@gmail.com",
    to: "daniel.deaconescu98@gmail.com",
    subject: "Cerere de reparație nouă - FIXAZI",
    html: `
      <h3>Detalii cerere de reparație</h3>
      <p><strong>Nume complet:</strong> ${fullName}</p>
      <p><strong>Număr de telefon:</strong> ${phoneNumber}</p>
      <p><strong>Tip dispozitiv:</strong> ${deviceType}</p>
      <p><strong>Marcă și model:</strong> ${brandModel}</p>
      <p><strong>Descriere problemă:</strong> ${problemDescription}</p>
    `,
    // You could handle the file if needed, but Vercel functions don't support large file uploads directly
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email trimis cu succes!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la trimiterea emailului." });
  }
}
