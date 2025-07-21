require('dotenv').config(); // <-- Load env variables at the VERY top

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

const Car = require('./models/Car');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const SERVER_URL = process.env.SERVER_URL;
const PORT = process.env.PORT;


app.use(cors())


mongoose.connect(process.env.MONGODB_URI, {
  dbName : 'MB-Car-Bazzar',
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log('Mongo Error: ', err));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Listing API',
      version: '1.0.0',
      description: 'API to fetch car details',
    },
    servers: [{ url: `${SERVER_URL}` }],
  },
  apis: ['./server.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at ${SERVER_URL}`);
  console.log(`Swagger UI at ${SERVER_URL}/api-docs`);
});
