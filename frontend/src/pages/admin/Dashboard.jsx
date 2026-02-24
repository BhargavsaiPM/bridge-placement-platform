import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Users, Briefcase, Building2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        adminApi.getStats()
            .then(res => setStats(res.data))
            .catch(err => {
                console.error("Failed to load stats", err);
                setError("Failed to load statistics. Please try again.");
            })
            .finally(() => setLoading(false));
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
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary' },
        { title: 'Active Companies', value: stats?.activeCompanies || 0, icon: Building2, color: 'text-success' },
        { title: 'Active Jobs', value: stats?.activeJobs || 0, icon: Briefcase, color: 'text-warning' },
        { title: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: Clock, color: 'text-danger' },
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
                        className="glass-panel p-6 flex flex-col justify-between group hover:bg-white/10 transition-colors relative overflow-hidden"
                    >
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
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
