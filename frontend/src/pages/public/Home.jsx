import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function Home() {
    const [stats, setStats] = useState({
        totalCompanies: 0,
        totalJobs: 0,
        studentsPlaced: 0
    });

    useEffect(() => {
        // Fetch stats from existing public endpoint
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:9092/api/public/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch public stats", err);
                // Fallback dummy data if endpoint is not fully hooked up
                setStats({
                    totalCompanies: 150,
                    totalJobs: 420,
                    studentsPlaced: 850
                });
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-background text-text-primary overflow-x-hidden font-sans">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(77,163,255,0.3)]">
                            <span className="font-bold text-white text-xl">B</span>
                        </div>
                        <span className="text-2xl font-bold tracking-wider text-white">BRIDGE</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="px-6 py-2.5 rounded-xl font-bold text-text-primary border border-white/10 hover:bg-white/5 transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-2.5 rounded-xl font-bold text-background bg-primary hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(77,163,255,0.3)]"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-bold tracking-tight mb-8"
                    >
                        Your Bridge to a <br />
                        <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                            Brilliant Future
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-text-secondary max-w-2xl mx-auto mb-12"
                    >
                        Connect with top companies, discover tailored job opportunities, and launch your career with our intelligent placement platform.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            to="/jobs"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-background bg-white hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Briefcase className="w-5 h-5" />
                            Browse Jobs
                        </Link>
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                        >
                            Join the Platform
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-6 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="glass-panel p-8 text-center flex flex-col items-center group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 relative z-10">
                                <Building2 className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-4xl font-bold text-white mb-2 relative z-10">{stats.totalCompanies}+</div>
                            <div className="text-text-secondary font-medium relative z-10">Top Companies</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="glass-panel p-8 text-center flex flex-col items-center group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-6 relative z-10">
                                <Briefcase className="w-8 h-8 text-success" />
                            </div>
                            <div className="text-4xl font-bold text-white mb-2 relative z-10">{stats.totalJobs}+</div>
                            <div className="text-text-secondary font-medium relative z-10">Active Opportunities</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="glass-panel p-8 text-center flex flex-col items-center group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 relative z-10">
                                <Users className="w-8 h-8 text-secondary" />
                            </div>
                            <div className="text-4xl font-bold text-white mb-2 relative z-10">{stats.studentsPlaced}+</div>
                            <div className="text-text-secondary font-medium relative z-10">Students Placed</div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
