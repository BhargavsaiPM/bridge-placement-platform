import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { officerApi } from '../../api/officerApi';
import { Users, Briefcase, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

export default function OfficerDashboard() {
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplicants: 0,
        selectedStudents: 0,
        upcomingDeadlines: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // For now, let's fetch jobs and calculate stats manually or use a dedicated endpoint
                const res = await officerApi.getJobs();
                const jobs = Array.isArray(res.data) ? res.data : [];

                const active = jobs.filter(j => j.status === 'OPEN').length;
                let applicants = 0;
                let selected = 0;
                jobs.forEach(j => {
                    applicants += (j.applications ? j.applications.length : 0);
                    selected += (j.applications ? j.applications.filter(a => a.status === 'SELECTED').length : 0);
                });

                setStats({
                    activeJobs: active,
                    totalApplicants: applicants,
                    selectedStudents: selected,
                    upcomingDeadlines: jobs.filter(j => {
                        if (!j.applicationDeadline) return false;
                        const days = (new Date(j.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24);
                        return days >= 0 && days <= 7;
                    }).length
                });

            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
        { label: 'Selected Students', value: stats.selectedStudents, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
        { label: 'Upcoming Deadlines', value: stats.upcomingDeadlines, icon: Clock, color: 'text-danger', bg: 'bg-danger/10' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back! 👋</h1>
                <p className="text-text-secondary">Here's your placement summary directly from your managed job requisitions.</p>
            </div>

            {loading ? (
                <div className="flex h-32 items-center justify-center">
                    <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-panel p-6 flex items-start justify-between group"
                                >
                                    <div>
                                        <p className="text-sm text-text-secondary font-medium mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-bold border-b-2 border-transparent group-hover:border-white/20 transition-all inline-block pb-1">
                                            {stat.value}
                                        </h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Quick Actions */}
                        <div className="glass-panel p-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-secondary" /> Quick Actions
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/officer/jobs" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center group cursor-pointer block">
                                    <Briefcase className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-white">Post New Job</span>
                                </Link>
                                <Link to="/officer/applicants" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center group cursor-pointer block">
                                    <Users className="w-6 h-6 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-white">Review Applicants</span>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Activity (Placeholder) */}
                        <div className="glass-panel p-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-success"></div>
                                    <p className="text-white">Reviewed application for Software Engineer role</p>
                                    <span className="ml-auto text-text-secondary text-xs">2h ago</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <p className="text-white">Posted new job: Frontend Developer</p>
                                    <span className="ml-auto text-text-secondary text-xs">1d ago</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                    <p className="text-white">Updated profile details</p>
                                    <span className="ml-auto text-text-secondary text-xs">3d ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}
