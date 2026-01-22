import React, { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const ManualInput = ({ onScan }) => {
    const [enrollmentNumber, setEnrollmentNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!enrollmentNumber.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onScan(enrollmentNumber.trim());
            setEnrollmentNumber('');
        } catch (error) {
            console.error('Manual input error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Keyboard className="w-4 h-4" />
                <span className="font-medium">Or manually enter enrollment number</span>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                    type="text"
                    placeholder="Enter enrollment number"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1 text-lg"
                    autoComplete="off"
                />
                <Button
                    type="submit"
                    disabled={!enrollmentNumber.trim() || isSubmitting}
                    className="px-6"
                >
                    {isSubmitting ? 'Processing...' : 'Submit'}
                </Button>
            </form>
        </div>
    );
};

export default ManualInput;
