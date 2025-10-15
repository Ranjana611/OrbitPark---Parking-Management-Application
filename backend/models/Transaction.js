const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  parkingSpaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpace', required: true },
  entryTime: { type: Date, required: true },
  exitTime: { type: Date },
  spaceType: { type: String, enum: ['regular', 'handicap', 'ev_charging'] },
  hourlyRate: { type: Number, required: true },
  duration: { type: Number }, // Duration in hours (calculated at exit)
  totalFee: { type: Number }, // Total fee (calculated at exit)
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);