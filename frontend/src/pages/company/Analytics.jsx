import React, { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { motion } from 'framer-motion';
import {
    LineChart, Line,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#2CE6B3', '#4DA3FF', '#7B61FF', '#FFB84D', '#FF5A7A'];

export default function Analytics() {
    const [hiresData, setHiresData] = useState([]);
    const [successData, setSuccessData] = useState([]);
    const [appsData, setAppsData] = useState([]);
    const [packageData, setPackageData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [hires, success, apps, packages] = await Promise.all([
                    companyApi.getHiresMonthly(),
                    companyApi.getSuccessRate(),
                    companyApi.getAppsPerJob(),
                    companyApi.getPackageRole()
                ]);

                // Handle mock fallback data if backend endpoints are not seeded yet
                setHiresData(hires.data?.length ? hires.data : [{ month: 'Jan', hires: 0 }]);
                setSuccessData(success.data?.length ? success.data : [{ name: 'Data', value: 100 }]);
                setAppsData(apps.data?.length ? apps.data : [{ job: 'No Data', apps: 0 }]);
                setPackageData(packages.data?.length ? packages.data : [{ role: 'No Data', package: 0 }]);
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0F1629] border border-white/10 p-3 rounded-xl shadow-lg">
                    <p className="text-white font-bold">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

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
                <p className="text-text-secondary mt-1 text-sm">Visualize hiring trends, success rates, and comparative statistics.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Hires per Month - Line Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Hires per Month</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hiresData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#9FB0D9" />
                                <YAxis stroke="#9FB0D9" />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="hires" stroke="#2CE6B3" strokeWidth={3} dot={{ r: 4, fill: '#2CE6B3' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Success Rate - Pie Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Pipeline Conversion</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={successData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {successData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Applications Per Job - Bar Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Applications per Role</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={appsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="job" stroke="#9FB0D9" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#9FB0D9" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="apps" fill="#4DA3FF" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Package Offered - Bar Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Avg Package (LPA)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={packageData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" stroke="#9FB0D9" />
                                <YAxis dataKey="role" type="category" stroke="#9FB0D9" tick={{ fontSize: 12 }} width={100} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="package" fill="#7B61FF" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
