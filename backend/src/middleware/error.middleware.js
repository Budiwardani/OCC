import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error(err.message, { stack: err.stack, method: req.method, url: req.originalUrl });

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export default errorHandler;
