import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, UserCircle, FileText, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { userApi } from '../api/userApi';

const NAV_ITEMS = [
    { path: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/user/applications', icon: FileText, label: 'My Applications' },
    { path: '/user/jobs', icon: Briefcase, label: 'Browse Jobs' },
    { path: '/user/profile', icon: UserCircle, label: 'My Profile' },
];

const getSurnameInitial = (lastName) => {
    const trimmedLastName = lastName?.trim();
    return trimmedLastName ? trimmedLastName[0].toUpperCase() : 'U';
};

const getDisplayName = (firstName, lastName) => {
    const name = [firstName, lastName].filter(Boolean).join(' ').trim();
    return name || 'User Profile';
};

export default function UserSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({ firstName: '', lastName: '', roleType: 'STUDENT' });

    useEffect(() => {
        userApi
            .getProfile()
            .then((res) => {
                const data = res.data;
                if (data) {
                    setProfileData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        roleType: data.roleType || 'STUDENT',
                    });
                }
            })
            .catch((err) => console.error('Failed to load user sidebar profile:', err));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const surnameInitial = getSurnameInitial(profileData.lastName);
    const displayName = getDisplayName(profileData.firstName, profileData.lastName);
    const portalLabel = profileData.roleType === 'WORKING' ? 'Professional Portal' : 'Student Portal';

    return (
        <div className="fixed top-4 left-4 bottom-4 w-56 z-50">
            <div className="glass-panel h-full flex flex-col py-6">
                <div className="px-4 mb-8">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_18px_rgba(77,163,255,0.28)]">
                                <span className="text-lg font-bold text-white">{surnameInitial}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">
                                    {portalLabel}
                                </p>
                                <p className="mt-1 break-words text-sm font-semibold leading-5 text-text-primary">
                                    {displayName}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                        const isActive =
                            location.pathname === path ||
                            (path !== '/user/jobs' && location.pathname.startsWith(path));

                        return (
                            <NavLink
                                key={path}
                                to={path}
                                className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 group ${
                                    isActive ? 'font-medium text-white' : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                <div
                                    className={`absolute inset-0 transition-opacity duration-300 ${
                                        isActive ? 'bg-primary/20 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'
                                    }`}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="userActiveIndicator"
                                        className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-primary shadow-[0_0_10px_rgba(77,163,255,0.8)]"
                                    />
                                )}
                                <Icon
                                    className={`relative z-10 h-5 w-5 transition-colors duration-300 ${
                                        isActive ? 'text-primary' : 'group-hover:text-primary/70'
                                    }`}
                                />
                                <span className="relative z-10">{label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="mt-auto p-4">
                    <button
                        onClick={handleLogout}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 px-4 py-3 font-medium text-danger transition-colors hover:bg-danger/10"
                    >
                        <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
