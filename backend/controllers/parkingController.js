const ParkingSpace = require('../models/ParkingSpace');

// Create Parking Space (Admin only)
exports.createParkingSpace = async (req, res) => {
  try {
    const { spaceNumber, type, hourlyRate } = req.body;

    if (!spaceNumber || !type || !hourlyRate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Space number, type, and hourly rate are required' 
      });
    }

    // Check if space already exists
    const existingSpace = await ParkingSpace.findOne({ spaceNumber });
    if (existingSpace) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parking space already exists' 
      });
    }

    const newSpace = new ParkingSpace({
      spaceNumber,
      type,
      hourlyRate,
      status: 'available',
    });

    await newSpace.save();

    res.status(201).json({
      success: true,
      message: 'Parking space created successfully',
      space: newSpace,
    });
  } catch (err) {
    console.error('Create parking space error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating parking space' 
    });
  }
};

// Get All Parking Spaces
exports.getAllParkingSpaces = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    const spaces = await ParkingSpace.find(filter)
      .populate('currentVehicle')
      .sort({ spaceNumber: 1 });

    res.json({
      success: true,
      count: spaces.length,
      spaces,
    });
  } catch (err) {
    console.error('Get parking spaces error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching parking spaces' 
    });
  }
};

// Get Single Parking Space
exports.getParkingSpace = async (req, res) => {
  try {
    const space = await ParkingSpace.findById(req.params.id)
      .populate('currentVehicle');

    if (!space) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking space not found' 
      });
    }

    res.json({
      success: true,
      space,
    });
  } catch (err) {
    console.error('Get parking space error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching parking space' 
    });
  }
};

// Update Parking Space (Admin only)
exports.updateParkingSpace = async (req, res) => {
  try {
    const { type, hourlyRate, status } = req.body;

    const space = await ParkingSpace.findById(req.params.id);
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking space not found' 
      });
    }

    // Don't allow changing status to available if currently occupied
    if (status === 'available' && space.status === 'occupied') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot mark occupied space as available' 
      });
    }

    if (type) space.type = type;
    if (hourlyRate) space.hourlyRate = hourlyRate;
    if (status) space.status = status;

    await space.save();

    res.json({
      success: true,
      message: 'Parking space updated successfully',
      space,
    });
  } catch (err) {
    console.error('Update parking space error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating parking space' 
    });
  }
};

// Delete Parking Space (Admin only)
exports.deleteParkingSpace = async (req, res) => {
  try {
    const space = await ParkingSpace.findById(req.params.id);
    
    if (!space) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking space not found' 
      });
    }

    if (space.status === 'occupied') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete occupied parking space' 
      });
    }

    await ParkingSpace.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Parking space deleted successfully',
    });
  } catch (err) {
    console.error('Delete parking space error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting parking space' 
    });
  }
};

// Get Available Spaces by Type
exports.getAvailableSpaces = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { status: 'available' };

    if (type) filter.type = type;

    const spaces = await ParkingSpace.find(filter).sort({ spaceNumber: 1 });

    res.json({
      success: true,
      count: spaces.length,
      spaces,
    });
  } catch (err) {
    console.error('Get available spaces error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching available spaces' 
    });
  }
};

// Get Parking Statistics (Admin Dashboard)
exports.getParkingStats = async (req, res) => {
  try {
    const totalSpaces = await ParkingSpace.countDocuments();
    const availableSpaces = await ParkingSpace.countDocuments({ status: 'available' });
    const occupiedSpaces = await ParkingSpace.countDocuments({ status: 'occupied' });
    const maintenanceSpaces = await ParkingSpace.countDocuments({ status: 'maintenance' });

    const spacesByType = await ParkingSpace.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalSpaces,
        available: availableSpaces,
        occupied: occupiedSpaces,
        maintenance: maintenanceSpaces,
        byType: spacesByType,
      },
    });
  } catch (err) {
    console.error('Get parking stats error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching parking statistics' 
    });
  }
};