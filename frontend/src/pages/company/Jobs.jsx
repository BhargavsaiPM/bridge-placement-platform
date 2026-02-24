import React, { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { motion } from 'framer-motion';
import { authApi } from '../../api/authApi'; // We need an API call for creating job. Wait, is it companyApi or authApi? It's companyApi.
import JobTable from '../../components/company/JobTable';
import JobModal from '../../components/company/JobModal';
import { Plus } from 'lucide-react';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);

    const fetchJobs = async () => {
        try {
            const res = await companyApi.getJobs();
            setJobs(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to load jobs", err);
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
        if (jobId) {
            // Update
            await companyApi.updateJob(jobId, jobData);
        } else {
            // Create -> POST /company/job exists in JobController. Let's add it to companyApi first.
            await companyApi.createJob(jobData);
        }
        await fetchJobs(); // refresh the list
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                        Job Requisitions
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">View and manage all jobs posted by your placement officers.</p>
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
            ) : (
                <JobTable
                    jobs={jobs}
                    onCloseJob={handleCloseJob}
                    onEditJob={handleEditJob}
                />
            )}

            <JobModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveJob}
                jobToEdit={jobToEdit}
            />
        </motion.div>
    );
}
