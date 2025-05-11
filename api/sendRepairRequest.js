import formidable from "formidable";
import nodemailer from "nodemailer";

export const config = {
  api: {
    bodyParser: false, // Required for formidable to work
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ message: "Form parsing failed" });
    }

    // Access fields directly (no need for [0] in current formidable versions)
    const {
      fullName,
      phoneNumber,
      deviceType,
      brandModel,
      problemDescription,
      acceptContact,
      preferredContact,
    } = fields;

    // Handle single file upload (note the change from files.file?.[0] to files.file)
    const uploadedFile = files.file;

    let attachments = [];
    if (uploadedFile && uploadedFile.filepath) {
      attachments.push({
        filename: uploadedFile.originalFilename || "attachment",
        path: uploadedFile.filepath,
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const currentDate = new Date();
    const bucharestTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Bucharest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(currentDate);

    const subject = `Cerere reparație de la ${fullName} - ${bucharestTime}`;

    const mailOptions = {
      from: `"Formular FIXAZI" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: subject,
      html: `
        <h2>Detalii cerere</h2>
        <p><strong>Nume complet:</strong> ${fullName || "Nespecificat"}</p>
        <p><strong>Număr de telefon:</strong> ${
          phoneNumber || "Nespecificat"
        }</p>
        <p><strong>Tip dispozitiv:</strong> ${deviceType || "Nespecificat"}</p>
        <p><strong>Marcă/Model:</strong> ${brandModel || "Nespecificat"}</p>
        <p><strong>Descriere problemă:</strong> ${
          problemDescription || "Nespecificat"
        }</p>
        <p><strong>Acceptă să fie contactat(ă):</strong> ${
          acceptContact === "true" ? "Da" : "Nu"
        }</p>
        <p><strong>Metodă preferată de contact:</strong> ${
          preferredContact || "Telefon"
        }</p>
      `,
      attachments,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Eroare la trimiterea emailului:", error);
      res.status(500).json({ message: "Trimiterea emailului a eșuat." });
    }
  });
}
