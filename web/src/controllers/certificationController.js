const { Certification, NurseProfile, User } = require('../models');
const { validationResult } = require('express-validator');
const fileUploadService = require('../services/fileUploadService');
const nurse = require('../models/nurse');

// GET all certifications
// GET /api/certifications
exports.getNurseCertifications = async (req, res, next) => {
    try {
        let nurseId;

        //if admin is looking at another nurse's certifications
        if (req.user.role == 'admin' && req.query.nurseId){
            nurseId = req.query.nurseId;
        } else if (req.user.role == 'nurse'){
            nurseId = req.user.nurseProfile.id;
        } else {
            return res.status(400).json({ message: 'Nurse ID is required' });
        }

        const certifications = await Certification.findAll({
            where: { nurseId: nurseId },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ certifications });

    } catch(error) {
        next(error);
    }
};

// GET certification by ID
// GET /api/certifications/:id
exports.getCertificationById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const certification = await Certification.findByPk(id, {
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

        if(!certification) {
            return res.status(404).json({ message: 'Certification not found' });
        }

        //check if user has permission to see certification
        if(req.user.role === 'nurse' && certification.nurseId !== req.user.nurseProfile.id) {
            return res.status(403).json({ message: 'You do not have permission to view this certification' });
        }
        res.status(200).json({ certification });
} catch (error) {
    next(error);
}
};

// POST create certification
// POST /api/certifications
exports.createCertification = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let nurseId;

        //if admin is creating certification for another nurse
        if(req.user.role === 'admin' && req.body.nurseId) {
            nurseId = req.body.nurseId;

            const nurseExists = await NurseProfile.findByPk(nurseId);
            if(!nurseExists) {
                return res.status(404).json({ message: 'Nurse not found' });
            }
        } else if (req.user.role === 'nurse') {
            nurseId = req.user.nurseProfile.id;
        } else {
            return res.status(400).json({ message: 'Nurse ID is required' });
        }


        //upload file
        let documentUrl = null;
        if(req.file){
            documentUrl = await fileUploadService.uploadFile(req.file);
        }

        const certification = await Certification.create({
            nurse_id: nurseId,
            certification_name: req.body.certificationName,
            issuing_body: new Date(req.body.issuingBody),
            status: req.body.status || 'active',
            document_url: documentUrl
        });

        res.status(201).json({ message: 'Certification created suuccessfully',certification });
    } catch (error) {
        next(error);
    }
};

// PUT update certification
// PUT /api/certifications/:id
exports.updateCertification = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const certification = await Certification.findByPk(id);

        if (!certification) {
            return res.status(404).json({ message: 'Certification not found' });
        }

        //check if user has permission
        if(req.user.role === 'nurse' && certification.nurseId !== req.user.nurseProfile.id) {
            return res.status(403).json({ message: 'You do not have permission to update this certification' });
        }

        if(req.file) {
            //delete old document
            if(certification.document_url)
                { await fileUploadService.deletFile(certification.document_url); };

            //upload new document
            certification.document_url =
                await fileUploadService.uploadFile(req.file, 'certifications');
        }

        //update certificaiton fileds
        if (req.body.certificationName)certification.certification_name = req.body.certificationName;
        if (req.body.issuingBody)certification.issuing_body = new Date(req.body.issuingBody);
        if (req.body.status)certification.status = req.body.status;

        await certification.save();

        res.status(200).json({
            message: 'Certification updated successfully',
            certification
        });
    } catch(error){
        next(error);
    }
};

//delete certification
//DELETE /api/certifications/:id
exports.deleteCertification = async (req, res, next) => {
    try {
        const { id } = req.params;

        const certificaiton = await Certification.findByPk(id);

        if(!certification) {
            return res.status(404).json({ message: 'Certification not found' });
        }

        //check if user has permission
        if(req.user.role === 'nurse' && certification.nurseId !== req.user.nurseProfile.id) {
            return res.status(403).json({ message: 'You do not have permission to delete this certification' });
        }

        //delete document
        if(certification.document_url) {
            await fileUploadService.deleteFile(certification.document_url);
        }

        await certification.destroy();

        res.status(200).json({ message: 'Certification deleted successfully' });
    } catch(error){
        next(error);
    }
};