const db = require('../config/db'); // Adjust this path to your database connection module

const updateApplicationStatus = async (req, res) => {
  const { id } = req.params; // Application ID
  const { status } = req.body; // New status

  try {
    // Update the application status
    const result = await db.query(
      `UPDATE applications
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updatedApplication = result.rows[0];

    // If the application is approved, update the shift status to 'assigned'
    if (status === 'approved') {
      await db.query(
        `UPDATE shifts
         SET status = 'assigned', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [updatedApplication.shift_id]
      );
    }

    res.status(200).json(updatedApplication);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

module.exports = {
  updateApplicationStatus,
};