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

  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true, // true for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"FIXAZI Form" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: "Cerere nouă de reparație de la FIXAZI",
    html: `
      <h2>Detalii client</h2>
      <p><strong>Nume complet:</strong> ${fullName}</p>
      <p><strong>Număr de telefon:</strong> ${phoneNumber}</p>
      <p><strong>Tip dispozitiv:</strong> ${deviceType}</p>
      <p><strong>Marcă/Model:</strong> ${brandModel}</p>
      <p><strong>Descriere problemă:</strong> ${problemDescription}</p>
      <p><strong>Fișier atașat:</strong> ${file || "Niciun fișier selectat"}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email trimis cu succes!" });
  } catch (error) {
    console.error("Eroare la trimiterea emailului:", error);
    res.status(500).json({ message: "Trimiterea emailului a eșuat." });
  }
}
