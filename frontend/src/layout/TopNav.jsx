import React, { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';

export default function TopNav() {
    const navigate = useNavigate();
    const [profilePhoto, setProfilePhoto] = useState(null);

    useEffect(() => {
        // Fetch profile to see if there's a photo, otherwise we fall back to 'A'
        adminApi.getProfile()
            .then(res => {
                if (res.data?.profilePhoto) {
                    setProfilePhoto(res.data.profilePhoto);
                }
            })
            .catch(err => console.error("Failed to load admin nav profile:", err));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="fixed top-4 left-64 right-4 z-50">
            <div className="glass-panel h-16 flex items-center justify-between px-6">
                <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Admin
                    </span>
                </div>

                <div className="flex items-center space-x-4">
                    <Link to="/admin/profile" className="p-1 hover:bg-white/10 rounded-full transition-colors relative group block">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-white/10 border-2 border-primary/50 relative z-10">
                            {profilePhoto ? (
                                <img src={`http://localhost:9092${profilePhoto}`} alt="Admin Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-primary text-sm group-hover:text-white transition-colors duration-300">A</span>
                            )}
                        </div>
                        <div className="absolute inset-0 rounded-full group-hover:shadow-[0_0_15px_rgba(77,163,255,0.7)] transition-shadow duration-300"></div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-danger/20 rounded-full transition-colors relative group"
                    >
                        <LogOut className="w-5 h-5 text-text-secondary group-hover:text-danger transition-colors duration-300 relative z-10" />
                        <div className="absolute inset-0 rounded-full group-hover:shadow-[0_0_15px_rgba(255,90,122,0.5)] transition-shadow duration-300"></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
