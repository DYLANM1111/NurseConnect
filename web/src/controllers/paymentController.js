const { Payment, TimeRecord } = require('../models');
const { validationResult } = require('express-validator');

// Create a new payment via @route POST /api/payments
exports.createPayment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { time_record_id, amount, status } = req.body;

        // Check if the time record exists
        const timeRecord = await TimeRecord.findByPk(time_record_id);
        if (!timeRecord) {
            return res.status(404).json({ message: 'Time record not found' });
        }

        const newPayment = await Payment.create({
            time_record_id,
            amount,
            status,
            processed_at: status === 'processed' ? new Date() : null
        });

        res.status(201).json({
            message: 'Payment created successfully',
            payment: newPayment
        });

    } catch (error) {
        next(error);
    }
};

// Get all payments via @route GET /api/payments
exports.getAllPayments = async (req, res, next) => {
    try {
        const payments = await Payment.findAll({
            include: [{ model: TimeRecord, as: 'timeRecord' }]
        });
        res.status(200).json(payments);
    } catch (error) {
        next(error);
    }
};

// Get a specific payment via @route GET /api/payments/:id
exports.getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.id, {
            include: [{ model: TimeRecord, as: 'timeRecord' }]
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json(payment);

    } catch (error) {
        next(error);
    }
};

// Update a payment via @route PUT /api/payments/:id
exports.updatePayment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { amount, status } = req.body;

        const payment = await Payment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        payment.amount = amount;
        payment.status = status;
        payment.processed_at = status === 'processed' ? new Date() : payment.processed_at;

        await payment.save();

        res.status(200).json({
            message: 'Payment updated successfully',
            payment
        });

    } catch (error) {
        next(error);
    }
};

// Delete a payment via @route DELETE /api/payments/:id
exports.deletePayment = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        await payment.destroy();

        res.status(200).json({ message: 'Payment deleted successfully' });

    } catch (error) {
        next(error);
    }
};