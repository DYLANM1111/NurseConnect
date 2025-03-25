const { timeRecord, Shift, NurseProfile, User, Facility, Payment } = require('../models');
const { validationResult } = require('express-validator');
const fileUploadService = require('../services/fileUploadService');
const user = require('../models/user');

// // GET all time records
// // GET /api/time-records
exports.getAllTimeRecords = async (req, res, next) => {
    try {
        let where = {};

        // filtering by nurse
        if (req.user.role === 'nurse') { //nurse can see their time records
            where.nurseId = req.user.nurseProfile.id;
        } else if (req.user.role === 'admin' && req.query.nurseId) { //admin can see all time records of a specific nurse
            where.nurseId = req.query.nurseId;
        }

        //other filtering
        if (req.query.status) {
            where.status = req.query.status;
        }

        if (req.query.facilityId) {
            where.facilityId = req.query.facilityId;
        }

        if (req.quer.shiftId) {
            where.shiftId = req.query.shiftId;
        }

        //date range
        if (req.query.startDate && req.query.endDate) {
            where.createdAt = {
                [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
            };
        } else if (req.query.startDate) {
            where.createdAt = {
                [Op.gte]: new Date(req.query.startDate)
            };
        } else if (req.query.endDate) {
            where.createdAt = {
                [Op.lte]: new Date(req.query.endDate)
            };
        }

        const timeRecords = await timeRecord.findAll({
            where,
            include: [
                {
                    model: Shift, 
                    as: 'shift', 
                    include: [{ 
                        model: Facility, 
                        as: 'facility' }]
                }, 
                {
                    model: NurseProfile,
                    as: 'nurse',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['first_name', 'last_name', 'email', 'phone_number']}]
                },
                {
                    model: Payment,
                    as: 'payment',
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ timeRecords });

    } catch (error) {
        next(error);
    }
};


// get time record by ID
// GET /api/time-records/:id
exports.getTimeRecordById = async (req, res, next) => {
    try{
        const { id } = req.params;

        const timeRecord = await timeRecord.findByPk(id, {
            include: [
                {
                    model: Shift,
                    as: 'shift',
                    include: [
                        {
                            model: Facility,
                            as: 'facility'
                        }
                    ]
                },
                {
                    model: NurseProfile,
                    as: 'nurse',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['first_name', 'last_name', 'email', 'phone_number']
                        }
                    ]
                },
                {
                    model: Payment,
                    as: 'payment',
                    required: false
                }
            ]});

            if(!timeRecord){
                return res.status(404).json({ message: 'Time record not found' });
            }

            if(req.user.role === 'nurse' && timeRecord.nurseId !== req.user.nurseProfile.id) {
                return res.status(403).json({ message: 'You do not have permission to view this time record' });
            }

            res.status(200).json({ timeRecord });
    } catch(error){
        next(error);
    }
};

// // POST create time record
// // POST /api/time-records/clockin
exports.clockIn = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const { shiftId } = req.body;

        //verify that shift exists
        const shift = await Shift.findByPk(shiftId);
        if(!shift){
            return res.status(404).json({ message: 'Shift not found' });
        }

        //verify that nurse is assigned to shift
        const existingTimeRecord = await timeRecord.findOne({
            where: {
                shift_id: shiftId,
                nurse_id: req.user.nurseProfile.id,
                clock_out: null
            }
        });

        
        if(existingTimeRecord){
            return res.status(400).json({ message: 'You are already clocked in for this shift' });
        }

        //create time record
        const timeRecord = await timeRecord.create({
            shift_id: shiftId,
            nurse_id: req.user.nurseProfile.id,
            clock_in: new Date(),
            status: 'pending'
        });

        res.status(201).json({ message: 'Successfully clocked in', timeRecord });
    } catch(error){
        next(error);
    }
}

// PUT update time record
// PUT /api/time-records/clockout/:id



//PATCH approve or deny time update

