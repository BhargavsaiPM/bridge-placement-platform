import React, { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { officerApi } from '../api/officerApi';
import NotificationBell from '../components/shared/NotificationBell';
import { getAssetUrl } from '../api/runtime';

const getOfficerInitial = (name) => {
    const trimmedName = name?.trim();
    return trimmedName ? trimmedName[0].toUpperCase() : 'O';
};

const getDisplayName = (name) => name?.trim() || 'Placement Officer';

export default function OfficerTopNav() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        name: '',
        jobRole: 'PLACEMENT OFFICER',
        profilePhoto: null,
    });

    useEffect(() => {
        officerApi
            .getProfile()
            .then((res) => {
                if (res.data) {
                    setProfileData({
                        name: res.data.name || '',
                        jobRole: res.data.jobRole || 'PLACEMENT OFFICER',
                        profilePhoto: res.data.profilePhoto || null,
                    });
                }
            })
            .catch((err) => console.error('Failed to load officer nav profile:', err));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const displayName = getDisplayName(profileData.name);
    const officerInitial = getOfficerInitial(profileData.name);

    return (
        <div className="fixed top-4 left-64 right-4 z-50">
            <div className="glass-panel flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-6">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-secondary/75">
                        Officer Space
                    </p>
                    <p className="truncate bg-gradient-to-r from-secondary to-primary bg-clip-text text-xl font-bold text-transparent">
                        Officer Dashboard
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <Link
                        to="/officer/profile"
                        className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/[0.08]"
                    >
                        <div className="relative z-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-secondary/50 bg-white/10">
                            {profileData.profilePhoto ? (
                                <img
                                    src={getAssetUrl(profileData.profilePhoto)}
                                    alt="Officer Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-bold text-secondary transition-colors duration-300 group-hover:text-white">
                                    {officerInitial}
                                </span>
                            )}
                        </div>
                        <div className="hidden max-w-[160px] min-w-0 sm:block">
                            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                            <p className="truncate text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                                {profileData.jobRole}
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
