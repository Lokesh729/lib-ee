import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import api from '../utils/api';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/admin/login', formData);

            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);

                navigate('/admin/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <BookOpen className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Library Management
                    </h1>
                    <p className="text-slate-300">
                        Admin Portal
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Admin Login
                        </CardTitle>
                        <CardDescription>
                            Enter your credentials to access the dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium">
                                    Username
                                </label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                <a href="/" className="hover:underline">
                                    ← Back to Scanner
                                </a>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Demo Credentials */}
                <Card className="mt-4 bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                        <p className="text-sm text-blue-900 font-medium mb-2">Demo Credentials:</p>
                        <p className="text-sm text-blue-800">Username: <code className="bg-blue-100 px-2 py-1 rounded">admin</code></p>
                        <p className="text-sm text-blue-800">Password: <code className="bg-blue-100 px-2 py-1 rounded">admin123</code></p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;
