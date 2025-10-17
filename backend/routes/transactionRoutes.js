const express = require('express');
const transactionController = require('../controllers/transactionController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Entry/Exit routes (Staff access)
router.post(
  '/entry',
  verifyToken,
  checkRole(['admin', 'staff']),
  transactionController.vehicleEntry
);

router.post(
  '/exit',
  verifyToken,
  checkRole(['admin', 'staff']),
  transactionController.vehicleExit
);

// Get all transactions (Admin/Staff)
router.get(
  '/',
  verifyToken,
  checkRole(['admin', 'staff']),
  transactionController.getAllTransactions
);

// Get active transactions (Admin/Staff)
router.get(
  '/active',
  verifyToken,
  checkRole(['admin', 'staff']),
  transactionController.getActiveTransactions
);

// Get user's transaction history (Customer)
router.get(
  '/my-history',
  verifyToken,
  transactionController.getUserTransactions
);

// Get transaction by ID
router.get(
  '/:id',
  verifyToken,
  transactionController.getTransactionById
);

// Get revenue statistics (Admin and Staff)
router.get(
  '/stats/revenue',
  verifyToken,
  checkRole(['admin', 'staff']),
  transactionController.getRevenueStats
);

module.exports = router;