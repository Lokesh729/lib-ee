import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Admin from './models/Admin.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Student.deleteMany({});
        await Admin.deleteMany({});
        console.log('Cleared existing data');

        const students = [
            {
                name: 'Kunal Dhote ',
                department: 'CSE',
                semester: 5,
                enrollmentNumber: '0126CS231103'
            },
            {
                name: 'Dev Raghuwanshi',
                department: 'AIML',
                semester: 5,
                enrollmentNumber: '0126EC231045'
            },
            {
                name: 'Lokesh Lodhi',
                department: 'CSE',
                semester: 5,
                enrollmentNumber: '0126CS231105'
            },
            {
                name: 'Kanishq Sharma',
                department: 'CIVIL',
                semester: 7,
                enrollmentNumber: '0126CS231092'
            },
            {
                name: 'Manas Malviya',
                department: 'CSE',
                semester: 6,
                enrollmentNumber: '0126CS231106'
            },
            {
                name: 'Vikram Reddy',
                department: 'CSE',
                semester: 2,
                enrollmentNumber: '0126CS241112'
            },
            {
                name: 'Anjali Verma',
                department: 'EEE',
                semester: 5,
                enrollmentNumber: '0126EE231056'
            },
            {
                name: 'Rohan Gupta',
                department: 'CIVIL',
                semester: 3,
                enrollmentNumber: '0126CV231078'
            }
        ];

        await Student.insertMany(students);
        console.log(`Created ${students.length} demo students`);

        const admin = await Admin.create({
            username: 'admin',
            password: 'admin123'
        });
        console.log('Created admin user');
        console.log('   Username: admin');
        console.log('   Password: admin123');

        console.log('\nDatabase seeded successfully!');
        console.log('\nDemo Students:');
        students.forEach(student => {
            console.log(`   - ${student.name} (${student.enrollmentNumber}) - ${student.department}, Sem ${student.semester}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
