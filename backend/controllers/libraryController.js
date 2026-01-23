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

export const exportLogs = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            enrollmentNumber,
            action
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

        if (action) {
            filter.action = action;
        }

        // Fetch all logs matching filter, sorted by student and time
        const logs = await LibraryLog.find(filter)
            .sort({ enrollmentNumber: 1, timestamp: 1 })
            .populate('studentId', 'name enrollmentNumber department semester');

        // Process logs to pair Entry/Exit
        const processedRows = [];
        const studentLogs = {};

        // Group by enrollment number
        logs.forEach(log => {
            if (!studentLogs[log.enrollmentNumber]) {
                studentLogs[log.enrollmentNumber] = [];
            }
            studentLogs[log.enrollmentNumber].push(log);
        });

        Object.values(studentLogs).forEach(sLogs => {
            let entryLog = null;

            sLogs.forEach(log => {
                if (log.action === 'ENTRY') {
                    if (entryLog) {
                        // Previous entry without exit
                        const entryDate = new Date(entryLog.timestamp);
                        processedRows.push({
                            enrollment: entryLog.enrollmentNumber,
                            name: entryLog.name,
                            sem: entryLog.semester,
                            dept: entryLog.department,
                            date: entryDate.toLocaleDateString('en-GB'), // DD/MM/YYYY
                            entryTime: entryDate.toLocaleTimeString('en-GB'), // HH:mm:ss
                            exitTime: 'Active',
                            duration: ''
                        });
                    }
                    entryLog = log;
                } else if (log.action === 'EXIT') {
                    if (entryLog) {
                        // Pair found
                        const durationMs = log.timestamp - entryLog.timestamp;
                        const durationMinutes = Math.floor(durationMs / 60000);
                        const hours = Math.floor(durationMinutes / 60);
                        const minutes = durationMinutes % 60;

                        const entryDate = new Date(entryLog.timestamp);
                        const exitDate = new Date(log.timestamp);

                        processedRows.push({
                            enrollment: entryLog.enrollmentNumber,
                            name: entryLog.name,
                            sem: entryLog.semester,
                            dept: entryLog.department,
                            date: entryDate.toLocaleDateString('en-GB'), // DD/MM/YYYY
                            entryTime: entryDate.toLocaleTimeString('en-GB'), // HH:mm:ss
                            exitTime: exitDate.toLocaleTimeString('en-GB'), // HH:mm:ss
                            duration: `${hours}h ${minutes}m`
                        });
                        entryLog = null;
                    } else {
                        // Exit without Entry - ignore
                    }
                }
            });

            // If still has entryLog, it's active
            if (entryLog) {
                const entryDate = new Date(entryLog.timestamp);
                processedRows.push({
                    enrollment: entryLog.enrollmentNumber,
                    name: entryLog.name,
                    sem: entryLog.semester,
                    dept: entryLog.department,
                    date: entryDate.toLocaleDateString('en-GB'), // DD/MM/YYYY
                    entryTime: entryDate.toLocaleTimeString('en-GB'), // HH:mm:ss
                    exitTime: 'Active',
                    duration: ''
                });
            }
        });

        // CSV Header: Enrollment, Student Name, Sem, Dept, Date, Entry Time, Exit Time, Total Duration
        let csv = 'Enrollment,Student Name,Sem,Dept,Date,Entry Time,Exit Time,Total Duration\n';

        // CSV Rows
        processedRows.forEach(row => {
            csv += `"${row.enrollment}","${row.name}","${row.sem}","${row.dept}","${row.date}","${row.entryTime}","${row.exitTime}","${row.duration}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('library_logs.csv');
        res.send(csv);

    } catch (error) {
        console.error('Export logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while exporting logs',
            error: error.message
        });
    }
};
