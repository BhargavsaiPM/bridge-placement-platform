import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { officerApi } from '../../api/officerApi';
import { GraduationCap, Briefcase, CheckCircle2 } from 'lucide-react';

export default function OfficerStudents() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await officerApi.getJobs();
                setJobs(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to load selected students:', err);
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

    // Get all selected students across all jobs
    const selectedStudents = jobs.flatMap(job =>
        (job.applications || [])
            .filter(app => app.status === 'SELECTED')
            .map(app => ({
                ...app,
                jobTitle: job.title,
                jobId: job.id,
            }))
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    Selected Students
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Students who have been selected through your job postings.</p>
            </div>

            {selectedStudents.length === 0 ? (
                <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                    <GraduationCap className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Selected Students Yet</h3>
                    <p className="text-text-secondary text-sm">Students will appear here once they are marked as "Selected" in the applicant review process.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedStudents.map((student, i) => (
                        <motion.div
                            key={student.id || i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-panel p-5 flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold">
                                    {(student.user?.name || 'S').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{student.user?.name || 'Student'}</p>
                                    <p className="text-xs text-text-secondary">{student.user?.email || ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>{student.jobTitle}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-auto">
                                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-success/10 text-success border border-success/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Selected
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
