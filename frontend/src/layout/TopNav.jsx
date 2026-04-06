import React, { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { getAssetUrl } from '../api/runtime';

const getAdminInitial = (name) => {
    const trimmedName = name?.trim();
    return trimmedName ? trimmedName[0].toUpperCase() : 'A';
};

const getDisplayName = (name) => name?.trim() || 'Admin Profile';

export default function TopNav() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        name: '',
        profilePhoto: null,
        roleType: 'SUPER ADMIN',
    });

    useEffect(() => {
        adminApi
            .getProfile()
            .then((res) => {
                if (res.data) {
                    setProfileData({
                        name: res.data.name || '',
                        profilePhoto: res.data.profilePhoto || null,
                        roleType: res.data.roleType?.replace(/_/g, ' ') || 'SUPER ADMIN',
                    });
                }
            })
            .catch((err) => console.error('Failed to load admin nav profile:', err));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const displayName = getDisplayName(profileData.name);
    const adminInitial = getAdminInitial(profileData.name);

    return (
        <div className="fixed top-4 left-64 right-4 z-50">
            <div className="glass-panel flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-6">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/75">
                        Admin Space
                    </p>
                    <p className="truncate bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent">
                        Admin Dashboard
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/profile"
                        className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/[0.08]"
                    >
                        <div className="relative z-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-primary/50 bg-white/10">
                            {profileData.profilePhoto ? (
                                <img
                                    src={getAssetUrl(profileData.profilePhoto)}
                                    alt="Admin Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-bold text-primary transition-colors duration-300 group-hover:text-white">
                                    {adminInitial}
                                </span>
                            )}
                        </div>
                        <div className="hidden max-w-[160px] min-w-0 sm:block">
                            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                            <p className="truncate text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                                {profileData.roleType}
                            </p>
                        </div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="group relative rounded-full p-2 transition-colors hover:bg-danger/20"
                        title="Log out"
                    >
                        <LogOut className="relative z-10 h-5 w-5 text-text-secondary transition-colors duration-300 group-hover:text-danger" />
                        <div className="absolute inset-0 rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_15px_rgba(255,90,122,0.5)]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
