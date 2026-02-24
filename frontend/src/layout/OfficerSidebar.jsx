import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, UserCheck, Users, LogOut, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { path: '/officer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/officer/profile', icon: UserCircle, label: 'My Profile' },
    { path: '/officer/jobs', icon: Briefcase, label: 'Manage Jobs' },
    { path: '/officer/applicants', icon: UserCheck, label: 'Applicants' },
    { path: '/officer/students', icon: Users, label: 'Selected Students' }
];

export default function OfficerSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="fixed top-4 left-4 bottom-4 w-56 z-50">
            <div className="glass-panel h-full flex flex-col py-6">
                <div className="px-6 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-[0_0_15px_rgba(157,77,255,0.3)]">
                            <span className="font-bold text-white text-lg">P</span>
                        </div>
                        <span className="text-xl font-bold tracking-wider text-text-primary">OFFICER</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                        const isActive = location.pathname.startsWith(path);

                        return (
                            <NavLink
                                key={path}
                                to={path}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${isActive ? 'text-white font-medium' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                {/* Active/Hover Background */}
                                <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? 'bg-secondary/20 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'}`} />

                                {/* Active Indicator Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="officerActiveIndicator"
                                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-secondary rounded-r-full shadow-[0_0_10px_rgba(157,77,255,0.8)]"
                                    />
                                )}

                                <Icon className={`w-5 h-5 relative z-10 transition-colors duration-300 ${isActive ? 'text-secondary' : 'group-hover:text-secondary/70'}`} />
                                <span className="relative z-10">{label}</span>

                                {!isActive && (
                                    <span className="absolute bottom-2 left-12 right-4 h-[1px] bg-secondary/50 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-colors font-medium border border-danger/20 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
