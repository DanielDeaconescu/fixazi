import formidable from "formidable";
import fs from "fs";
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
    console.log("Fields:", fields);
    console.log("Files:", files);

    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ message: "Form parsing failed" });
    }

    const {
      fullName,
      phoneNumber,
      deviceType,
      brandModel,
      problemDescription,
      acceptContact,
      preferredContact,
    } = fields;

    const uploadedFile = files.file?.[0];

    console.log("Uploaded file:", uploadedFile);

    let attachments = [];
    if (uploadedFile && uploadedFile.filepath) {
      attachments.push({
        filename: uploadedFile.originalFilename,
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

    const now = new Date();
    const timestamp = now.toLocaleString("ro-RO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const subject = `Cerere reparație de la ${fullName} - ${timestamp}`;

    const mailOptions = {
      from: `"Formular FIXAZI" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: subject,
      html: `
        <h2>Detalii cerere</h2>
        <p><strong>Nume complet:</strong> ${fullName}</p>
        <p><strong>Număr de telefon:</strong> ${phoneNumber}</p>
        <p><strong>Tip dispozitiv:</strong> ${deviceType}</p>
        <p><strong>Marcă/Model:</strong> ${brandModel}</p>
        <p><strong>Descriere problemă:</strong> ${problemDescription}</p>
        <p><strong>Acceptă să fie contactat(ă):</strong> ${
          acceptContact === "true" ? "Da" : "Nu"
        }</p>
        <p><strong>Metodă preferată de contact:</strong> ${preferredContact}</p>
      `,
      attachments, // Attach the file(s)
    };

    try {
      await transporter.sendMail(mailOptions);

      res.writeHead(302, { Location: "/submitted.html" });
      res.end();
    } catch (error) {
      console.error("Eroare la trimiterea emailului:", error);
      res.status(500).json({ message: "Trimiterea emailului a eșuat." });
    }
  });
}
