import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

export default function Analytics() {
    const [placementStats, setPlacementStats] = useState([]);
    const [studentPerf, setStudentPerf] = useState([]);
    const [recruiterEng, setRecruiterEng] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            adminApi.getPlacementStats().catch(() => ({ data: [] })),
            adminApi.getStudentPerformance().catch(() => ({ data: [] })),
            adminApi.getRecruiterEngagement().catch(() => ({ data: [] }))
        ]).then(([placementsRes, studentsRes, recruitersRes]) => {
            // Assuming array data for charts. If objects, it needs transformation.
            // We will safeguard by forcing array.
            setPlacementStats(Array.isArray(placementsRes.data) ? placementsRes.data : []);
            setStudentPerf(Array.isArray(studentsRes.data) ? studentsRes.data : []);
            setRecruiterEng(Array.isArray(recruitersRes.data) ? recruitersRes.data : []);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const COLORS = ['#4DA3FF', '#2CE6B3', '#7B61FF', '#FFB84D', '#FF5A7A'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                    Platform Analytics
                </h1>
                <p className="text-text-secondary mt-1 text-sm">In-depth insights into placements and performance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Placement Stats Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Placement Trends</h3>
                    <div className="h-[300px] w-full">
                        {placementStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={placementStats}>
                                    <defs>
                                        <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4DA3FF" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#4DA3FF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9FB0D9" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9FB0D9" fontSize={12} tickLine={false} axisLine={false} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0F1629', borderColor: '#ffffff10', borderRadius: '8px' }}
                                        itemStyle={{ color: '#E6ECFF' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#4DA3FF" fillOpacity={1} fill="url(#colorPlacements)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-secondary text-sm">No placement data available</div>
                        )}
                    </div>
                </div>

                {/* Recruiter Engagement Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Recruiter Engagement</h3>
                    <div className="h-[300px] w-full">
                        {recruiterEng.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={recruiterEng}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9FB0D9" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9FB0D9" fontSize={12} tickLine={false} axisLine={false} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: '#0F1629', borderColor: '#ffffff10', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" fill="#7B61FF" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-secondary text-sm">No engagement data available</div>
                        )}
                    </div>
                </div>

                {/* Student Performance */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-6">Student Performance Distribution</h3>
                    <div className="h-[300px] w-full flex">
                        {studentPerf.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={studentPerf}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {studentPerf.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0F1629', borderColor: '#ffffff10', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-text-secondary text-sm">No performance data available</div>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
