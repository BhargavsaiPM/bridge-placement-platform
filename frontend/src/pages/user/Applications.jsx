import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userApi } from '../../api/userApi';
import { CalendarClock, ExternalLink, FileText, Briefcase, Clock, CheckCircle2, X, Users, TrendingUp } from 'lucide-react';

const STATUS_CONFIG = {
    APPLIED: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
    SHORTLISTED: { label: 'Shortlisted', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
    INTERVIEW: { label: 'Interview', color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/30' },
    TECHNICAL_ROUND: { label: 'Technical Round', color: 'text-cyan-300', bg: 'bg-cyan-400/10', border: 'border-cyan-300/30' },
    SELECTED: { label: 'Selected', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
    REJECTED: { label: 'Rejected', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' },
};

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const [interviewsByApplicationId, setInterviewsByApplicationId] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await userApi.getApplications();
                const applicationList = Array.isArray(res.data) ? res.data : [];
                setApplications(applicationList);

                const interviewCandidates = applicationList.filter((application) =>
                    ['INTERVIEW', 'TECHNICAL_ROUND'].includes(getStatus(application))
                );

                const interviewResponses = await Promise.allSettled(
                    interviewCandidates.map(async (application) => {
                        const response = await userApi.getInterviewDetails(application.id);
                        return [application.id, response.data];
                    })
                );

                const nextInterviews = {};
                interviewResponses.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        const [applicationId, interview] = result.value;
                        nextInterviews[applicationId] = interview;
                    }
                });
                setInterviewsByApplicationId(nextInterviews);
            } catch (err) {
                console.error('Failed to load applications:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const getStatus = (application) => application.status || application.applicationStatus || 'APPLIED';

    const filtered = filter === 'ALL' ? applications : applications.filter(a => getStatus(a) === filter);

    const filters = [
        { key: 'ALL', label: 'All', icon: FileText },
        { key: 'APPLIED', label: 'Pending', icon: Clock },
        { key: 'SHORTLISTED', label: 'Shortlisted', icon: Users },
        { key: 'INTERVIEW', label: 'Interview', icon: TrendingUp },
        { key: 'TECHNICAL_ROUND', label: 'Technical Round', icon: TrendingUp },
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
                        const cfg = STATUS_CONFIG[getStatus(app)] || STATUS_CONFIG['APPLIED'];
                        const interview = interviewsByApplicationId[app.id];
                        return (
                            <motion.div
                                key={app.id || i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="glass-panel p-5 hover:border-white/20 transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
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
                                </div>

                                {interview && (
                                    <div className="mt-4 rounded-2xl border border-secondary/20 bg-secondary/10 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-secondary">Interview Scheduled</p>
                                                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white">
                                                    <CalendarClock className="w-4 h-4 text-secondary" />
                                                    {new Date(interview.scheduledAt).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                                <p className="mt-1 text-xs text-text-secondary">
                                                    Mode: {String(interview.mode || '').replace('_', ' ')}
                                                </p>
                                            </div>

                                            {interview.meetingLink ? (
                                                <a
                                                    href={interview.meetingLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-background hover:bg-secondary/90 transition-colors"
                                                >
                                                    Join Link
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            ) : null}
                                        </div>

                                        {interview.venue && (
                                            <p className="mt-3 text-sm text-white/80">Venue: {interview.venue}</p>
                                        )}
                                        {interview.additionalNotes && (
                                            <p className="mt-2 text-sm text-text-secondary">{interview.additionalNotes}</p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
