const { Facility } = require('../models');
const { validationResult } = require('express-validator');

// Create a new facility via @route POST /api/facilities
exports.createFacility = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { name, address, city, state, zip_code, contact_name, contact_phone, contact_email } = req.body;

        const newFacility = await Facility.create({
            name,
            address,
            city,
            state,
            zip_code,
            contact_name,
            contact_phone,
            contact_email
        });

        res.status(201).json({
            message: 'Facility created successfully',
            facility: newFacility
        });

    } catch (error) {
        next(error);
    }
};

// Get all facilities via @route GET /api/facilities
exports.getAllFacilities = async (req, res, next) => {
    try {
        const facilities = await Facility.findAll();
        res.status(200).json(facilities);
    } catch (error) {
        next(error);
    }
};

// Get a specific facility via @route GET /api/facilities/:id
exports.getFacilityById = async (req, res, next) => {
    try {
        const facility = await Facility.findByPk(req.params.id);

        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        res.status(200).json(facility);

    } catch (error) {
        next(error);
    }
};

// Update a facility via @route PUT /api/facilities/:id
exports.updateFacility = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { name, address, city, state, zip_code, contact_name, contact_phone, contact_email } = req.body;

        const facility = await Facility.findByPk(req.params.id);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        facility.name = name;
        facility.address = address;
        facility.city = city;
        facility.state = state;
        facility.zip_code = zip_code;
        facility.contact_name = contact_name;
        facility.contact_phone = contact_phone;
        facility.contact_email = contact_email;

        await facility.save();

        res.status(200).json({
            message: 'Facility updated successfully',
            facility
        });

    } catch (error) {
        next(error);
    }
};

// Delete a facility via @route DELETE /api/facilities/:id
exports.deleteFacility = async (req, res, next) => {
    try {
        const facility = await Facility.findByPk(req.params.id);
        if (!facility) {
            return res.status(404).json({ message: 'Facility not found' });
        }

        await facility.destroy();

        res.status(200).json({ message: 'Facility deleted successfully' });

    } catch (error) {
        next(error);
    }
};