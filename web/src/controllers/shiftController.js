const { Op } = require('sequelize');
const {
    Shift,
    ShiftRequest,
    User,
    NurseProfile,
    Facility,
    ShiftApplication
} = require('../models');
const { validationResult } = require('express-validator');
const geoService = require('../services/geoService');

// get all the shifts with filtering in db
exports.getAllShifts = async (req, res, next) => {
    try {
        const {
            status, facility_id, unit, shift_type, start_date, end_date, min_rate, max_rate,
            latitude, longitude, distance
        } = req.query;

        const where = {};

        //filter by status
        if (status) {
            where.status = status;
        } else {
            where.status = 'open'; // default to open shifts
        }

        //filter by facility_id
        if (facility_id) {
            where.facility_id = facility_id;
        }

        //filter by unit
        if (unit) {
            where.unit = unit;
        }

        //filter by shift type
        if (shift_type) {
            where.shift_type = shift_type;
        }

        //filter by date range
        if (start_date) {
            where.start_time = {
                [Op.gte]: new Date(start_date)
            };
        }

        if (end_date) {
            where.end_time = {
                [Op.lte]: new Date(end_date)
            };
        }

        //filter by rate range
        if (min_rate) {
            where.hourly_rate = {
                ...where.hourly_rate, [Op.gte]: min_rate
            };
        }


        if (max_rate) {
            where.hourly_rate = {
                ...where.hourly_rate, [Op.lte]: max_rate
            };
        }

        // include  facility data
        const include = [
            {
                model: Facility, as: 'facility'
            }
        ];

        //when user is a nurse
        if (req.User && req.User.role == 'nurse') {
            include.push({
                model: ShiftApplication, as: 'application', require: false, where: { nurse_id: req.User.NurseProfile.id }

            });
        }

        //get shifts based on filers
        let shifts = await Shift.findAll({ where, include, order: [['start_time', 'ASC']] });

        //if location is part of the filer
        if (latitude && longitude && distance) {
            shifts = await geoService.filterByDistance(
                shifts,
                parseFloat(latitude),
                parseFloat(longitude),
                parseFloat(distance)
            );
        }
        res.status(200).json({ shifts });
    } catch (error) {
        next(error);
    }
};

// Get a shift by the ID  @route GET /api/shifts/:id
exports.getShiftById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const shift = await Shift.findbykey(id, {
            include: [{ model: Facility, as: 'facility' }, {
                model: ShiftApplication, as: 'applications', include:
                    [
                        {
                            model: NurseProfile, as: 'nurse', include: [
                                { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email', 'phone_number'] }
                            ]
                        }
                    ]
            }]
        });

        if (!shift) {
            return res.status(404).json({ message: 'No such shift available' });
        }

        res.status(200).json({ shift });
    } catch (error) {
        next(error);
    }
};


//creating a shift via route POST /api/shifts for ADMIN
exports.createShift = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            facility_id,
            unit,
            shift_type,
            start_time,
            end_time,
            hourly_rate,
            requirements
        } = req.body;

        //checks if facilityies exits
        const facility = await Facility.findbykey(facility_id);
        if (!facility) {
            return res.status(400).json({ message: 'Facility not found' });
        }

        //create the shift
        const shift = await Shift.create({
            facility_id,
            unit,
            shift_type,
            start_time,
            end_time,
            hourly_rate,
            requirements: requirements || [],
            status: 'open'
        });

        //creating the shift with facility information
        const newShift = await Shift.findbykey(shift.id, {
            include: [
                {
                    model: Facility,
                    as: 'facility'
                }
            ]
        });

        res.status(201).json({ message: 'Shift created successfully', shift: newShift });

    } catch (error) {
        next(error);
    }
};

// Function for updating a shift PUT /api/shifts/:id
exports.updateShift = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;

        //finding the shift
        const shift = await Shifts.findbykey(id);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        //dont allow updating when a shift is already accepted
        if (shift.status !== 'open' && shift.status !== 'cancelled') {
            return res.status(400).json({
                message: 'Cannot update a shift that is already ${shift.status}'
            });
        }

        //updating the shift
        await shift.update(req.body);

        const updatedShift = await Shift.findbykey(id, {
            include: [{
                model: Facility,
                as: 'facility' }
            ]
        });

        res.status(200).json({ 
            message: 'Shift updated successfully', shift: updatedShift
        });
    } catch (error) {
        next(error);
    }
};

//Deleting a shift DELETE /api/shifts/:id FOR ADMIN ONLYS
exports.deleteShift = async (req, res, next) => {
    try {
        const {id} = req.params;

        //find the shift you want to delete
        const shift = await Shift.findbykey(id);
        if(!shift) {
            return res.status(404).json({ message: 'Shift not found'});
        }

        //if the shift is already assigned you cannot delete it
        if(shift.status === 'assigned' || shift.status === 'completed') {
            return res.status(400).json({message: 'Cannot delete shift if already assigned or completed'});
        }

        //delete the shift
        await shift.destroy();

        res.status(200).json({message: 'Shift successfully deleted'});
    } catch (error) {
        next(error);
    }
};

//Canceling a shift 
//may not implement this function if delete shift works. JH 
