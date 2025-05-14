import formidable from "formidable";
import nodemailer from "nodemailer";
import { MongoClient } from "mongodb";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Utility function to connect to MongoDB
async function connectToDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("formSubmissions");
  return { db, client };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Get client IP address
    const ip =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress;

    const { db, client } = await connectToDatabase();
    const submissionsCollection = db.collection("submissions");

    // Calculate date 24 hours ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Count submissions from this IP in the last 24 hours
    const submissionCount = await submissionsCollection.countDocuments({
      ip,
      timestamp: { $gte: oneDayAgo },
    });

    if (submissionCount >= 3) {
      client.close();
      return res.status(200).json({ success: false, reason: "limit-reached" });
    }

    // Parse form data
    const form = formidable({ allowEmptyFiles: true, minFileSize: 0 });
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Turnstile verification
    const turnstileToken =
      fields["cf-turnstile-response"]?.[0] || fields["cf-turnstile-response"];

    if (!turnstileToken) {
      return res.status(400).json({
        success: false,
        message: "Missing Turnstile token",
      });
    }

    const verifyURL =
      "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    const response = await fetch(verifyURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: ip, // optional
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(403).json({
        success: false,
        error: data["error-codes"],
        message: "Turnstile verification failed",
      });
    }

    // Extract form fields
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
    const rawAcceptContact = Array.isArray(fields.acceptContact)
      ? fields.acceptContact[0]
      : fields.acceptContact;
    const acceptContact = rawAcceptContact === "Da";
    let preferredContact = "Niciuna";
    if (acceptContact) {
      preferredContact = fields.preferredContact?.[0] || "Nespecificat";
    }

    // Attachments
    let attachments = [];
    const uploadedFile = files.file?.[0] || files.file;
    if (uploadedFile && uploadedFile.filepath && uploadedFile.size > 0) {
      attachments.push({
        filename: uploadedFile.originalFilename || "attachment",
        path: uploadedFile.filepath,
        contentType: uploadedFile.mimetype || "application/octet-stream",
      });
    }

    // Send email
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
    const bucharestTime = currentDate.toLocaleString("ro-RO", {
      timeZone: "Europe/Bucharest",
      dateStyle: "short",
      timeStyle: "medium",
    });

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

    await transporter.sendMail(mailOptions);

    // Store submission
    await submissionsCollection.insertOne({
      ip,
      timestamp: new Date(),
    });

    client.close();
    res
      .status(200)
      .json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error processing form:", error);
    res.status(500).json({
      success: false,
      message: "Error processing request",
      error: error.message,
    });
  }
}
