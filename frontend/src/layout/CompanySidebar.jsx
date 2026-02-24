import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    UserCheck,
    BarChart2,
    GraduationCap,
    UserCircle,
    LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { path: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/company/profile', icon: UserCircle, label: 'Company Profile' },
    { path: '/company/officers', icon: Users, label: 'Placement Officers' },
    { path: '/company/jobs', icon: Briefcase, label: 'Jobs' },
    { path: '/company/applicants', icon: UserCheck, label: 'Applicants' },
    { path: '/company/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/company/students', icon: GraduationCap, label: 'Selected Students' },
];

export default function CompanySidebar() {
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success to-primary flex items-center justify-center shadow-[0_0_15px_rgba(44,230,179,0.3)]">
                            <span className="font-bold text-white text-lg">C</span>
                        </div>
                        <span className="text-xl font-bold tracking-wider text-text-primary">CORP</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                        const isActive = location.pathname.startsWith(path);

                        return (
                            <NavLink
                                key={path}
                                to={path}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${isActive ? 'text-white font-medium' : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {/* Active/Hover Background */}
                                <div
                                    className={`absolute inset-0 transition-opacity duration-300 ${isActive ? 'bg-success/20 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'
                                        }`}
                                />

                                {/* Active Indicator Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="companyActiveIndicator"
                                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-success rounded-r-full shadow-[0_0_10px_rgba(44,230,179,0.8)]"
                                    />
                                )}

                                <Icon className={`w-5 h-5 relative z-10 transition-colors duration-300 ${isActive ? 'text-success' : 'group-hover:text-success/70'}`} />
                                <span className="relative z-10">{label}</span>

                                {/* Animated underline hover */}
                                {!isActive && (
                                    <span className="absolute bottom-2 left-12 right-4 h-[1px] bg-success/50 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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
