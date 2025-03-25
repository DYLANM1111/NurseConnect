const { License, NurseProfile, User } = require('../models');
const { validationResult } = require('express-validator');
// need to add this service so that they can add files
const fileUploadService = require('../services/fileUploadService');


// GET all licenses
// GET /api/licenses
exports.GetNurseLicense = async (req, res, next) => {
    try {
        let nurseId;

        if(req.user.role === 'admin' && req.query.nurseId) {
            nurseId = req.query.nurseId;
        } else if (req.user.role === 'nurse') {
            nurseId = req.user.NurseProfile.nurseId;
        } else {
            return res.status(400).json({ message: 'Nurse ID is required' });
        }

        const licenses = await License.findAll({
            where: { nurseId: nurseId },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ licenses });
    } catch (error) {
        next(error);
    }
}

// GET license by ID
// GET /api/licenses/:id
exports.getLicenseById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const license = await License.findByPk(id, {
            include: [
                { model: NurseProfile,
                    as: 'nurse',
                    include: [
                        { model: User,
                           as: 'user',
                           attributes: ['first_name', 'last_name', 'email']
                        }
                    ]
                }
            ]
        });
        if (!license) {
            return res.status(404).json({ message: 'License not found' });
        }

        //check if user has permission to see license
        if(req.user.role === 'nurse' && license.nurseId !== req.user.nurseProfile.id) {
            return res.status(403).json({ message: 'You do not have permission to view this license'});
        }
        res.status(200).json({ license });
    } catch (error) {
        next(error);
    }
};

// POST create license
// POST /api/licenses
exports.createLicense = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let nurseId;

        if(req.user.role === 'admin' && req.body.nurseId) {
            nurseId = req.body.nurseId;

            //check if nurse is in db
            const nurseExists = await NurseProfile.findByPk(nurseId);
            if(!nurseExists) {
                return res.status(404).json({ message: 'Nurse not found' });
            }
        } else if (req.user.role === 'nurse') {
            nurseId = req.user.NurseProfile.id;
        } else {
            return res.status(400).json({ message: 'Nurse ID is required' });
        }

        //file upload
        let documentUrl = null;
        if(req.file) {
            documentUrl = await fileUploadService.uploadFile(req.file, 'licenses');
        }

        //const { licenseType, licenseNumber, state, expirationDate, status} = req.body;

        const newLicense = await License.create({
            nurse_id: nurseId,
            license_type: licenseType,
            license_number: licenseNumber,
            state: state,
            expiry_date: expirationDate,
            status: status,
            document_url: documentUrl,
        });

        res.status(201).json({ message: 'License created successfully',
        license });

    } catch (error) {
        next(error);
    }
};

// PUT update license
// PUT /api/licenses/:id
exports.updateLicense = async (req, res, next) => {
    try { 
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;

        const license = await License.findByPk(id);
        if(!license) {
            return res.status(404).json({ message: 'License not found' });
        }

        //check if user has permission
        if(req.user.role === 'nurse' && license.nurseId !== req.user.nurseProfile.id) {
            return res.status(403).json({ message: 'You do not have permission to update this license'});
        }

        //file upload
        if(req.file) {
            //delete old file
            if(license.document_url) {
                await fileUploadService.deleteFile(license.document_url);
            }

            //upload new file
            license.document_url = await fileUploadService.uploadFile(req.file, 'licenses');
        }

        //update license
        if (req.body.licenseType) {
            license.license_type = req.body.licenseType;
        }
        if(req.body.licenseNumber){
            license.license_number = req.body.licenseNumber;
        }
        if(req.body.state){
            license.state = req.body.state;
        }
        if(req.body.expiryDate) {
            license.expiry_date = new Date(req.body.expiryDate);
        }
        if(req.body.status) {
            license.status = req.body.status;
        }

        await license.save();

        res.status(200).json({ message: 'License updated successfully', license });
    } catch (error) {
        next(error);
    }
};


//delete license
//DELETE /api/licenses/:id
exports.deleteLicense = async (req, res, next) => {
    try { 
        const { id } = req.params;

        const license = await License.findByPk(id);
        if(!license) {
            return res.status(404).json({ message: 'License not found' });
        }

        //check if user has permission
        if(req.user.role === 'nurse' && license.nurseId !== req.user.nurseProfile.id) {
            return res.status(403).json({ message: 'You do not have permission to delete this license'});
        }

        //delete file
        if(license.document_url) {
            await fileUploadService.deleteFile(license.document_url);
        }

        await license.destroy();

        res.status(200).json({ message: 'License deleted successfully' });
    } catch (error) {
        next(error);
    }
};



