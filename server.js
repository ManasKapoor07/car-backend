require('dotenv').config(); // Load env variables first

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const Car = require('./models/Car');

const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// Enable CORS globally
app.use(cors());

// Middleware to parse JSON (optional but good practice)
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'MB-Car-Bazzar',
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ Mongo Error:', err));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Listing API',
      version: '1.0.0',
      description: 'API to fetch car details',
    },
    servers: [{ url: SERVER_URL }],
  },
  apis: ['./server.js'], // where the annotations are
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// CORS headers specifically for Swagger UI route (optional)
app.use('/api-docs', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
 *     tags:
 *       - Cars
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

// Routes
app.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚗 Server running at ${SERVER_URL}`);
  console.log(`📘 Swagger UI available at ${SERVER_URL}/api-docs`);
});
