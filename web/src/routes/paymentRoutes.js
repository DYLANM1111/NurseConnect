const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticateJwt } = require('../config/passport');

const router = express.Router();

// Create a new payment
router.post(
    '/',
    authenticateJwt,
    [
        body('time_record_id').isInt().withMessage('Time record ID must be an integer'),
        body('amount').isDecimal().withMessage('Amount must be a decimal'),
        body('status').isIn(['pending', 'processed', 'failed']).withMessage('Invalid status')
    ],
    paymentController.createPayment
);

// Get all payments
router.get('/', authenticateJwt, paymentController.getAllPayments);

// Get a specific payment by ID
router.get('/:id', authenticateJwt, paymentController.getPaymentById);

// Update a payment
router.put(
    '/:id',
    authenticateJwt,
    [
        body('amount').isDecimal().withMessage('Amount must be a decimal'),
        body('status').isIn(['pending', 'processed', 'failed']).withMessage('Invalid status')
    ],
    paymentController.updatePayment
);

// Delete a payment
router.delete('/:id', authenticateJwt, paymentController.deletePayment);

module.exports = router;