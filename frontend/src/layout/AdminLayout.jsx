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
            <Sidebar />
            <TopNav />
            {/* 
        Spacing metrics: 
        Sidebar width = 56 (224px) + left offset 4 (16px) -> 240px offset, using 250px margin
        TopNav height = 16 (64px) + top offset 4 (16px) -> 80px offset
      */}
            <main className="flex-1 ml-[250px] mt-24 px-8 pb-8">
                <div className="max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
