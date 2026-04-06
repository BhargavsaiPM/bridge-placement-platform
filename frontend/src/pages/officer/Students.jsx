import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { officerApi } from '../../api/officerApi';
import { Users, Briefcase, CheckCircle2 } from 'lucide-react';

export default function OfficerStudents() {
    const [jobs, setJobs] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const selectedJobId = searchParams.get('jobId');

    useEffect(() => {
        const fetchJobsAndUsers = async () => {
            try {
                const res = await officerApi.getJobs();
                const jobsData = Array.isArray(res.data) ? res.data : [];
                setJobs(jobsData);

                const scopedJobs = selectedJobId
                    ? jobsData.filter((job) => String(job.id) === selectedJobId)
                    : jobsData;

                const appResponses = await Promise.all(
                    scopedJobs.map(async (job) => {
                        const appRes = await officerApi.getApplicationsForJob(job.id);
                        const items = Array.isArray(appRes.data?.applications) ? appRes.data.applications : [];
                        return items
                            .filter((app) => (app.status || app.applicationStatus) === 'SHORTLISTED')
                            .map((app) => ({
                                ...app,
                                jobTitle: job.title,
                                jobId: job.id,
                            }));
                    })
                );

                setSelectedUsers(appResponses.flat());
            } catch (err) {
                console.error('Failed to load selected users:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobsAndUsers();
    }, [selectedJobId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    Selected Users
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Users who were shortlisted from your job applications.</p>
            </div>

            {selectedUsers.length === 0 ? (
                <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                    <Users className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Selected Users Yet</h3>
                    <p className="text-text-secondary text-sm">Users will appear here once they are marked as "Shortlisted" in the applicant review process.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedUsers.map((student, i) => (
                        <motion.div
                            key={student.id || i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-panel p-5 flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold">
                                    {(student.user?.fullName || student.user?.firstName || 'S').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{student.user?.fullName || [student.user?.firstName, student.user?.lastName].filter(Boolean).join(' ') || 'User'}</p>
                                    <p className="text-xs text-text-secondary">{student.user?.email || ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>{student.jobTitle}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-auto">
                                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-primary/10 text-primary border border-primary/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Shortlisted
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
