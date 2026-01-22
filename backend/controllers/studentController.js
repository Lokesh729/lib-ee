import Student from '../models/Student.js';

export const getStudentByEnrollment = async (req, res) => {
    try {
        const { enrollment } = req.params;

        if (!enrollment) {
            return res.status(400).json({
                success: false,
                message: 'Enrollment number is required'
            });
        }

        const student = await Student.findOne({
            enrollmentNumber: enrollment.toUpperCase()
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching student',
            error: error.message
        });
    }
};
