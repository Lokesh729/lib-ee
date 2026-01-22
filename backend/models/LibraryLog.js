import mongoose from 'mongoose';

const libraryLogSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    enrollmentNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: Number,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['ENTRY', 'EXIT']
    },
    timestamp: {
        type: Number,
        required: true,
        default: () => Date.now()
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
libraryLogSchema.index({ enrollmentNumber: 1, timestamp: -1 });
libraryLogSchema.index({ timestamp: -1 });
libraryLogSchema.index({ action: 1 });

const LibraryLog = mongoose.model('LibraryLog', libraryLogSchema);

export default LibraryLog;
