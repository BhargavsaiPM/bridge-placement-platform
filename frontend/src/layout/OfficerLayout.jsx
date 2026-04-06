import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import OfficerSidebar from './OfficerSidebar';
import OfficerTopNav from './OfficerTopNav';
import { getStoredTokenPayload, hasRole } from '../utils/auth';

export default function OfficerLayout() {
    const payload = getStoredTokenPayload();
    if (!payload || !hasRole(payload, 'PLACEMENT_OFFICER')) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Background elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"></div>
            </div>

            <OfficerSidebar />
            <OfficerTopNav />

            <div className="pl-64 pr-8 pt-24 pb-8 min-h-screen z-10 relative">
                <main className="h-full">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
