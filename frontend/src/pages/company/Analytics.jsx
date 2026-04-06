import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { companyApi } from '../../api/companyApi';

const COLORS = ['#2CE6B3', '#4DA3FF', '#FFB84D', '#FF5A7A', '#7B61FF'];

const countBy = (items, selector, fallbackLabel) => {
    const counts = new Map();

    items.forEach((item) => {
        const key = selector(item) || fallbackLabel;
        counts.set(key, (counts.get(key) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
};

export default function Analytics() {
    const [jobs, setJobs] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalyticsSourceData = async () => {
            try {
                const [jobsResponse, selectedStudentsResponse] = await Promise.all([
                    companyApi.getJobs(),
                    companyApi.getSelectedStudents(),
                ]);

                setJobs(Array.isArray(jobsResponse.data) ? jobsResponse.data : []);
                setSelectedStudents(Array.isArray(selectedStudentsResponse.data) ? selectedStudentsResponse.data : []);
            } catch (error) {
                console.error('Failed to load company analytics source data', error);
                setJobs([]);
                setSelectedStudents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsSourceData();
    }, []);

    const openJobs = useMemo(
        () => jobs.filter((job) => String(job.status || '').toUpperCase() === 'OPEN').length,
        [jobs]
    );
    const selectedByRole = useMemo(
        () => countBy(selectedStudents, (student) => student.role, 'Unassigned Role'),
        [selectedStudents]
    );
    const selectedByPackage = useMemo(
        () => countBy(selectedStudents, (student) => student.salaryRange, 'Package Pending'),
        [selectedStudents]
    );
    const pipelineMix = useMemo(
        () => [
            { name: 'Open Jobs', value: openJobs },
            { name: 'Closed Jobs', value: Math.max(0, jobs.length - openJobs) },
        ],
        [jobs.length, openJobs]
    );

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                    Recruitment Analytics
                </h1>
                <p className="text-text-secondary mt-1 text-sm">
                    Live company insights generated from the jobs and selected-candidates data that already exists.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">Total Jobs</p>
                    <p className="mt-3 text-3xl font-bold text-white">{jobs.length}</p>
                </div>
                <div className="glass-panel p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">Open Jobs</p>
                    <p className="mt-3 text-3xl font-bold text-white">{openJobs}</p>
                </div>
                <div className="glass-panel p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">Selected Candidates</p>
                    <p className="mt-3 text-3xl font-bold text-white">{selectedStudents.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Job Pipeline Mix</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pipelineMix} dataKey="value" nameKey="name" innerRadius={60} outerRadius={82}>
                                    {pipelineMix.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Selected Candidates by Role</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={selectedByRole}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#9FB0D9" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#9FB0D9" allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#4DA3FF" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-6">Selected Candidates by Offered Package</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={selectedByPackage}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#9FB0D9" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#9FB0D9" allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#2CE6B3" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
