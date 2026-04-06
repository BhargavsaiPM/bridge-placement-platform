import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import logoImg from '../../assets/Bridge-logo.png';
import { getDashboardPathForPayload, getStoredTokenPayload } from '../../utils/auth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authApi.login({ email, password });
            const token = res.data.token || res.data;

            if (token && typeof token === 'string') {
                localStorage.setItem('token', token);
                const payload = getStoredTokenPayload();
                navigate(getDashboardPathForPayload(payload));
            } else {
                throw new Error("Invalid token format received");
            }
        } catch (err) {
            console.error("Login failed", err);
            const backendError = err.response?.data?.message || err.response?.data;
            if (typeof backendError === 'string' && backendError.toLowerCase().includes('blocked')) {
                setError(backendError);
            } else if (typeof backendError === 'string' && backendError.length < 100) {
                setError(backendError);
            } else {
                setError("Invalid credentials or server error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary overflow-x-hidden font-sans relative flex flex-col items-center justify-center">

            {/* Animated Background Mesh (From Home) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-blob" />
                <div className="absolute top-[20%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-secondary/20 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-accent/15 blur-[150px] mix-blend-screen animate-blob animation-delay-4000" />
            </div>

            {/* Floating Glass Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}
            >
                <div className={`flex items-center justify-between rounded-full px-6 py-2 ${isScrolled ? 'glass-nav' : 'bg-transparent'}`}>
                    {/* Left: Logo */}
                    <div className="flex items-center flex-1 justify-start">
                        <Link to="/" className="inline-block">
                            <img
                                src={logoImg}
                                alt="Bridge Logo"
                                className="h-20 md:h-24 w-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-300 relative z-10 drop-shadow-[0_0_15px_rgba(77,163,255,0.3)]"
                            />
                        </Link>
                    </div>

                    {/* Right: Register Link */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <Link
                            to="/register"
                            className="px-6 py-2.5 rounded-full font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 text-base shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-2"
                        >
                            Need an account ? <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Login Card wrapper - Increased size to 2x (e.g. max-w-[800px] or max-w-4xl) */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[800px] px-4 relative z-10 mt-28 md:mt-32"
            >
                <div className="glass-panel px-10 py-16 md:px-14 md:py-20 lg:px-16 lg:py-24 flex flex-col relative overflow-visible shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[500px] md:min-h-[600px] justify-center">

                    {/* Floating icon for trust */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary p-[1px] shadow-[0_0_40px_rgba(58,130,246,0.6)]">
                        <div className="w-full h-full rounded-3xl bg-surface-glass backdrop-blur-md flex items-center justify-center">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center mt-6 mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
                        <p className="text-sm text-text-muted">Sign in to your account securely</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-6 pt-4">
                            {/* Email Field with Floating Label */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <Mail className="h-5 w-5 text-white/50 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-lg"
                                    placeholder="Email Address"
                                />
                                <label
                                    htmlFor="email"
                                    className={`absolute left-12 transform transition-all duration-300 pointer-events-none 
                                        ${email ? 'text-xs top-2 -translate-y-0 text-white/80' : 'text-base top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`
                                    }
                                >
                                    Email Address
                                </label>
                            </div>

                            {/* Password Field with Floating Label and Toggle */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <Lock className="h-5 w-5 text-white/50 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="peer w-full pl-12 pr-12 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-lg"
                                    placeholder="Password"
                                />
                                <label
                                    htmlFor="password"
                                    className={`absolute left-12 transform transition-all duration-300 pointer-events-none
                                        ${password ? 'text-xs top-2 -translate-y-0 text-white/80' : 'text-base top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`
                                    }
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-colors"
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            <div className="flex justify-end pr-1">
                                <Link to="/forgot-password" className="text-sm text-primary hover:text-white transition-colors font-medium">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 bg-white text-background font-bold px-6 py-4 rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] text-lg"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
