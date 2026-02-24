import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { motion } from 'framer-motion';
import ApplicantKanban from '../../components/company/ApplicantKanban';

export default function Applicants() {
    const [searchParams] = useSearchParams();
    const initialJobId = searchParams.get('jobId') || '';

    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(initialJobId);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load jobs to populate selector
    useEffect(() => {
        companyApi.getJobs()
            .then(res => {
                const jobsData = Array.isArray(res.data) ? res.data : [];
                setJobs(jobsData);
                // Auto-select first job if none specified
                if (!initialJobId && jobsData.length > 0) {
                    setSelectedJobId(jobsData[0].id.toString());
                }
            })
            .catch(err => console.error("Failed to fetch jobs for applicant view", err));
    }, [initialJobId]);

    // Load applications when job selection changes
    useEffect(() => {
        if (!selectedJobId) {
            setLoading(false);
            return;
        }

        const fetchApps = async () => {
            setLoading(true);
            try {
                const res = await companyApi.getJobApplications(selectedJobId);
                setApplications(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to load applications", err);
            } finally {
                setLoading(false);
            }
        };

        fetchApps();

        // Poll for new applications
        const intervalId = setInterval(fetchApps, 15000);
        return () => clearInterval(intervalId);
    }, [selectedJobId]);

    const handleUpdateStatus = async (applicationId, updateData) => {
        try {
            // Optimistic kanban update
            setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, ...updateData } : app));
            await companyApi.updateApplicationStatus(applicationId, updateData);
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
            // Could revert state here
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                        Applicant Tracking
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">Drag and drop to update candidate progression.</p>
                </div>

                <div className="w-64">
                    <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="" disabled>Select a Job Requisition...</option>
                        {jobs.map(job => (
                            <option key={job.id} value={job.id}>{job.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedJobId ? (
                <div className="glass-panel p-12 text-center text-text-secondary">
                    Please select a job requisition to view applications.
                </div>
            ) : loading && applications.length === 0 ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <ApplicantKanban applications={applications} onUpdateStatus={handleUpdateStatus} />
            )}
        </motion.div>
    );
}
