const Transaction = require('../models/Transaction');
const ParkingSpace = require('../models/ParkingSpace');
const Vehicle = require('../models/Vehicle');

// Vehicle Entry (Check-in)
exports.vehicleEntry = async (req, res) => {
  try {
    const { licensePlate, spaceType } = req.body;

    if (!licensePlate) {
      return res.status(400).json({ 
        success: false, 
        message: 'License plate is required' 
      });
    }

    // Find vehicle
    const vehicle = await Vehicle.findOne({ 
      licensePlate: licensePlate.toUpperCase() 
    });

    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found. Please register the vehicle first.' 
      });
    }

    // Check if vehicle is already parked
    const activeTransaction = await Transaction.findOne({
      vehicleId: vehicle._id,
      status: 'active'
    });

    if (activeTransaction) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vehicle is already parked' 
      });
    }

    // Find available parking space
    const filter = { status: 'available' };
    if (spaceType) filter.type = spaceType;

    const availableSpace = await ParkingSpace.findOne(filter);

    if (!availableSpace) {
      return res.status(404).json({ 
        success: false, 
        message: `No available ${spaceType || ''} parking spaces` 
      });
    }

    // Create transaction
    const newTransaction = new Transaction({
      userId: vehicle.userId,
      vehicleId: vehicle._id,
      parkingSpaceId: availableSpace._id,
      entryTime: new Date(),
      spaceType: availableSpace.type,
      hourlyRate: availableSpace.hourlyRate,
      status: 'active',
    });

    await newTransaction.save();

    // Update parking space status
    availableSpace.status = 'occupied';
    availableSpace.currentVehicle = vehicle._id;
    await availableSpace.save();

    // Populate transaction for response
    await newTransaction.populate('vehicleId parkingSpaceId userId');

    res.status(201).json({
      success: true,
      message: 'Vehicle checked in successfully',
      transaction: newTransaction,
    });
  } catch (err) {
    console.error('Vehicle entry error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing vehicle entry' 
    });
  }
};

// Vehicle Exit (Check-out)
exports.vehicleExit = async (req, res) => {
  try {
    const { licensePlate } = req.body;

    if (!licensePlate) {
      return res.status(400).json({ 
        success: false, 
        message: 'License plate is required' 
      });
    }

    // Find vehicle
    const vehicle = await Vehicle.findOne({ 
      licensePlate: licensePlate.toUpperCase() 
    });

    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found' 
      });
    }

    // Find active transaction
    const transaction = await Transaction.findOne({
      vehicleId: vehicle._id,
      status: 'active'
    }).populate('parkingSpaceId');

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active parking session found for this vehicle' 
      });
    }

    // Calculate duration and fee
    const exitTime = new Date();
    const entryTime = new Date(transaction.entryTime);
    const durationMs = exitTime - entryTime;
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour
    const totalFee = durationHours * transaction.hourlyRate;

    // Update transaction
    transaction.exitTime = exitTime;
    transaction.duration = durationHours;
    transaction.totalFee = totalFee;
    transaction.status = 'completed';
    await transaction.save();

    // Update parking space
    const parkingSpace = await ParkingSpace.findById(transaction.parkingSpaceId);
    parkingSpace.status = 'available';
    parkingSpace.currentVehicle = null;
    await parkingSpace.save();

    // Populate for response
    await transaction.populate('vehicleId userId parkingSpaceId');

    res.json({
      success: true,
      message: 'Vehicle checked out successfully',
      transaction: {
        ...transaction.toObject(),
        receipt: {
          licensePlate: vehicle.licensePlate,
          spaceNumber: parkingSpace.spaceNumber,
          entryTime: transaction.entryTime,
          exitTime: transaction.exitTime,
          duration: `${durationHours} hour(s)`,
          hourlyRate: `$${transaction.hourlyRate}`,
          totalFee: `$${totalFee.toFixed(2)}`,
        }
      }
    });
  } catch (err) {
    console.error('Vehicle exit error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing vehicle exit' 
    });
  }
};

// Get All Transactions (Admin/Staff)
exports.getAllTransactions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'licensePlate vehicleType')
      .populate('parkingSpaceId', 'spaceNumber type')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching transactions' 
    });
  }
};

// Get User's Transaction History
exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .populate('vehicleId', 'licensePlate vehicleType')
      .populate('parkingSpaceId', 'spaceNumber type')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error('Get user transactions error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user transactions' 
    });
  }
};

// Get Active Transactions (Currently Parked Vehicles)
exports.getActiveTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'active' })
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'licensePlate vehicleType')
      .populate('parkingSpaceId', 'spaceNumber type')
      .sort({ entryTime: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error('Get active transactions error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching active transactions' 
    });
  }
};

// Get Transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'licensePlate vehicleType color')
      .populate('parkingSpaceId', 'spaceNumber type hourlyRate');

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (err) {
    console.error('Get transaction error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching transaction' 
    });
  }
};

// Get Revenue Statistics (Admin)
exports.getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { status: 'completed' };

    if (startDate && endDate) {
      filter.exitTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(filter);

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.totalFee || 0), 0);
    const totalTransactions = transactions.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Revenue by space type
    const revenueByType = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$spaceType',
          totalRevenue: { $sum: '$totalFee' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue: totalRevenue.toFixed(2),
        totalTransactions,
        averageTransaction: averageTransaction.toFixed(2),
        revenueByType,
      },
    });
  } catch (err) {
    console.error('Get revenue stats error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching revenue statistics' 
    });
  }
};