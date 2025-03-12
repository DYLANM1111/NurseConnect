// controllers/licenseController.js
const uploadDocument = async (req, res) => {
    try {
      const { licenseId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No document file provided'
        });
      }
      
      const documentUrl = req.file.path; 
      
      const result = await License.update(licenseId, {
        documentUrl
      });
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'License not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Document uploaded successfully',
        data: result
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload document',
        error: error.message
      });
    }
  }