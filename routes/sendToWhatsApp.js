const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const twilio = require("twilio");
require("dotenv").config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Twilio client setup
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * @swagger
 * /api/send-to-whatsapp:
 *   post:
 *     summary: Send user car form and files to WhatsApp
 *     tags: [WhatsApp]
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
 *         description: Data sent to WhatsApp
 *       500:
 *         description: Failed to send
 */

router.post(
  "/send-to-whatsapp",
  upload.array("files", 10),
  async (req, res) => {
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

    try {
      const uploadedUrls = [];

      // 1. Upload files to Cloudinary
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
        });
        uploadedUrls.push(result.secure_url);
        fs.unlinkSync(file.path); // remove local file after upload
      }

      // 2. Format message text
      const messageBody = `🚗 *New Car Submission - Maa Bhawani Car Bazar*\n
👤 *Name:* ${name}
📞 *Phone:* ${phone}
✉️ *Email:* ${email}
🏙️ *City:* ${city}
🔢 *Reg. Number:* ${registrationNumber}
📄 *RC Available:* ${rcAvailable}
📄 *Insurance Available:* ${insuranceAvailable}
🚘 *Model:* ${carModel}
🧩 *Variant:* ${variant}
⛽ *Fuel Type:* ${fuelType}
👥 *Ownership:* ${ownership}
📊 *KM Driven:* ${kilometersDriven}
💰 *Expected Price:* ${expectedPrice}
📈 *Condition (1-10):* ${conditionScale}
🛠️ *Damage Remarks:* ${damageRemarks}`;

      // 3. Send text message first
      await client.messages.create({
        from: "whatsapp:+14155238886", 
        to: "whatsapp:+919837027172",
        body: messageBody,
      });

      // 4. Send each uploaded file as media
      for (let url of uploadedUrls) {
        await client.messages.create({
          from: "whatsapp:+14155238886",
          to: "whatsapp:+917455977026",
          mediaUrl: [url],
        });
      }

      return res.status(200).json({
        success: true,
        message: "Data and media sent to WhatsApp successfully",
      });
    } catch (error) {
      console.error("❌ WhatsApp sending error:", error.message);
      if (error.response && error.response.data) {
        console.error("🔎 Twilio response data:", error.response.data);
      }
      res
        .status(500)
        .json({ success: false, error: "Failed to send WhatsApp message" });
    }
  }
);

module.exports = router;
