require("dotenv").config(); // Load env variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const Car = require("./models/Car");

const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { dbName: "MB-Car-Bazzar" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Maa Bhawani Car Bazar API",
      version: "1.0.0",
      description: "API to manage car data and WhatsApp form submission",
    },
    servers: [{ url: SERVER_URL }],
  },
  apis: ["./server.js", "./routes/send-to-email.js.js"], // include both
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger route
app.use(
  "/api-docs",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Swagger: Car schema
/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         price:
 *           type: number
 *         fuel_type:
 *           type: string
 *         car_type:
 *           type: string
 *         engine_type:
 *           type: string
 *         mileage:
 *           type: number
 *         transmission:
 *           type: string
 *         color:
 *           type: string
 *         owners:
 *           type: integer
 *         year:
 *           type: integer
 *         registration:
 *           type: string
 *         status:
 *           type: string
 *         image_url:
 *           type: string
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get all car details
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: A list of cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Car'
 */

// Cars endpoint
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

// POST /api/send-to-email
app.get("/cars", async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WhatsApp submission route
const emailRouter = require("./routes/send-to-email");
app.use(express.urlencoded({ extended: true }));

app.use("/api", emailRouter);
//
// Start server once
app.listen(PORT, () => {
  console.log(`🚗 Server running at ${SERVER_URL}`);
  console.log(`📘 Swagger UI available at ${SERVER_URL}/api-docs`);
});
