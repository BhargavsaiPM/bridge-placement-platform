import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import OfficerSidebar from './OfficerSidebar';

export default function OfficerLayout() {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const rolesStr = JSON.stringify(payload);
        if (!rolesStr.includes('PLACEMENT_OFFICER')) return <Navigate to="/login" replace />;
    } catch (e) {
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

            <div className="pl-64 pr-4 py-4 min-h-screen z-10 relative">
                <main className="h-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
