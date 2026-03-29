import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    Clock,
    FileText,
    TrendingUp,
    User,
    Users,
    X,
} from 'lucide-react';
import { userApi } from '../../api/userApi';
import { publicApi } from '../../api/publicApi';

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
                    publicApi.searchJobs(),
                ]);

                if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
                if (appsRes.status === 'fulfilled') {
                    setApplications(Array.isArray(appsRes.value.data) ? appsRes.value.data : []);
                }
                if (jobsRes.status === 'fulfilled') {
                    setJobs(Array.isArray(jobsRes.value.data) ? jobsRes.value.data.slice(0, 3) : []);
                }
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const getApplicationStatus = (application) => application.status || application.applicationStatus || 'APPLIED';
    const getDisplayName = () => {
        if (!profile) return '';
        return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    };

    const countByStatus = (status) => applications.filter((application) => getApplicationStatus(application) === status).length;

    const stats = [
        { label: 'Total Applied', value: applications.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Pending', value: countByStatus('APPLIED'), icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
        { label: 'Shortlisted', value: countByStatus('SHORTLISTED'), icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
        { label: 'Interviews', value: countByStatus('INTERVIEW'), icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Selected', value: countByStatus('SELECTED'), icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
        { label: 'Rejected', value: countByStatus('REJECTED'), icon: X, color: 'text-danger', bg: 'bg-danger/10' },
    ];

    const fields = ['firstName', 'lastName', 'email', 'mobile', 'dob', 'skills', 'resumeUrl', 'githubLink'];
    const filledFields = profile
        ? fields.filter((field) => profile[field] && (Array.isArray(profile[field]) ? profile[field].length > 0 : true)).length
        : 0;
    const completeness = profile ? Math.round((filledFields / fields.length) * 100) : 0;

    const recentApplications = [...applications].slice(0, 5);

    const quickActions = [
        {
            label: 'Browse Jobs',
            icon: Briefcase,
            to: '/user/jobs',
            color: 'from-primary/20 to-primary/5 border-primary/30 hover:border-primary/60',
        },
        {
            label: 'My Applications',
            icon: FileText,
            to: '/user/applications',
            color: 'from-secondary/20 to-secondary/5 border-secondary/30 hover:border-secondary/60',
        },
        {
            label: 'Edit Profile',
            icon: User,
            to: '/user/profile',
            color: 'from-success/20 to-success/5 border-success/30 hover:border-success/60',
        },
    ];

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-4 md:p-6">
            <div>
                <h1 className="mb-1 text-3xl font-bold text-white">
                    Welcome Back{getDisplayName() ? `, ${getDisplayName().split(' ')[0]}` : ''}!
                </h1>
                <p className="text-text-secondary">Here&apos;s your placement journey at a glance.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.07 }}
                            className="glass-panel flex flex-col items-start gap-2 p-4"
                        >
                            <div className={`rounded-lg p-2 ${stat.bg}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                            <p className="text-xs font-medium text-text-secondary">{stat.label}</p>
                            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="glass-panel flex flex-col p-6 lg:col-span-2">
                    <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-lg font-bold text-white">Recent Applications</h3>
                        <Link
                            to="/user/applications"
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            View All <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {recentApplications.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                            <Briefcase className="mb-3 h-10 w-10 text-white/20" />
                            <p className="text-sm text-text-secondary">No applications yet.</p>
                            <Link to="/user/jobs" className="mt-3 text-sm font-medium text-primary hover:underline">
                                Browse Jobs
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentApplications.map((application, index) => {
                                const config = STATUS_CONFIG[getApplicationStatus(application)] || STATUS_CONFIG.APPLIED;

                                return (
                                    <div
                                        key={application.id || index}
                                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:border-white/20"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {application.job?.title || 'Job Title'}
                                            </p>
                                            <p className="text-xs text-text-secondary">
                                                {application.job?.company?.name || 'Company'}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.color} ${config.border}`}
                                        >
                                            {config.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="mb-4 text-base font-bold text-white">Profile Completion</h3>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-text-secondary">Completeness</span>
                            <span className="text-sm font-bold text-white">{completeness}%</span>
                        </div>
                        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completeness}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                            />
                        </div>
                        {completeness < 100 && (
                            <Link to="/user/profile" className="text-xs text-primary hover:underline">
                                Complete your profile
                            </Link>
                        )}
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="mb-4 text-base font-bold text-white">Quick Actions</h3>
                        <div className="space-y-3">
                            {quickActions.map(({ label, icon: Icon, to, color }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`group flex items-center gap-3 rounded-xl border bg-gradient-to-r p-3 transition-all ${color}`}
                                >
                                    <Icon className="h-4 w-4 text-white" />
                                    <span className="text-sm font-medium text-white">{label}</span>
                                    <ArrowRight className="ml-auto h-3 w-3 text-white/50 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {jobs.length > 0 && (
                <div className="glass-panel p-6">
                    <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-lg font-bold text-white">Recommended Jobs</h3>
                        <Link to="/user/jobs" className="text-sm font-medium text-primary hover:underline">
                            See All
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {jobs.map((job, index) => (
                            <div
                                key={job.id || index}
                                className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-primary/30"
                            >
                                <p className="mb-1 text-sm font-bold text-white transition-colors group-hover:text-primary">
                                    {job.title}
                                </p>
                                <p className="mb-3 text-xs text-text-secondary">{job.companyName || 'Company'}</p>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                        {job.jobType?.replace(/_/g, ' ') || 'Full Time'}
                                    </span>
                                    {job.location && <span className="text-xs text-text-secondary">{job.location}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
