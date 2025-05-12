import formidable from "formidable";
import nodemailer from "nodemailer";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const form = formidable({
      allowEmptyFiles: true, // Allow empty files
      minFileSize: 0, // Allow files with size 0 bytes (cancel file selection)
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    console.log("Parsed fields:", JSON.stringify(fields, null, 2));
    console.log("Parsed files:", JSON.stringify(files, null, 2));

    // Ensure required fields exist
    if (!fields) {
      return res.status(400).json({ message: "No form data received" });
    }

    // Extract all fields with fallbacks
    const fullName = fields.fullName?.[0] || fields.fullName || "Nespecificat";
    const phoneNumber =
      fields.phoneNumber?.[0] || fields.phoneNumber || "Nespecificat";
    const deviceType =
      fields.deviceType?.[0] || fields.deviceType || "Nespecificat";
    const brandModel =
      fields.brandModel?.[0] || fields.brandModel || "Nespecificat";
    const problemDescription =
      fields.problemDescription?.[0] ||
      fields.problemDescription ||
      "Nespecificat";
    // Extract acceptContact field
    const rawAcceptContact = Array.isArray(fields.acceptContact)
      ? fields.acceptContact[0]
      : fields.acceptContact;

    const acceptContact = rawAcceptContact === "on"; // Checkbox value when checked is 'on'

    let preferredContact = "Niciuna";
    if (acceptContact) {
      preferredContact = fields.preferredContact?.[0] || "Nespecificat";
    }

    // Handle file upload (check if file exists and has size > 0)
    let attachments = [];
    const uploadedFile = files.file?.[0] || files.file;

    // Check if the file exists and its size is greater than 0
    if (uploadedFile && uploadedFile.filepath && uploadedFile.size > 0) {
      attachments.push({
        filename: uploadedFile.originalFilename || "attachment",
        path: uploadedFile.filepath,
        contentType: uploadedFile.mimetype || "application/octet-stream",
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Format date
    const currentDate = new Date();
    const bucharestTime = currentDate.toLocaleString("ro-RO", {
      timeZone: "Europe/Bucharest",
      dateStyle: "short",
      timeStyle: "medium",
    });

    // Prepare email
    const subject = `Cerere reparație de la ${fullName} - ${bucharestTime}`;

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
          acceptContact ? "Da" : "Nu"
        }</p>
        <p><strong>Metodă preferată de contact:</strong> ${preferredContact}</p>
      `,
      attachments,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.redirect(302, "/submitted.html");
  } catch (error) {
    console.error("Error processing form:", error);
    res.status(500).json({
      success: false,
      message: "Error processing request",
      error: error.message,
    });
  }
}
