import React, { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { publicApi } from '../../api/publicApi';
import { motion } from 'framer-motion';
import JobTable from '../../components/company/JobTable';
import JobModal from '../../components/company/JobModal';
import { BriefcaseBusiness, Plus } from 'lucide-react';

const sortJobsByRecent = (items) =>
    [...items].sort((first, second) => {
        const firstDate = first?.createdAt ? new Date(first.createdAt).getTime() : 0;
        const secondDate = second?.createdAt ? new Date(second.createdAt).getTime() : 0;
        return secondDate - firstDate;
    });

const matchesCompanyJob = (job, companyProfile) => {
    const companyName = companyProfile?.name?.trim().toLowerCase();
    if (!companyName) return false;

    if (job.company?.id && companyProfile?.id && job.company.id === companyProfile.id) return true;
    if (job.company?.name?.trim().toLowerCase() === companyName) return true;
    if (job.companyName?.trim().toLowerCase() === companyName) return true;

    return false;
};

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);
    const [error, setError] = useState('');

    const loadFallbackJobs = async (companyProfile) => {
        if (!companyProfile) return [];

        const publicJobsResponse = await publicApi.searchJobs('', '');
        const publicJobs = Array.isArray(publicJobsResponse.data) ? publicJobsResponse.data : [];
        return sortJobsByRecent(publicJobs.filter((job) => matchesCompanyJob(job, companyProfile)));
    };

    const fetchJobs = async () => {
        setLoading(true);
        setError('');

        try {
            const [jobsResponse, profileResponse, officersResponse] = await Promise.all([
                companyApi.getJobs(),
                companyApi.getProfile(),
                companyApi.getOfficers(),
            ]);

            const companyJobs = Array.isArray(jobsResponse.data) ? sortJobsByRecent(jobsResponse.data) : [];
            setOfficers(Array.isArray(officersResponse.data) ? officersResponse.data : []);

            if (companyJobs.length > 0) {
                setJobs(companyJobs);
                return;
            }

            const fallbackJobs = await loadFallbackJobs(profileResponse.data);
            setJobs(fallbackJobs);
        } catch (err) {
            console.error('Failed to load jobs', err);

            try {
                const [profileResponse, officersResponse] = await Promise.all([
                    companyApi.getProfile(),
                    companyApi.getOfficers(),
                ]);
                const fallbackJobs = await loadFallbackJobs(profileResponse.data);
                setJobs(fallbackJobs);
                setOfficers(Array.isArray(officersResponse.data) ? officersResponse.data : []);

                if (fallbackJobs.length === 0) {
                    setError('Posted jobs are not loading right now. Please refresh once after a new post.');
                }
            } catch (fallbackError) {
                console.error('Fallback company jobs load failed', fallbackError);
                setJobs([]);
                setOfficers([]);
                setError('Failed to load posted jobs.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleCloseJob = async (id) => {
        if (!window.confirm("Are you sure you want to close this job early?")) return;
        try {
            await companyApi.closeJob(id);
            setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'CLOSED' } : j));
        } catch (err) {
            alert("Failed to close job.");
        }
    };

    const handleEditJob = (job) => {
        setJobToEdit(job);
        setIsModalOpen(true);
    };

    const handleOpenCreateModal = () => {
        setJobToEdit(null);
        setIsModalOpen(true);
    };

    const handleSaveJob = async (jobData, jobId) => {
        let response;

        if (jobId) {
            response = await companyApi.updateJob(jobId, jobData);
        } else {
            response = await companyApi.createJob(jobData);
        }

        if (response?.data) {
            const savedJob = response.data;
            setJobs((currentJobs) =>
                sortJobsByRecent([savedJob, ...currentJobs.filter((job) => job.id !== savedJob.id)])
            );
        }

        setError('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {error && (
                <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                        Company Job Posts
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">Create and manage job openings posted directly by your company team.</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-success text-background font-bold hover:bg-success/90 rounded-xl transition-colors shadow-[0_0_15px_rgba(44,230,179,0.3)]"
                >
                    <Plus className="w-5 h-5" /> Post Job
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-success border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="glass-panel flex flex-col items-center justify-center rounded-[28px] border border-white/10 px-8 py-16 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-success/20 bg-success/10 text-success">
                        <BriefcaseBusiness className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">No job posts yet</h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
                        Create your first company job post and it will appear here with job type, location,
                        qualifications, and candidate pipeline details.
                    </p>
                    <button
                        onClick={handleOpenCreateModal}
                        className="mt-6 flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 font-bold text-background transition-colors hover:bg-success/90"
                    >
                        <Plus className="h-4 w-4" />
                        Post First Job
                    </button>
                </div>
            ) : (
                <JobTable
                    jobs={jobs}
                    onCloseJob={handleCloseJob}
                    onEditJob={handleEditJob}
                    detailBasePath="/company/jobs"
                />
            )}

            <JobModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveJob}
                jobToEdit={jobToEdit}
                officers={officers}
            />
        </motion.div>
    );
}
