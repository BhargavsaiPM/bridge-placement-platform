import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { officerApi } from '../../api/officerApi';
import JobTable from '../../components/company/JobTable';

const sortJobsByRecent = (items) =>
    [...items].sort((first, second) => {
        const firstDate = first?.createdAt ? new Date(first.createdAt).getTime() : 0;
        const secondDate = second?.createdAt ? new Date(second.createdAt).getTime() : 0;
        return secondDate - firstDate;
    });

export default function OfficerJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await officerApi.getJobs();
            const fetchedJobs = Array.isArray(res.data) ? sortJobsByRecent(res.data) : [];
            setJobs(fetchedJobs);
        } catch (err) {
            console.error('Failed to load jobs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div>
                <h1 className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-3xl font-bold text-transparent">
                    Manage Assigned Jobs
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Click a job to view the full hiring brief, required skills, qualifications, and assigned ownership details.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent"></div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="glass-panel rounded-[28px] border border-white/10 px-6 py-16 text-center">
                    <h2 className="text-xl font-semibold text-white">No jobs assigned yet</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        Jobs assigned by your company will appear here. Once a role is assigned, you can open it and review the full requirement details.
                    </p>
                </div>
            ) : (
                <JobTable
                    jobs={jobs}
                    applicantsBasePath="/officer/applicants"
                    detailBasePath="/officer/jobs"
                    canEdit={false}
                    canClose={false}
                />
            )}
        </motion.div>
    );
}
