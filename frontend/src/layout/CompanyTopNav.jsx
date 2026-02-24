import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompanyTopNav() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="fixed top-4 left-[250px] right-4 z-50">
            <div className="glass-panel h-16 flex items-center justify-between px-6 bg-white/5 border-white/10 rounded-2xl backdrop-blur-lg">
                <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                        Company Portal
                    </span>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative group">
                        <User className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-300" />
                        <div className="absolute inset-0 rounded-full group-hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transition-shadow duration-300"></div>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-danger/20 rounded-full transition-colors relative group"
                        title="Log out"
                    >
                        <LogOut className="w-5 h-5 text-text-secondary group-hover:text-danger transition-colors duration-300" />
                        <div className="absolute inset-0 rounded-full group-hover:shadow-[0_0_15px_rgba(255,90,122,0.5)] transition-shadow duration-300"></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
