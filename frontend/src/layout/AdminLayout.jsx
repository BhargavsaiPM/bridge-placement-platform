import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function AdminLayout() {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'SUPER_ADMIN') {
            return <Navigate to="/login" replace />;
        }
    } catch (e) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-background text-text-primary flex">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px]"></div>
            </div>

            <Sidebar />
            <TopNav />
            {/* 
        Spacing metrics: 
        Sidebar width = 56 (224px) + left offset 4 (16px) -> 240px offset, using 250px margin
        TopNav height = 16 (64px) + top offset 4 (16px) -> 80px offset
      */}
            <main className="flex-1 ml-[250px] mt-24 px-8 pb-8 z-10 relative">
                <div className="max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
