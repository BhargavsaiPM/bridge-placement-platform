import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { officerApi } from '../../api/officerApi';
import { Users, Briefcase, UserCheck, ChevronDown } from 'lucide-react';

const STATUS_CONFIG = {
    APPLIED: { label: 'Applied', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
    SHORTLISTED: { label: 'Shortlisted', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
    INTERVIEW: { label: 'Interview', color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/30' },
    SELECTED: { label: 'Selected', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
    REJECTED: { label: 'Rejected', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' },
};

export default function OfficerApplicants() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await officerApi.getJobs();
                setJobs(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to load jobs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Flatten all applications from all jobs
    const allApplications = jobs.flatMap(job =>
        (job.applications || []).map(app => ({
            ...app,
            jobTitle: job.title,
            jobId: job.id,
        }))
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    Applicants
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Review applications across all your job postings.</p>
            </div>

            {allApplications.length === 0 ? (
                <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                    <Users className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Applicants Yet</h3>
                    <p className="text-text-secondary text-sm">Applications will appear here once students apply to your job postings.</p>
                </div>
            ) : (
                <div className="glass-panel overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-text-secondary">
                                <th className="px-6 py-4 font-medium">Applicant</th>
                                <th className="px-6 py-4 font-medium">Job</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Applied</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {allApplications.map((app, i) => {
                                const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG['APPLIED'];
                                return (
                                    <tr key={app.id || i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">
                                                    {(app.user?.name || 'U').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{app.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-text-secondary">{app.user?.email || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{app.jobTitle}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary text-xs">
                                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}
