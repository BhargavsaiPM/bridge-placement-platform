import React, { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../api/userApi';
import NotificationBell from '../components/shared/NotificationBell';
import { getAssetUrl } from '../api/runtime';

const getSurnameInitial = (lastName) => {
    const trimmedLastName = lastName?.trim();
    return trimmedLastName ? trimmedLastName[0].toUpperCase() : 'U';
};

const getDisplayName = (firstName, lastName) => {
    const name = [firstName, lastName].filter(Boolean).join(' ').trim();
    return name || 'User Profile';
};

export default function UserTopNav() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        photo: null,
        initials: 'U',
        role: 'STUDENT',
    });

    useEffect(() => {
        userApi
            .getProfile()
            .then((res) => {
                const data = res.data;
                if (data) {
                    setProfileData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        photo: data.profilePhoto,
                        initials: getSurnameInitial(data.lastName),
                        role: data.roleType ? data.roleType.replace('_', ' ') : 'STUDENT',
                    });
                }
            })
            .catch((err) => console.error('Failed to load user nav profile:', err));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const displayName = getDisplayName(profileData.firstName, profileData.lastName);
    const isWorkingProfessional = profileData.role === 'WORKING';
    const portalLabel = isWorkingProfessional ? 'Professional Space' : 'Student Space';
    const dashboardLabel = isWorkingProfessional ? 'Professional Dashboard' : 'Student Dashboard';

    return (
        <div className="fixed top-4 left-64 right-4 z-50">
            <div className="glass-panel flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-6">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/75">
                        {portalLabel}
                    </p>
                    <p className="truncate bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent">
                        {dashboardLabel}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <Link
                        to="/user/profile"
                        className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/[0.08]"
                    >
                        <div className="relative z-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-primary/50 bg-white/10">
                            {profileData.photo ? (
                                <img
                                    src={getAssetUrl(profileData.photo)}
                                    alt="User Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-bold text-primary transition-colors duration-300 group-hover:text-white">
                                    {profileData.initials}
                                </span>
                            )}
                        </div>
                        <div className="hidden max-w-[140px] min-w-0 sm:block">
                            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                            <p className="truncate text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                                {profileData.role}
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
