'use client';

import { useLoading } from './LoadingContext';

const LoadingOverlay = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-lg flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">Loading...</h3>
                    <p className="text-white/70 text-sm">Please wait while we process your request</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay; 