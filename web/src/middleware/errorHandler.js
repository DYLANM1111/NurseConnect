// Error handling middleware
module.exports = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace for debugging

    const statusCode = err.statusCode || 500; // Default to 500 if no status code is set
    const message = err.message || 'Internal Server Error'; // Default to a generic message if none is set

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack // Hide stack trace in production
    });
};