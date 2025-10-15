const express = require('express');
const parkingController = require('../controllers/parkingController');
const vehicleController = require('../controllers/vehicleController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// PARKING SPACE ROUTES ==========

// Admin only routes
router.post(
  '/spaces',
  verifyToken,
  checkRole(['admin']),
  parkingController.createParkingSpace
);

router.put(
  '/spaces/:id',
  verifyToken,
  checkRole(['admin']),
  parkingController.updateParkingSpace
);

router.delete(
  '/spaces/:id',
  verifyToken,
  checkRole(['admin']),
  parkingController.deleteParkingSpace
);

// Admin and Staff routes
router.get(
  '/spaces',
  verifyToken,
  checkRole(['admin', 'staff', 'customer']),
  parkingController.getAllParkingSpaces
);

router.get(
  '/spaces/available',
  verifyToken,
  checkRole(['admin', 'staff', 'customer']),
  parkingController.getAvailableSpaces
);

router.get(
  '/spaces/:id',
  verifyToken,
  checkRole(['admin', 'staff']),
  parkingController.getParkingSpace
);

router.get(
  '/stats',
  verifyToken,
  checkRole(['admin', 'staff']),
  parkingController.getParkingStats
);

// VEHICLE ROUTES ==========

// Customer routes
router.post(
  '/vehicles',
  verifyToken,
  vehicleController.addVehicle
);

router.get(
  '/vehicles/my-vehicles',
  verifyToken,
  vehicleController.getUserVehicles
);

router.put(
  '/vehicles/:id',
  verifyToken,
  vehicleController.updateVehicle
);

router.delete(
  '/vehicles/:id',
  verifyToken,
  vehicleController.deleteVehicle
);

// Admin and Staff routes
router.get(
  '/vehicles',
  verifyToken,
  checkRole(['admin', 'staff']),
  vehicleController.getAllVehicles
);

router.get(
  '/vehicles/plate/:licensePlate',
  verifyToken,
  checkRole(['admin', 'staff']),
  vehicleController.getVehicleByLicensePlate
);

module.exports = router;