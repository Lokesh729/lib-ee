import LibraryLog from '../models/LibraryLog.js';

export const getLogs = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            enrollmentNumber,
            action,
            page = 1,
            limit = 50
        } = req.query;

        const filter = {};

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) {
                filter.timestamp.$gte = parseInt(startDate);
            }
            if (endDate) {
                filter.timestamp.$lte = parseInt(endDate);
            }
        }

        if (enrollmentNumber) {
            filter.enrollmentNumber = enrollmentNumber.toUpperCase();
        }

        // Action filter
        if (action) {
            filter.action = action;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get logs with filters and pagination
        const logs = await LibraryLog.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('studentId', 'name enrollmentNumber department semester');

        // Get total count for pagination
        const totalLogs = await LibraryLog.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                logs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalLogs / parseInt(limit)),
                    totalLogs,
                    logsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching logs',
            error: error.message
        });
    }
};

export const clearLogs = async (req, res) => {
    try {
        await LibraryLog.deleteMany({});

        res.status(200).json({
            success: true,
            message: 'All logs cleared successfully'
        });
    } catch (error) {
        console.error('Clear logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while clearing logs',
            error: error.message
        });
    }
};
