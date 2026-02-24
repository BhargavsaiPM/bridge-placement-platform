import React, { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { Users, Briefcase, UserCheck, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import ActivityTimeline from '../../components/company/ActivityTimeline';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        try {
            const res = await companyApi.getDashboardStats();
            if (res.data) {
                setStats(res.data.stats || res.data); // Support flat or nested Object
                setActivities(res.data.recentActivity || []);
            }
            setError(null);
        } catch (err) {
            console.error("Failed to fetch company dashboard", err);
            // Don't overwrite existing data on poll failure
            if (!stats) setError("Could not load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // Poll every 15s
        const intervalId = setInterval(fetchDashboardData, 15000);
        return () => clearInterval(intervalId);
    }, []);

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-success border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="glass-panel p-6 border-danger/50 bg-danger/10">
                <p className="text-danger">{error}</p>
            </div>
        );
    }

    const statCards = [
        { title: 'Active Officers', value: stats?.activeOfficers || 0, icon: Users, color: 'text-primary' },
        { title: 'Active Jobs', value: stats?.activeJobs || 0, icon: Briefcase, color: 'text-warning' },
        { title: 'Apps Received', value: stats?.applicationsReceived || 0, icon: UserCheck, color: 'text-success' },
        { title: 'Hired This Month', value: stats?.studentsHiredThisMonth || 0, icon: GraduationCap, color: 'text-secondary' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                    Company Overview
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Real-time stats updating automatically every 15s.</p>
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
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-success/10 transition-colors"></div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <div className="glass-panel p-6 lg:col-span-2 flex flex-col">
                    <h3 className="text-lg font-bold mb-6">Application Trends</h3>
                    <div className="flex-1 flex items-end gap-4 h-48 mt-auto px-4">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
                            // Generating pseudo-random heights based on month index for consistent looks
                            const height = Math.max(20, 30 + (idx * 15) % 60);
                            return (
                                <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full relative flex-1 flex items-end justify-center rounded-t-md overflow-hidden bg-white/5">
                                        <div
                                            className="w-full bg-gradient-to-t from-primary/50 to-success/50 transition-all duration-500 group-hover:from-primary group-hover:to-success"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-text-secondary font-medium">{month}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                    <ActivityTimeline activities={activities} />
                </div>
            </div>
        </motion.div >
    );
}
