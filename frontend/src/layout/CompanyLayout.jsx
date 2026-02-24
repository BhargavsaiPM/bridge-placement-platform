import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import CompanySidebar from './CompanySidebar';
import CompanyTopNav from './CompanyTopNav';

// Basic JWT parse utility strictly for frontend routing protection
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export default function CompanyLayout() {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Validate ROLE_COMPANY
    const decodedData = parseJwt(token);
    // Assuming Spring Security sets authorities array, e.g. [{ authority: "ROLE_COMPANY" }] 
    // or a direct role field depending on backend token format. Checking substring for safety.
    const isCompany = decodedData && decodedData.sub && JSON.stringify(decodedData).includes("COMPANY");

    if (!isCompany && !JSON.stringify(decodedData).includes("SUPER_ADMIN")) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-background text-text-primary flex">
            <CompanySidebar />
            <CompanyTopNav />
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
