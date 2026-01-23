import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8
  },
  enrollmentNumber: {
    type: String,
    required: [true, 'Enrollment number is required'],
    unique: true,
    trim: true,
    uppercase: true
  }
}, {
  timestamps: true
});

// Index for faster enrollment number lookups
// Index for faster enrollment number lookups - REMOVED due to conflict with unique: true
// studentSchema.index({ enrollmentNumber: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
