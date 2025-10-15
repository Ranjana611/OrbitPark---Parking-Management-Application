const mongoose = require('mongoose');

const parkingSpaceSchema = new mongoose.Schema({
  spaceNumber: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['regular', 'handicap', 'ev_charging'], 
    default: 'regular' 
  },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'maintenance'], 
    default: 'available' 
  },
  hourlyRate: { type: Number, required: true }, // Price per hour
  currentVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ParkingSpace', parkingSpaceSchema);