const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  fuel_type: String,
  car_type: String,
  engine_type: String,
  mileage: Number,
  transmission: String,
  color: String,
  owners: Number,
  year: Number,
  registration: String,
  status: String,
  image_url: String,
  description: String
});

module.exports = mongoose.model('Car', carSchema, 'CarListing'); 
