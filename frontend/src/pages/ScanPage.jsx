import React, { useState } from 'react';
import { CheckCircle, XCircle, User, BookOpen, Smartphone, QrCode } from 'lucide-react';
import ManualInput from '../components/ManualInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import api from '../utils/api';

const ScanPage = () => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleScan = async (enrollmentNumber) => {
        if (loading) return;

        setLoading(true);
        setError(null);
        setScanResult(null);

        try {
            const response = await api.post('/scan', { enrollmentNumber });

            if (response.data.success) {
                setScanResult(response.data.data);

                setTimeout(() => {
                    setScanResult(null);
                    setError(null);
                    setLoading(false);
                }, 4000);
            }
        } catch (err) {
            console.error('Scan error:', err);
            setError(err.response?.data?.message || 'Failed to process scan. Please try again.');

            setTimeout(() => {
                setScanResult(null);
                setError(null);
                setLoading(false);
            }, 4000);
        }
    };

    const handleManualReset = () => {
        setScanResult(null);
        setError(null);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto py-8">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <BookOpen className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Library Entry-Exit System
                    </h1>
                    <p className="text-gray-600">
                        Use the mobile app to scan barcodes or enter enrollment number manually
                    </p>
                </div>

                {/* Mobile App Instructions Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5" />
                            Barcode Scanning via Mobile App
                        </CardTitle>
                        <CardDescription>
                            Download and use our mobile app for quick barcode scanning
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-full p-2 mt-1">
                                    <QrCode className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Step 1: Install Expo Go</h4>
                                    <p className="text-sm text-gray-600">
                                        Download "Expo Go" from the App Store (iOS) or Google Play Store (Android)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-full p-2 mt-1">
                                    <QrCode className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Step 2: Scan QR Code</h4>
                                    <p className="text-sm text-gray-600">
                                        Open Expo Go and scan the QR code from the development server to launch the scanner app
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-full p-2 mt-1">
                                    <QrCode className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Step 3: Scan Student IDs</h4>
                                    <p className="text-sm text-gray-600">
                                        Point your camera at student ID barcodes to automatically log entry/exit
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Manual Entry (Fallback)
                        </CardTitle>
                        <CardDescription>
                            Enter enrollment number manually if barcode scanning is unavailable
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ManualInput onScan={handleScan} />
                    </CardContent>
                </Card>

                {scanResult && (
                    <Alert variant="success" className="mb-6 animate-in fade-in slide-in-from-bottom-4">
                        <CheckCircle className="h-5 w-5" />
                        <AlertTitle className="text-lg font-semibold">
                            {scanResult.action} Recorded Successfully!
                        </AlertTitle>
                        <AlertDescription>
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Name:</span>
                                    <span>{scanResult.student.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Enrollment:</span>
                                    <span>{scanResult.student.enrollmentNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Department:</span>
                                    <span>{scanResult.student.department}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Semester:</span>
                                    <span>{scanResult.student.semester}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Action:</span>
                                    <span className={`font-bold ${scanResult.action === 'ENTRY' ? 'text-green-600' : 'text-blue-600'}`}>
                                        {scanResult.action}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Time:</span>
                                    <span>{new Date(scanResult.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Error Result */}
                {error && (
                    <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-bottom-4">
                        <XCircle className="h-5 w-5" />
                        <AlertTitle className="text-lg font-semibold">Scan Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Manual Reset Button - Only show if there is a result or error to clear, although timeout handles it mostly */}
                {(scanResult || error) && (
                    <div className="text-center">
                        <Button onClick={handleManualReset} variant="outline">
                            Enter Another ID
                        </Button>
                    </div>
                )}

                {/* Admin Link */}
                <div className="text-center mt-8">
                    <a
                        href="/admin/login"
                        className="text-sm text-primary hover:underline"
                    >
                        Admin Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ScanPage;
