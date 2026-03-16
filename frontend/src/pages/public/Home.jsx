import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, ArrowRight, Sparkles, Search, ChevronRight } from 'lucide-react';
import axios from 'axios';
import logoImg from '../../assets/Bridge-logo.png';

export default function Home() {
    const [stats, setStats] = useState({
        totalCompanies: 0,
        totalJobs: 0,
        activeJobs: 0,
        studentsPlaced: 0
    });

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Fetch stats from existing public endpoint
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:9092/api/public/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch public stats", err);
                // Fallback dummy data
                setStats({
                    totalCompanies: 154,
                    totalJobs: 892,
                    studentsPlaced: 3420
                });
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-background text-text-primary overflow-x-hidden font-sans relative">
            
            {/* Animated Background Mesh (Google AI Studio aesthetic) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-blob" />
                <div className="absolute top-[20%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-secondary/20 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-accent/15 blur-[150px] mix-blend-screen animate-blob animation-delay-4000" />
            </div>

            {/* Apple-style floating Glass Navbar */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}
            >
                <div className={`flex items-center justify-between rounded-full px-6 py-2 ${isScrolled ? 'glass-nav' : 'bg-transparent'}`}>
                    
                    {/* Left: Logo Image */}
                    <div className="flex items-center flex-1 justify-start">
                        <Link to="/" className="inline-block">
                            <img 
                                src={logoImg} 
                                alt="Bridge Logo" 
                                className="h-24 md:h-28 w-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-300 relative z-10 drop-shadow-[0_0_15px_rgba(77,163,255,0.3)]" 
                            />
                        </Link>
                    </div>

                    {/* Center: Search Bar */}
                    <div className="flex-[2] flex justify-center hidden md:flex px-4">
                        <div className="relative group w-full max-w-2xl">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur transition-all group-hover:bg-primary/30" />
                            <div className="relative flex items-center bg-surface-glass border border-white/10 rounded-full px-5 py-3 hover:border-white/20 transition-colors">
                                <Search className="w-5 h-5 text-text-secondary mr-3" />
                                <input 
                                    type="text" 
                                    placeholder="Search jobs, skills, companies..." 
                                    className="bg-transparent border-none outline-none text-base w-full text-white placeholder:text-text-muted"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Auth Buttons */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <Link
                            to="/login"
                            className="px-5 py-2 rounded-full font-medium text-text-secondary hover:text-white transition-colors text-sm"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2 rounded-full font-medium text-white bg-white/10 border border-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-300 text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Main Content Area */}
            <main className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen">
                
                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-text-secondary tracking-widest uppercase">The Future of Placement</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-6xl md:text-8xl font-bold tracking-tighter text-white leading-[1.1] mb-6"
                    >
                        Unlock Your <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">Brilliant Future.</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 font-light"
                    >
                        {/* Bridging the gap between campus and corporate. Elevating your career journey with smart, seamless placement automation. */}
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
                    >
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-background bg-white hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                        >
                            Join the Network
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/jobs"
                            className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-white glass-panel hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Briefcase className="w-5 h-5 opacity-70" />
                            Explore Opportunities
                        </Link>
                    </motion.div>
                </div>

                {/* Bento Box Stats Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="w-full max-w-5xl mt-32 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* Stat Card 1 */}
                    <div className="glass-panel p-8 md:col-span-1 flex flex-col justify-between group">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-12 text-primary">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-5xl font-bold tracking-tight text-white mb-2 group-hover:scale-105 transition-transform origin-left">{(stats?.totalCompanies || 0).toLocaleString()}</div>
                            <div className="text-sm font-medium text-text-muted uppercase tracking-wider">Partner Companies</div>
                        </div>
                    </div>

                    {/* Stat Card 2 (Wide) */}
                    <div className="glass-panel p-8 md:col-span-2 flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/30 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center mb-12 text-secondary">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-6xl font-bold tracking-tight text-white mb-2 group-hover:scale-105 transition-transform origin-left">{(stats?.studentsPlaced || 0).toLocaleString()}+</div>
                                    <div className="text-sm font-medium text-text-muted uppercase tracking-wider">Careers Launched</div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-secondary font-medium">
                                    <span>View Success Stories</span>
                                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured / Third Card */}
                    <div className="glass-panel p-8 md:col-span-3 flex flex-col sm:flex-row items-center justify-between group">
                         <div className="flex items-center gap-6 mb-6 sm:mb-0">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                                <Briefcase className="w-8 h-8 opacity-80" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white tracking-tight">{(stats?.activeJobs || stats?.totalJobs || 0).toLocaleString()}</div>
                                <div className="text-sm text-text-muted">Active Job Requisitions</div>
                            </div>
                         </div>
                         <Link to="/jobs" className="px-6 py-3 rounded-full bg-white/10 border border-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                             Browse All Jobs <ArrowRight className="w-4 h-4" />
                         </Link>
                    </div>
                </motion.div>
                
                {/* Footer simple text */}
                <div className="mt-32 text-center text-text-muted text-sm pb-8">
                    &copy; 2026 Bridge Placement Platform. All rights reserved.
                </div>
            </main>
        </div>
    );
}
