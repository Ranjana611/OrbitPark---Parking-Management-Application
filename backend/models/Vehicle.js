const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  licensePlate: { type: String, required: true, unique: true },
  vehicleType: { type: String, enum: ['car', 'bike', 'truck'], default: 'car' },
  color: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);