import Student from '../models/Student.js';
import LibraryLog from '../models/LibraryLog.js';

export const processScan = async (req, res) => {
    try {
        const { enrollmentNumber } = req.body;
        const io = req.io;

        if (!enrollmentNumber) {
            return res.status(400).json({
                success: false,
                message: 'Enrollment number is required'
            });
        }

        const student = await Student.findOne({ enrollmentNumber });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const lastLog = await LibraryLog.findOne({ enrollmentNumber })
            .sort({ timestamp: -1 });

        // 3. SILENT COOLDOWN & LOGIC
        if (lastLog) {
            const timeDiff = Date.now() - lastLog.timestamp;
            // 5 seconds cooldown
            if (timeDiff < 5000) {
                console.log(`⏳ Silent Ignore: Cooldown active for ${student.name}`);
                return res.status(200).json({
                    success: true,
                    ignored: true,
                    message: 'Ignored (Cooldown)'
                });
            }
        }

        // 4. Determine Action (Toggle Logic)
        let nextAction = 'ENTRY';
        if (lastLog && lastLog.action === 'ENTRY') {
            nextAction = 'EXIT';
        }

        // 5. Create New Log
        const newLog = new LibraryLog({
            enrollmentNumber: student.enrollmentNumber,
            name: student.name,
            department: student.department,
            semester: student.semester,
            action: nextAction,
            studentId: student._id
        });

        await newLog.save();

        // 6. EMIT REAL-TIME EVENTS
        const payload = {
            student: {
                name: student.name,
                enrollmentNumber: student.enrollmentNumber,
                department: student.department,
                semester: student.semester
            },
            action: nextAction,
            _id: newLog._id,
            timestamp: newLog.timestamp
        };

        // Event for Admin Dashboard (Table update)
        io.emit('new-scan', payload);

        // Event for Landing Page (State Mirroring)
        io.emit('scan-status', {
            status: 'SCANNED',
            data: payload
        });

        // 7. Return Success Response
        return res.status(200).json({
            success: true,
            message: `${nextAction} Recorded`,
            data: payload
        });

    } catch (error) {
        console.error('Scan Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error processing scan',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
