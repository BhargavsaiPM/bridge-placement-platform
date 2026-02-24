import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userApi } from '../../api/userApi';
import { FileText, Briefcase, Clock, CheckCircle2, X, Users, TrendingUp } from 'lucide-react';

const STATUS_CONFIG = {
    APPLIED: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
    SHORTLISTED: { label: 'Shortlisted', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
    INTERVIEW: { label: 'Interview', color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/30' },
    SELECTED: { label: 'Selected', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
    REJECTED: { label: 'Rejected', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' },
};

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await userApi.getApplications();
                setApplications(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to load applications:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);

    const filters = [
        { key: 'ALL', label: 'All', icon: FileText },
        { key: 'APPLIED', label: 'Pending', icon: Clock },
        { key: 'SHORTLISTED', label: 'Shortlisted', icon: Users },
        { key: 'INTERVIEW', label: 'Interview', icon: TrendingUp },
        { key: 'SELECTED', label: 'Selected', icon: CheckCircle2 },
        { key: 'REJECTED', label: 'Rejected', icon: X },
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
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">My Applications</h1>
                <p className="text-text-secondary">Track the status of all your job applications.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {filters.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === key
                            ? 'bg-primary/20 text-primary border-primary/30'
                            : 'bg-white/5 text-text-secondary border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                        {key === 'ALL' && <span className="ml-1 text-xs opacity-70">({applications.length})</span>}
                    </button>
                ))}
            </div>

            {/* Applications List */}
            {filtered.length === 0 ? (
                <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                    <Briefcase className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Applications Found</h3>
                    <p className="text-text-secondary text-sm">
                        {filter === 'ALL' ? "You haven't applied to any jobs yet." : `No applications with status "${filter}".`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((app, i) => {
                        const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG['APPLIED'];
                        return (
                            <motion.div
                                key={app.id || i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="glass-panel p-5 flex items-center justify-between hover:border-white/20 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{app.job?.title || 'Job Title'}</p>
                                        <p className="text-xs text-text-secondary">{app.job?.company?.name || 'Company'}</p>
                                        {app.appliedAt && (
                                            <p className="text-xs text-text-secondary mt-1">
                                                Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                    {cfg.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
