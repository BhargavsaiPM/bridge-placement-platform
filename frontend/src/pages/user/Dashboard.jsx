import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userApi } from '../../api/userApi';
import { publicApi } from '../../api/publicApi';
import {
    FileText, CheckCircle2, Clock, X, Users, Briefcase,
    ArrowRight, TrendingUp, User
} from 'lucide-react';

const STATUS_CONFIG = {
    APPLIED: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
    SHORTLISTED: { label: 'Shortlisted', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
    INTERVIEW: { label: 'Interview', color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/30' },
    SELECTED: { label: 'Selected', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
    REJECTED: { label: 'Rejected', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' },
};

export default function UserDashboard() {
    const [applications, setApplications] = useState([]);
    const [profile, setProfile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [profileRes, appsRes, jobsRes] = await Promise.allSettled([
                    userApi.getProfile(),
                    userApi.getApplications ? userApi.getApplications() : Promise.reject(),
                    publicApi.searchJobs()
                ]);

                if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
                if (appsRes.status === 'fulfilled') setApplications(Array.isArray(appsRes.value.data) ? appsRes.value.data : []);
                if (jobsRes.status === 'fulfilled') setJobs(Array.isArray(jobsRes.value.data) ? jobsRes.value.data.slice(0, 3) : []);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const countByStatus = (status) => applications.filter(a => a.status === status).length;

    const stats = [
        { label: 'Total Applied', value: applications.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Pending', value: countByStatus('APPLIED'), icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
        { label: 'Shortlisted', value: countByStatus('SHORTLISTED'), icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
        { label: 'Interviews', value: countByStatus('INTERVIEW'), icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Selected', value: countByStatus('SELECTED'), icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
        { label: 'Rejected', value: countByStatus('REJECTED'), icon: X, color: 'text-danger', bg: 'bg-danger/10' },
    ];

    // Profile completeness
    const fields = ['name', 'email', 'mobile', 'dob', 'skills', 'resumeUrl', 'githubLink'];
    const filled = profile ? fields.filter(f => profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : true)).length : 0;
    const completeness = profile ? Math.round((filled / fields.length) * 100) : 0;

    const recentApps = [...applications].slice(0, 5);

    const quickActions = [
        { label: 'Browse Jobs', icon: Briefcase, to: '/jobs', color: 'from-primary/20 to-primary/5 border-primary/30 hover:border-primary/60' },
        { label: 'My Applications', icon: FileText, to: '/user/applications', color: 'from-secondary/20 to-secondary/5 border-secondary/30 hover:border-secondary/60' },
        { label: 'Edit Profile', icon: User, to: '/user/profile', color: 'from-success/20 to-success/5 border-success/30 hover:border-success/60' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-4 md:p-6">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                    Welcome Back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}! 👋
                </h1>
                <p className="text-text-secondary">Here's your placement journey at a glance.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.07 }}
                            className="glass-panel p-4 flex flex-col items-start gap-2"
                        >
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <Icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <p className="text-xs text-text-secondary font-medium">{stat.label}</p>
                            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Applications */}
                <div className="lg:col-span-2 glass-panel p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
                        <h3 className="text-lg font-bold text-white">Recent Applications</h3>
                        <Link to="/user/applications" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {recentApps.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                            <Briefcase className="w-10 h-10 text-white/20 mb-3" />
                            <p className="text-text-secondary text-sm">No applications yet.</p>
                            <Link to="/jobs" className="mt-3 text-primary text-sm font-medium hover:underline">Browse Jobs →</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentApps.map((app, i) => {
                                const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG['APPLIED'];
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                        <div>
                                            <p className="font-medium text-white text-sm">{app.job?.title || 'Job Title'}</p>
                                            <p className="text-xs text-text-secondary">{app.job?.company?.name || 'Company'}</p>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right panel */}
                <div className="space-y-6">
                    {/* Profile Completion */}
                    <div className="glass-panel p-6">
                        <h3 className="text-base font-bold text-white mb-4">Profile Completion</h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-text-secondary">Completeness</span>
                            <span className="text-sm font-bold text-white">{completeness}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completeness}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                            />
                        </div>
                        {completeness < 100 && (
                            <Link to="/user/profile" className="text-xs text-primary hover:underline">
                                Complete your profile →
                            </Link>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="glass-panel p-6">
                        <h3 className="text-base font-bold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            {quickActions.map(({ label, icon: Icon, to, color }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r border transition-all group ${color}`}
                                >
                                    <Icon className="w-4 h-4 text-white" />
                                    <span className="text-sm font-medium text-white">{label}</span>
                                    <ArrowRight className="w-3 h-3 ml-auto text-white/50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Jobs */}
            {jobs.length > 0 && (
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
                        <h3 className="text-lg font-bold text-white">Recommended Jobs</h3>
                        <Link to="/jobs" className="text-primary text-sm font-medium hover:underline">See All →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {jobs.map((job, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group cursor-pointer">
                                <p className="font-bold text-white text-sm mb-1 group-hover:text-primary transition-colors">{job.title}</p>
                                <p className="text-xs text-text-secondary mb-3">{job.companyName || 'Company'}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        {job.jobType?.replace('_', ' ') || 'Full Time'}
                                    </span>
                                    {job.location && (
                                        <span className="text-xs text-text-secondary">{job.location}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
