const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @swagger
 * /api/send-to-email:
 *   post:
 *     summary: Send car submission data and images to email
 *     tags:
 *       - Email
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               city:
 *                 type: string
 *               registrationNumber:
 *                 type: string
 *               rcAvailable:
 *                 type: string
 *               insuranceAvailable:
 *                 type: string
 *               carModel:
 *                 type: string
 *               variant:
 *                 type: string
 *               fuelType:
 *                 type: string
 *               ownership:
 *                 type: string
 *               kilometersDriven:
 *                 type: string
 *               expectedPrice:
 *                 type: string
 *               conditionScale:
 *                 type: string
 *               damageRemarks:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       500:
 *         description: Email failed to send
 */

router.post("/send-to-email", upload.array("files", 10), async (req, res) => {
  const {
    name,
    phone,
    email,
    city,
    registrationNumber,
    rcAvailable,
    insuranceAvailable,
    carModel,
    variant,
    fuelType,
    ownership,
    kilometersDriven,
    expectedPrice,
    conditionScale,
    damageRemarks,
  } = req.body;

  const recipients = ["kapoormanas00@gmail.com", "mbkapoor143@gmail.com"];

  try {
    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      path: file.path,
    }));

    const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f4f6f8; padding: 40px;">
      <div style="max-width: 640px; margin: auto; background-color: #ffffff; padding: 32px 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
  
        <!-- Logo Section -->
        <div style="text-align: left; margin-bottom: 24px;">
          <img src="https://res.cloudinary.com/drau7iyvg/image/upload/v1753354706/WhatsApp_Image_2025-07-24_at_4.23.37_PM_i2qv0t.jpg" alt="Maa Bhawani Car Bazar Logo" style="max-height: 100px;" />
        </div>
  
        <!-- Title & Introduction -->
        <h2 style="color: #1a202c; font-size: 20px; margin-bottom: 10px;">New Car Submission Received</h2>
        <p style="font-size: 15px; color: #4a5568; margin-bottom: 24px;">
          A new car submission has been received on <strong>Maa Bhawani Car Bazar</strong>. Below are the submitted details:
        </p>
  
        <!-- Submission Details -->
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tbody>
            ${generateRow("Name", name)}
            ${generateRow("Phone", phone)}
            ${generateRow("Email", email)}
            ${generateRow("City", city)}
            ${generateRow("Registration Number", registrationNumber)}
            ${generateRow("RC Available", rcAvailable)}
            ${generateRow("Insurance Available", insuranceAvailable)}
            ${generateRow("Car Model", carModel)}
            ${generateRow("Variant", variant)}
            ${generateRow("Fuel Type", fuelType)}
            ${generateRow("Ownership", ownership)}
            ${generateRow("Kilometers Driven", kilometersDriven)}
            ${generateRow("Expected Price", expectedPrice)}
            ${generateRow("Condition (1–10)", conditionScale)}
            ${generateRow("Damage Remarks", damageRemarks)}
          </tbody>
        </table>
  
        <!-- Footer -->
        <p style="font-size: 14px; color: #718096; margin-top: 32px;">
          This is an automated message sent from your website’s car submission portal.
        </p>
        <p style="font-size: 14px; color: #2d3748; margin-top: 8px;">
          — Maa Bhawani Car Bazar Team
        </p>
      </div>
    </div>
  `;

    function generateRow(label, value) {
      return `
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #2d3748; vertical-align: top; width: 40%;">${label}</td>
        <td style="padding: 8px 0; color: #4a5568;">${value || "-"}</td>
      </tr>
    `;
    }

    function generateRow(label, value) {
      return `
    <tr>
      <td style="padding: 8px 0; font-weight: 600; width: 40%; color: #444;">${label}:</td>
      <td style="padding: 8px 0; color: #222;">${value || "-"}</td>
    </tr>
  `;
    }

    await Promise.all(
      recipients.map((to) =>
        transporter.sendMail({
          from: `"Car Bazar" <${process.env.EMAIL_USER}>`,
          to,
          subject: "🚗 New Car Submission Received",
          html: emailHtml,
          attachments,
        })
      )
    );

    // Cleanup local files after sending
    for (const file of req.files) {
      fs.unlinkSync(file.path);
    }

    return res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("Email sending error:", error.message);
    return res.status(500).json({ success: false, error: "Email failed" });
  }
});

module.exports = router;
