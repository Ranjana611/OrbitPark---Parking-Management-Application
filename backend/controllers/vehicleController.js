const Vehicle = require('../models/Vehicle');

// Add Vehicle
exports.addVehicle = async (req, res) => {
  try {
    const { licensePlate, vehicleType, color } = req.body;

    if (!licensePlate || !vehicleType) {
      return res.status(400).json({ 
        success: false, 
        message: 'License plate and vehicle type are required' 
      });
    }

    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findOne({ licensePlate });
    if (existingVehicle) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vehicle with this license plate already exists' 
      });
    }

    const newVehicle = new Vehicle({
      userId: req.userId,
      licensePlate: licensePlate.toUpperCase(),
      vehicleType,
      color,
    });

    await newVehicle.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      vehicle: newVehicle,
    });
  } catch (err) {
    console.error('Add vehicle error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding vehicle' 
    });
  }
};

// Get User's Vehicles
exports.getUserVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.userId });

    res.json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (err) {
    console.error('Get vehicles error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching vehicles' 
    });
  }
};

// Get All Vehicles (Admin/Staff)
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('userId', 'name email phone');

    res.json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (err) {
    console.error('Get all vehicles error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching vehicles' 
    });
  }
};

// Get Vehicle by License Plate (for entry/exit)
exports.getVehicleByLicensePlate = async (req, res) => {
  try {
    const { licensePlate } = req.params;

    const vehicle = await Vehicle.findOne({ 
      licensePlate: licensePlate.toUpperCase() 
    }).populate('userId', 'name email phone');

    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found' 
      });
    }

    res.json({
      success: true,
      vehicle,
    });
  } catch (err) {
    console.error('Get vehicle error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching vehicle' 
    });
  }
};

// Update Vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { vehicleType, color } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found' 
      });
    }

    // Check if user owns this vehicle (unless admin/staff)
    if (vehicle.userId.toString() !== req.userId && 
        !['admin', 'staff'].includes(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to update this vehicle' 
      });
    }

    if (vehicleType) vehicle.vehicleType = vehicleType;
    if (color) vehicle.color = color;

    await vehicle.save();

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle,
    });
  } catch (err) {
    console.error('Update vehicle error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating vehicle' 
    });
  }
};

// Delete Vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found' 
      });
    }

    // Check if user owns this vehicle (unless admin/staff)
    if (vehicle.userId.toString() !== req.userId && 
        !['admin', 'staff'].includes(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to delete this vehicle' 
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting vehicle' 
    });
  }
};