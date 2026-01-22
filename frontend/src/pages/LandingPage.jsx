import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export default function LandingPage() {
    const [status, setStatus] = useState('READY');
    const [lastScan, setLastScan] = useState(null);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('scan-status', (payload) => {
            if (payload.status === 'SCANNED') {
                setLastScan(payload.data);
                setStatus('SCANNED');

                setTimeout(() => {
                    setStatus('READY');
                }, 3000);
            }
        });

        return () => socket.disconnect();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">

            <nav className="p-4 bg-white shadow-sm flex justify-between items-center px-8">
                <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Library<span className="text-gray-900">Gate</span></h1>
                <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                    Admin Login &rarr;
                </Link>
            </nav>

            <main className="flex-1 flex flex-col justify-center items-center p-4">

                {status === 'READY' && (
                    <div className="text-center animate-fade-in">
                        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-100">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-light text-gray-800 mb-2">Ready to Scan</h2>
                        <p className="text-gray-500">Please present your ID card at the terminal.</p>
                    </div>
                )}

                {status === 'SCANNED' && lastScan && (
                    <div className="text-center animate-scale-up">
                        <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl
                    ${lastScan.action === 'ENTRY' ? 'bg-green-500' : 'bg-blue-600'}`}>
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h2 className={`text-4xl font-bold mb-2 ${lastScan.action === 'ENTRY' ? 'text-green-600' : 'text-blue-600'}`}>
                            {lastScan.action} MARKED
                        </h2>

                        <div className="bg-white p-6 rounded-xl shadow-md mt-6 min-w-[300px] border border-gray-100">
                            <p className="text-sm text-gray-400 uppercase font-semibold tracking-wider mb-1">Student</p>
                            <p className="text-2xl font-bold text-gray-900 mb-4">{lastScan.student?.name || lastScan.name}</p>

                            <p className="text-sm text-gray-400 uppercase font-semibold tracking-wider mb-1">Enrollment ID</p>
                            <p className="text-lg font-mono text-gray-700">{lastScan.enrollmentNumber || lastScan.student?.enrollmentNumber}</p>
                        </div>
                    </div>
                )}

            </main>

            {/* Footer */}
            <footer className="p-6 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Library Management System
            </footer>
        </div>
    );
}
