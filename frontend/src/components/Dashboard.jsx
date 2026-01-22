import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export default function Dashboard() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const toRoman = (num) => {
        if (!num) return '';
        const romanNumerals = [
            { value: 10, numeral: 'X' },
            { value: 9, numeral: 'IX' },
            { value: 5, numeral: 'V' },
            { value: 4, numeral: 'IV' },
            { value: 1, numeral: 'I' }
        ];
        let result = '';
        for (const { value, numeral } of romanNumerals) {
            while (num >= value) {
                result += numeral;
                num -= value;
            }
        }
        return result;
    };

    const handleClearLogs = async () => {
        if (!window.confirm('Are you sure you want to clear ALL logs? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete('http://localhost:5000/api/library/logs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setLogs([]);
                alert('All logs cleared successfully!');
            }
        } catch (err) {
            console.error('Failed to clear logs', err);
            alert('Failed to clear logs. Please try again.');
        }
    };

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/library/logs', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.data.success) {
                    setLogs(response.data.data.logs.slice(0, 15));
                    setLastUpdated(new Date());
                }
            } catch (err) {
                console.error("Failed to fetch logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();

        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        socket.on('new-scan', (newLog) => {
            console.log('New Scan Received:', newLog);
            setLogs(prevLogs => {
                const updated = [newLog, ...prevLogs].slice(0, 15);
                return updated;
            });
            setLastUpdated(new Date());
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Live Library Monitor</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClearLogs}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                        Clear Logs
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-sm text-gray-500">
                            Real-time (Last Event: {formatTime(lastUpdated)})
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                            <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                            <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Enrollment</th>
                            <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                            <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Dept</th>
                            <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Sem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500">Connecting to server...</td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-500">No recent activity.</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id || Math.random()} className="hover:bg-gray-50 transition-colors animate-fade-in-down">
                                    <td className="py-4 px-6 text-gray-700 font-mono text-sm">
                                        {formatTime(log.timestamp)}
                                    </td>
                                    <td className="py-4 px-6 text-gray-900 font-medium">
                                        {log.name || log.student?.name}
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {log.enrollmentNumber || log.student?.enrollmentNumber}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${log.action === 'ENTRY'
                                                ? 'bg-green-100 text-green-800 border-green-200'
                                                : 'bg-blue-100 text-blue-800 border-blue-200'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {log.department || log.student?.department}
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {toRoman(log.semester || log.student?.semester)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
