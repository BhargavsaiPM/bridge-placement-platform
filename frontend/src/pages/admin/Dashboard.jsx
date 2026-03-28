import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Users, Briefcase, Building2, Clock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loginLogs, setLoginLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([
            adminApi.getStats(),
            adminApi.getLoginLogs().catch(() => ({ data: [] }))
        ]).then(([statsRes, logsRes]) => {
            setStats(statsRes.data);
            setLoginLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load stats", err);
            setError("Failed to load statistics. Please try again.");
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel p-6 border-danger/50 bg-danger/10">
                <p className="text-danger">{error}</p>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary', link: '/admin/activity?tab=users' },
        { title: 'Active Companies', value: stats?.activeCompanies || 0, icon: Building2, color: 'text-success', link: '/admin/activity?tab=companies' },
        { title: 'Active Job Postings', value: stats?.activeJobs || 0, icon: Briefcase, color: 'text-warning', link: '/admin/activity?tab=jobs' },
        { title: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: Clock, color: 'text-danger', link: '/admin/approvals' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                    Dashboard Overview
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Real-time statistics regarding your platform operations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="h-full"
                    >
                        <Link to={card.link} className="block h-full glass-panel p-6 flex flex-col justify-between group hover:bg-white/10 transition-colors relative overflow-hidden cursor-pointer">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <span className="text-text-secondary font-medium tracking-wide text-sm">{card.title}</span>
                                <div className={`p-2 rounded-xl bg-white/5 backdrop-blur-md ${card.color}`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-6 relative z-10">
                                <span className="text-4xl font-bold tracking-tight">{card.value}</span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Login Logs Section added here manually */}
            <div className="glass-panel p-6 mt-6">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <LogIn className="w-5 h-5 text-secondary" /> Recent Login Logs
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {loginLogs.length > 0 ? loginLogs.map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                            <div>
                                <div className="font-medium text-sm">{log.email || 'Unknown User'}</div>
                                <div className="text-xs text-text-secondary flex items-center gap-2 mt-1">
                                    <span>IP: {log.ipAddress || '127.0.0.1'}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                    <span>{log.status || 'SUCCESS'}</span>
                                </div>
                            </div>
                            <div className="text-xs text-text-secondary">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-text-secondary text-sm">No recent login logs available.</div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
