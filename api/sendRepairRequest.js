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

    const uploadedFile = files.file;

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
        <p><strong>Acceptă să fie contactat(ă):</strong> ${
          acceptContact === "true" ? "Da" : "Nu"
        }</p>
        <p><strong>Metodă preferată de contact:</strong> ${preferredContact}</p>
        <p><strong>Fișier atașat:</strong> ${
          uploadedFile ? uploadedFile.originalFilename : "Niciun fișier"
        }</p>
      `,
      attachments,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email trimis cu succes!" });
    } catch (error) {
      console.error("Eroare la trimiterea emailului:", error);
      res.status(500).json({ message: "Trimiterea emailului a eșuat." });
    }
  });
}
