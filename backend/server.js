import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import scanRoutes from './routes/scanRoutes.js';
import authRoutes from './routes/authRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    req.io = io;
    next();
});



app.use('/api/scan', scanRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', authRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: Date.now()
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

io.on('connection', (socket) => {
    console.log('New Client Connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client Disconnected:', socket.id);
    });
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        console.log(`Database: ${mongoose.connection.name}`);

        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API URL: http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
