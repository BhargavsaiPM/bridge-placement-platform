import React, { useEffect, useState } from 'react';
import { officerApi } from '../../api/officerApi';
import { motion } from 'framer-motion';
import JobTable from '../../components/company/JobTable';
import JobModal from '../../components/company/JobModal';
import { Plus } from 'lucide-react';

export default function OfficerJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await officerApi.getJobs();
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
            await officerApi.closeJob(id);
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
            await officerApi.updateJob(jobId, jobData);
        } else {
            await officerApi.createJob(jobData);
        }
        await fetchJobs();
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                        Manage Job Requisitions
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">Post and manage jobs on behalf of your company.</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-white font-bold hover:bg-secondary/90 rounded-xl transition-colors shadow-[0_0_15px_rgba(157,77,255,0.3)]"
                >
                    <Plus className="w-5 h-5" /> Post Job
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
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
